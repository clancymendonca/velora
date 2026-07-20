import { BaseRepository } from './BaseRepository.js';
import { BankrollEntry } from '@velora/shared-types';
import { Prisma } from '../client.js';
import { Decimal } from 'decimal.js';

export class BankrollRepository extends BaseRepository {
  /**
   * Retrieves the current balance for a user from their latest ledger record.
   * If no transactions exist, returns 0.
   */
  async getBalance(userId: string): Promise<number> {
    const latestLog = await this.db.bankrollLedger.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    return latestLog ? latestLog.balanceAfter.toNumber() : 0;
  }

  /**
   * Records a bankroll transaction (deposit, withdrawal, adjustment).
   */
  async createTransaction(
    userId: string,
    type: 'deposit' | 'withdrawal' | 'adjustment',
    amount: number
  ): Promise<BankrollEntry> {
    return this.db.$transaction(async (tx) => {
      const currentBalance = await this.getBalanceForTx(tx, userId);
      const decAmount = new Decimal(amount);
      
      let balanceAfter = currentBalance;
      if (type === 'deposit') {
        balanceAfter = currentBalance.plus(decAmount);
      } else if (type === 'withdrawal') {
        if (currentBalance.lessThan(decAmount)) {
          throw new Error('Insufficient bankroll funds.');
        }
        balanceAfter = currentBalance.minus(decAmount);
      } else { // adjustment
        balanceAfter = currentBalance.plus(decAmount);
      }

      const log = await tx.bankrollLedger.create({
        data: {
          userId,
          type: type.toUpperCase(),
          amount: decAmount,
          balanceAfter,
        },
      });

      return {
        id: log.id,
        userId: log.userId,
        timestamp: log.timestamp,
        type: log.type.toLowerCase() as BankrollEntry['type'],
        amount: log.amount.toNumber(),
        balanceAfter: log.balanceAfter.toNumber(),
      };
    });
  }

  /**
   * Records bet placement by debiting the stake from the user's bankroll balance.
   */
  async recordBetPlacement(userId: string, betId: string, stake: number): Promise<BankrollEntry> {
    return this.db.$transaction(async (tx) => {
      const currentBalance = await this.getBalanceForTx(tx, userId);
      const decStake = new Decimal(stake);

      if (currentBalance.lessThan(decStake)) {
        throw new Error('Insufficient bankroll funds to place bet.');
      }

      const balanceAfter = currentBalance.minus(decStake);

      const log = await tx.bankrollLedger.create({
        data: {
          userId,
          type: 'BET_PLACE',
          amount: decStake.negated(),
          balanceAfter,
          betId,
        },
      });

      return {
        id: log.id,
        userId: log.userId,
        timestamp: log.timestamp,
        type: 'bet_place',
        amount: log.amount.toNumber(),
        balanceAfter: log.balanceAfter.toNumber(),
        referenceId: log.betId ?? undefined,
      };
    });
  }

  /**
   * Records bet settlement by adding won payouts to the user's bankroll balance.
   */
  async recordBetSettlement(userId: string, betId: string, payout: number): Promise<BankrollEntry> {
    return this.db.$transaction(async (tx) => {
      const currentBalance = await this.getBalanceForTx(tx, userId);
      const decPayout = new Decimal(payout);
      const balanceAfter = currentBalance.plus(decPayout);

      const log = await tx.bankrollLedger.create({
        data: {
          userId,
          type: 'BET_SETTLEMENT',
          amount: decPayout,
          balanceAfter,
          betId,
        },
      });

      return {
        id: log.id,
        userId: log.userId,
        timestamp: log.timestamp,
        type: 'bet_settlement',
        amount: log.amount.toNumber(),
        balanceAfter: log.balanceAfter.toNumber(),
        referenceId: log.betId ?? undefined,
      };
    });
  }

  /**
   * Gets the ledger history for a user.
   */
  async getHistory(userId: string, limit = 50): Promise<BankrollEntry[]> {
    const logs = await this.db.bankrollLedger.findMany({
      where: { userId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      timestamp: log.timestamp,
      type: log.type.toLowerCase() as BankrollEntry['type'],
      amount: log.amount.toNumber(),
      balanceAfter: log.balanceAfter.toNumber(),
      referenceId: log.betId ?? undefined,
    }));
  }

  // Internal helper to get balance using a specific transaction transaction runner
  private async getBalanceForTx(tx: Prisma.TransactionClient, userId: string): Promise<Decimal> {
    const latestLog = await tx.bankrollLedger.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    return latestLog ? latestLog.balanceAfter : new Decimal(0);
  }
}
