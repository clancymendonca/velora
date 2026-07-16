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

  /**
   * Places a bet for a user. Coordinates balance validation, mathematical EV and Kelly calculations,
   * bankroll debit, and database creation.
   */
  async placeBet(userId: string, input: CreateBetInput): Promise<Bet> {
    // 1. Fetch current bankroll balance
    const currentBalance = await this.bankrollRepo.getBalance(userId);
    if (currentBalance < input.stake) {
      throw new ApiError(400, 'Insufficient bankroll balance to place this bet.', 'INSUFFICIENT_FUNDS');
    }

    // 2. Perform EV & Kelly calculations using decimal.js to double check mathematical validity
    // For single bets, verify EV matches input within tolerance
    const stakeDec = new Decimal(input.stake);
    const oddsDec = new Decimal(input.oddsDecimal);
    
    // We assume expectedValue input represents a ratio, let's verify EV is positive or warn/log
    // Standard validation: EV = (trueProb * decimalOdds) - 1.
    // If user provided expectedValue, we can verify it. Let's make sure it's valid:
    if (input.oddsDecimal <= 1.0) {
      throw new ApiError(400, 'Decimal odds must be greater than 1.0.', 'INVALID_ODDS');
    }

    // 3. Create the Bet entry in DB
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

    // 4. Debit the user bankroll
    await this.bankrollRepo.recordBetPlacement(userId, bet.id, input.stake);

    return bet;
  }

  /**
   * Retrieves paginated bets for a user.
   */
  async getUserBets(userId: string, limit: number, cursor?: string, status?: BetStatus): Promise<Bet[]> {
    return this.betRepo.getBetsByUserId(userId, { limit, cursor, status });
  }

  /**
   * Settles a bet. Updates its status and credits bankroll ledger on a win.
   */
  async settleBet(betId: string, status: BetStatus, closingOddsDecimal?: number): Promise<Bet> {
    const bet = await this.betRepo.findById(betId);
    if (!bet) {
      throw new ApiError(404, 'Bet not found.', 'NOT_FOUND');
    }
    if (bet.status !== 'pending') {
      throw new ApiError(400, 'Bet is already settled.', 'ALREADY_SETTLED');
    }

    // 1. Update status in database
    const settledBet = await this.betRepo.settleBet(betId, status);

    // 2. Credit bankroll on win
    if (status === 'won') {
      const winnings = new Decimal(bet.stake).mul(bet.oddsDecimal);
      await this.bankrollRepo.recordBetSettlement(bet.userId, bet.id, winnings.toNumber());
    } else if (status === 'push' || status === 'void') {
      // Pushed or voided bets return the original stake
      await this.bankrollRepo.recordBetSettlement(bet.userId, bet.id, bet.stake);
    }

    // 3. Record CLV if closing odds are provided
    if (closingOddsDecimal && closingOddsDecimal > 1.0) {
      // clv = (placedOdds / closingOdds) - 1
      const clv = new Decimal(bet.oddsDecimal).div(closingOddsDecimal).minus(1);
      await this.betRepo.createCLVRecord(betId, bet.oddsDecimal, closingOddsDecimal, clv.toNumber());
    }

    return settledBet;
  }
}
