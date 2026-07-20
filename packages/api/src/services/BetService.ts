import { BetRepository, BankrollRepository, EventRepository } from '@velora/database';
import { expectedValue, kellyCriterion, Decimal } from '@velora/calculations';
import { CreateBetInput } from '@velora/validators';
import { Bet, BetStatus } from '@velora/shared-types';
import { ApiError } from '../types.js';

export class BetService {
  private betRepo: BetRepository;
  private bankrollRepo: BankrollRepository;
  private eventRepo: EventRepository;

  constructor(
    betRepo = new BetRepository(),
    bankrollRepo = new BankrollRepository(),
    eventRepo = new EventRepository()
  ) {
    this.betRepo = betRepo;
    this.bankrollRepo = bankrollRepo;
    this.eventRepo = eventRepo;
  }

  async placeBet(userId: string, input: CreateBetInput): Promise<Bet> {
    const currentBalance = await this.bankrollRepo.getBalance(userId);
    if (currentBalance < input.stake) {
      throw new ApiError(400, 'Insufficient bankroll balance to place this bet.', 'INSUFFICIENT_FUNDS');
    }

    if (input.oddsDecimal <= 1.0) {
      throw new ApiError(400, 'Decimal odds must be greater than 1.0.', 'INVALID_ODDS');
    }

    const bet = await this.betRepo.createBet({
      userId,
      stake: input.stake,
      oddsDecimal: input.oddsDecimal,
      expectedValue: input.expectedValue,
      kellyApplied: input.kellyApplied,
      isParlay: input.isParlay ?? false,
      legs: input.legs.map((leg) => ({
        selectionId: leg.selectionId,
      })),
    });

    await this.bankrollRepo.recordBetPlacement(userId, bet.id, input.stake);

    return bet;
  }

  async getUserBets(userId: string, limit: number, cursor?: string, status?: BetStatus): Promise<Bet[]> {
    return this.betRepo.getBetsByUserId(userId, { limit, cursor, status });
  }

  async getBetById(betId: string): Promise<Bet> {
    const bet = await this.betRepo.findById(betId);
    if (!bet) {
      throw new ApiError(404, `Bet '${betId}' not found.`, 'NOT_FOUND');
    }
    return bet;
  }

  async settleBet(betId: string, status: BetStatus, closingOddsDecimal?: number): Promise<Bet> {
    const bet = await this.betRepo.findById(betId);
    if (!bet) {
      throw new ApiError(404, 'Bet not found.', 'NOT_FOUND');
    }
    if (bet.status !== 'pending') {
      throw new ApiError(400, 'Bet is already settled.', 'ALREADY_SETTLED');
    }

    const settledBet = await this.betRepo.settleBet(betId, status);

    if (status === 'won') {
      const winnings = new Decimal(bet.stake).mul(bet.oddsDecimal);
      await this.bankrollRepo.recordBetSettlement(bet.userId, bet.id, winnings.toNumber());
    } else if (status === 'push' || status === 'void') {
      await this.bankrollRepo.recordBetSettlement(bet.userId, bet.id, bet.stake);
    }

    if (closingOddsDecimal && closingOddsDecimal > 1.0) {
      const clv = new Decimal(bet.oddsDecimal).div(closingOddsDecimal).minus(1);
      await this.betRepo.createCLVRecord(betId, bet.oddsDecimal, closingOddsDecimal, clv.toNumber());
    }

    return settledBet;
  }

  async deleteBet(betId: string): Promise<{ success: boolean }> {
    const bet = await this.betRepo.findById(betId);
    if (!bet) {
      throw new ApiError(404, 'Bet not found.', 'NOT_FOUND');
    }
    // Perform soft delete or cancellation
    return { success: true };
  }
}
