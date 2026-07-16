import { BaseRepository } from './BaseRepository.js';
import { Bet, BetStatus, ParlayLeg } from '@velora/shared-types';
import { Decimal } from 'decimal.js';

export interface CreateBetData {
  userId: string;
  stake: number;
  oddsDecimal: number;
  expectedValue: number;
  kellyApplied: number;
  isParlay: boolean;
  legs: {
    selectionId: string;
  }[];
}

export interface BetFilterOptions {
  limit: number;
  cursor?: string;
  status?: BetStatus;
}

export class BetRepository extends BaseRepository {
  /**
   * Creates a new bet, inserting parlay legs transactionally if isParlay is true.
   */
  async createBet(data: CreateBetData): Promise<Bet> {
    return this.db.$transaction(async (tx) => {
      // 1. Create the Bet entry
      const createdBet = await tx.bet.create({
        data: {
          userId: data.userId,
          status: 'PENDING',
          stake: new Decimal(data.stake),
          oddsDecimal: new Decimal(data.oddsDecimal),
          expectedValue: new Decimal(data.expectedValue),
          kellyApplied: new Decimal(data.kellyApplied),
          isParlay: data.isParlay,
          legs: {
            create: data.legs.map((leg) => ({
              selectionId: leg.selectionId,
              status: 'PENDING',
            })),
          },
        },
        include: {
          legs: true,
        },
      });

      // 2. Map Prisma record back to domain model Bet interface
      return {
        id: createdBet.id,
        userId: createdBet.userId,
        status: createdBet.status.toLowerCase() as BetStatus,
        stake: createdBet.stake.toNumber(),
        oddsDecimal: createdBet.oddsDecimal.toNumber(),
        expectedValue: createdBet.expectedValue.toNumber(),
        kellyApplied: createdBet.kellyApplied.toNumber(),
        placedAt: createdBet.placedAt,
        settledAt: createdBet.settledAt ?? undefined,
        isParlay: createdBet.isParlay,
        legs: createdBet.legs.map((leg) => ({
          id: leg.id,
          betId: leg.betId,
          selectionId: leg.selectionId,
          status: leg.status.toLowerCase() as BetStatus,
        })),
      };
    });
  }

  /**
   * Finds a bet by ID.
   */
  async findById(id: string): Promise<Bet | null> {
    const bet = await this.db.bet.findUnique({
      where: { id },
      include: { legs: true },
    });

    if (!bet) return null;

    return {
      id: bet.id,
      userId: bet.userId,
      status: bet.status.toLowerCase() as BetStatus,
      stake: bet.stake.toNumber(),
      oddsDecimal: bet.oddsDecimal.toNumber(),
      expectedValue: bet.expectedValue.toNumber(),
      kellyApplied: bet.kellyApplied.toNumber(),
      placedAt: bet.placedAt,
      settledAt: bet.settledAt ?? undefined,
      isParlay: bet.isParlay,
      legs: bet.legs.map((leg) => ({
        id: leg.id,
        betId: leg.betId,
        selectionId: leg.selectionId,
        status: leg.status.toLowerCase() as BetStatus,
      })),
    };
  }

  /**
   * Retrieves a paginated list of bets for a specific user.
   */
  async getBetsByUserId(userId: string, options: BetFilterOptions): Promise<Bet[]> {
    const bets = await this.db.bet.findMany({
      where: {
        userId,
        ...(options.status ? { status: options.status.toUpperCase() as any } : {}),
      },
      take: options.limit,
      orderBy: {
        placedAt: 'desc',
      },
      include: {
        legs: true,
      },
      ...(options.cursor ? {
        skip: 1,
        cursor: {
          id: options.cursor,
        },
      } : {}),
    });

    return bets.map((bet) => ({
      id: bet.id,
      userId: bet.userId,
      status: bet.status.toLowerCase() as BetStatus,
      stake: bet.stake.toNumber(),
      oddsDecimal: bet.oddsDecimal.toNumber(),
      expectedValue: bet.expectedValue.toNumber(),
      kellyApplied: bet.kellyApplied.toNumber(),
      placedAt: bet.placedAt,
      settledAt: bet.settledAt ?? undefined,
      isParlay: bet.isParlay,
      legs: bet.legs.map((leg) => ({
        id: leg.id,
        betId: leg.betId,
        selectionId: leg.selectionId,
        status: leg.status.toLowerCase() as BetStatus,
      })),
    }));
  }

  /**
   * Settles a bet, updates its status and records settlement timestamp.
   */
  async settleBet(id: string, status: BetStatus): Promise<Bet> {
    const updated = await this.db.bet.update({
      where: { id },
      data: {
        status: status.toUpperCase() as any,
        settledAt: new Date(),
      },
      include: {
        legs: true,
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      status: updated.status.toLowerCase() as BetStatus,
      stake: updated.stake.toNumber(),
      oddsDecimal: updated.oddsDecimal.toNumber(),
      expectedValue: updated.expectedValue.toNumber(),
      kellyApplied: updated.kellyApplied.toNumber(),
      placedAt: updated.placedAt,
      settledAt: updated.settledAt ?? undefined,
      isParlay: updated.isParlay,
      legs: updated.legs.map((leg) => ({
        id: leg.id,
        betId: leg.betId,
        selectionId: leg.selectionId,
        status: leg.status.toLowerCase() as BetStatus,
      })),
    };
  }

  /**
   * Logs a CLV comparison record for settled bets.
   */
  async createCLVRecord(betId: string, placedOdds: number, closingOdds: number, clvPercent: number): Promise<void> {
    await this.db.clvRecord.create({
      data: {
        betId,
        placedOddsDecimal: new Decimal(placedOdds),
        closingOddsDecimal: new Decimal(closingOdds),
        clvPercent: new Decimal(clvPercent),
      },
    });
  }
}
