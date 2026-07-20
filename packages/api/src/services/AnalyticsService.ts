import { BetRepository, BankrollRepository, AnalyticsRepository } from '@velora/database';
import { calculateMaxDrawdown, simulateBankrollPath, Decimal } from '@velora/calculations';

export class AnalyticsService {
  private betRepo: BetRepository;
  private bankrollRepo: BankrollRepository;
  private analyticsRepo: AnalyticsRepository;

  constructor(
    betRepo = new BetRepository(),
    bankrollRepo = new BankrollRepository(),
    analyticsRepo = new AnalyticsRepository()
  ) {
    this.betRepo = betRepo;
    this.bankrollRepo = bankrollRepo;
    this.analyticsRepo = analyticsRepo;
  }

  async getAnalytics(userId: string) {
    const bets = await this.betRepo.getBetsByUserId(userId, { limit: 500 });
    const currentBalance = await this.bankrollRepo.getBalance(userId);
    const ledger = await this.bankrollRepo.getHistory(userId, 500);

    const settledBets = bets.filter((b) => b.status === 'won' || b.status === 'lost' || b.status === 'push');
    const totalBets = bets.length;
    const totalStaked = settledBets.reduce((acc, b) => acc + b.stake, 0);

    let totalProfit = 0;
    let wins = 0;
    let losses = 0;
    let pushes = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    const oddsList: number[] = [];

    settledBets.reverse().forEach((b) => {
      oddsList.push(b.oddsDecimal);
      if (b.status === 'won') {
        const profit = b.stake * (b.oddsDecimal - 1);
        totalProfit += profit;
        wins++;
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (b.status === 'lost') {
        totalProfit -= b.stake;
        losses++;
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      } else if (b.status === 'push') {
        pushes++;
      }
    });

    const hitRate = wins + losses > 0 ? wins / (wins + losses) : 0;
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
    const yieldPercent = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
    const averageOdds = oddsList.length > 0 ? oddsList.reduce((a, b) => a + b, 0) / oddsList.length : 0;

    // Bankroll equity curve for max drawdown
    const equityCurveDec: Decimal[] = [new Decimal(10000)];
    ledger.reverse().forEach((log) => {
      equityCurveDec.push(new Decimal(log.balanceAfter));
    });

    const maxDdDec = calculateMaxDrawdown(equityCurveDec.length > 1 ? equityCurveDec : [new Decimal(10000), new Decimal(10000)]);
    const maxDrawdownVal = maxDdDec.toNumber();

    // Bankroll path simulation using simulateBankrollPath
    const initialBankrollDec = new Decimal(currentBalance > 0 ? currentBalance : 10000);
    const winProbDec = new Decimal(hitRate > 0 ? hitRate : 0.54);
    const avgOddsDec = new Decimal(averageOdds > 1 ? averageOdds : 1.91);

    const simPath = simulateBankrollPath(initialBankrollDec, winProbDec, avgOddsDec, new Decimal('0.25'), 100);
    const finalBal = simPath.balanceHistory[simPath.balanceHistory.length - 1].toNumber();

    return {
      overview: {
        currentBalance,
        totalBets,
        settledBetsCount: settledBets.length,
        pendingBetsCount: bets.filter((b) => b.status === 'pending').length,
        totalStaked: Number(totalStaked.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        hitRate: Number((hitRate * 100).toFixed(2)),
        roiPercent: Number(roi.toFixed(2)),
        yieldPercent: Number(yieldPercent.toFixed(2)),
        averageOdds: Number(averageOdds.toFixed(2)),
      },
      streaks: {
        longestWinStreak: maxWinStreak,
        longestLosingStreak: maxLossStreak,
      },
      riskAndDrawdown: {
        maxDrawdownPercent: Number((maxDrawdownVal * 100).toFixed(2)),
        isBroke: simPath.isBroke,
      },
      simulation: {
        meanFinalBankroll: Number(finalBal.toFixed(2)),
        medianFinalBankroll: Number(finalBal.toFixed(2)),
        maxDrawdown95: Number((maxDrawdownVal * 100).toFixed(2)),
        riskOfRuinPercent: simPath.isBroke ? 100 : 0,
      },
    };
  }
}
