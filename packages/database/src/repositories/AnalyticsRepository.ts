import { BaseRepository } from './BaseRepository.js';
import { BankrollSnapshot } from '@prisma/client';
import { Decimal } from 'decimal.js';

export interface BankrollSnapshotData {
  userId: string;
  balance: number;
  netProfit: number;
  peakBalance: number;
  drawdown: number;
  timestamp?: Date;
}

export interface SimulationRunData {
  userId: string;
  initialBankroll: number;
  winRate: number;
  averageOdds: number;
  numBets: number;
  numSimulations: number;
  meanFinalBankroll: number;
  medianFinalBankroll: number;
  maxDrawdown95: number;
  riskOfRuin: number;
}

export class AnalyticsRepository extends BaseRepository {
  async saveBankrollSnapshot(data: BankrollSnapshotData) {
    return this.db.bankrollSnapshot.create({
      data: {
        userId: data.userId,
        balance: new Decimal(data.balance),
        netProfit: new Decimal(data.netProfit),
        peakBalance: new Decimal(data.peakBalance),
        drawdown: new Decimal(data.drawdown),
        timestamp: data.timestamp ?? new Date(),
      },
    });
  }

  async getBankrollSnapshots(userId: string, limit = 30) {
    const snapshots = await this.db.bankrollSnapshot.findMany({
      where: { userId },
      take: limit,
      orderBy: { timestamp: 'asc' },
    });

    return snapshots.map((s: BankrollSnapshot) => ({
      id: s.id,
      userId: s.userId,
      balance: s.balance.toNumber(),
      netProfit: s.netProfit.toNumber(),
      peakBalance: s.peakBalance.toNumber(),
      drawdown: s.drawdown.toNumber(),
      timestamp: s.timestamp,
    }));
  }

  async saveSimulationRun(data: SimulationRunData) {
    return this.db.simulationRun.create({
      data: {
        userId: data.userId,
        initialBankroll: new Decimal(data.initialBankroll),
        winRate: new Decimal(data.winRate),
        averageOdds: new Decimal(data.averageOdds),
        numBets: data.numBets,
        numSimulations: data.numSimulations,
        meanFinalBankroll: new Decimal(data.meanFinalBankroll),
        medianFinalBankroll: new Decimal(data.medianFinalBankroll),
        maxDrawdown95: new Decimal(data.maxDrawdown95),
        riskOfRuin: new Decimal(data.riskOfRuin),
      },
    });
  }

  async getLatestSimulationRun(userId: string) {
    const run = await this.db.simulationRun.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!run) return null;

    return {
      id: run.id,
      userId: run.userId,
      initialBankroll: run.initialBankroll.toNumber(),
      winRate: run.winRate.toNumber(),
      averageOdds: run.averageOdds.toNumber(),
      numBets: run.numBets,
      numSimulations: run.numSimulations,
      meanFinalBankroll: run.meanFinalBankroll.toNumber(),
      medianFinalBankroll: run.medianFinalBankroll.toNumber(),
      maxDrawdown95: run.maxDrawdown95.toNumber(),
      riskOfRuin: run.riskOfRuin.toNumber(),
      createdAt: run.createdAt,
    };
  }
}
