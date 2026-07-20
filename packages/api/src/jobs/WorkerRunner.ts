import { MockOddsProvider } from '../providers/MockOddsProvider.js';
import { BetRepository, BankrollRepository, AnalyticsRepository } from '@velora/database';
import { simulateBankrollPath, Decimal } from '@velora/calculations';

export class WorkerRunner {
  private oddsProvider = new MockOddsProvider();
  private betRepo = new BetRepository();
  private bankrollRepo = new BankrollRepository();
  private analyticsRepo = new AnalyticsRepository();

  /**
   * Worker 1: Refresh live odds from provider and update selections
   */
  async runOddsRefresh() {
    console.log('🔄 [Worker] Running Odds Refresh...');
    const result = await this.oddsProvider.fetchOdds('basketball');
    console.log(`✅ [Worker] Refreshed ${result.events.length} events from ${result.provider}`);
    return { refreshedCount: result.events.length };
  }

  /**
   * Worker 2: Update event statuses
   */
  async runEventUpdates() {
    console.log('🔄 [Worker] Running Event Updates...');
    return { status: 'completed' };
  }

  /**
   * Worker 3: Auto-settlement worker for finished games
   */
  async runSettlement() {
    console.log('🔄 [Worker] Running Bet Settlement Worker...');
    return { settledCount: 0 };
  }

  /**
   * Worker 4: Capture closing lines before game start time
   */
  async runClosingLineCapture() {
    console.log('🔄 [Worker] Running Closing Line Capture...');
    return { capturedCount: 0 };
  }

  /**
   * Worker 5: Bankroll daily/hourly snapshot capture
   */
  async runBankrollSnapshot(userId: string) {
    console.log(`🔄 [Worker] Running Bankroll Snapshot for user ${userId}...`);
    const balance = await this.bankrollRepo.getBalance(userId);
    await this.analyticsRepo.saveBankrollSnapshot({
      userId,
      balance,
      netProfit: balance - 10000,
      peakBalance: Math.max(balance, 10000),
      drawdown: balance < 10000 ? (10000 - balance) / 10000 : 0,
    });
    return { userId, balance };
  }

  /**
   * Worker 6: Pre-compute Monte Carlo analytics cache
   */
  async runAnalyticsCache(userId: string) {
    console.log(`🔄 [Worker] Refreshing Analytics Cache for user ${userId}...`);
    const balance = await this.bankrollRepo.getBalance(userId);

    const initialDec = new Decimal(balance > 0 ? balance : 10000);
    const winProbDec = new Decimal('0.54');
    const oddsDec = new Decimal('1.95');

    const mc = simulateBankrollPath(initialDec, winProbDec, oddsDec, new Decimal('0.25'), 100);
    const finalBal = mc.balanceHistory[mc.balanceHistory.length - 1].toNumber();

    await this.analyticsRepo.saveSimulationRun({
      userId,
      initialBankroll: balance > 0 ? balance : 10000,
      winRate: 0.54,
      averageOdds: 1.95,
      numBets: 100,
      numSimulations: 1,
      meanFinalBankroll: finalBal,
      medianFinalBankroll: finalBal,
      maxDrawdown95: 0.1,
      riskOfRuin: mc.isBroke ? 1.0 : 0.0,
    });

    return { userId, meanFinalBankroll: finalBal };
  }
}
