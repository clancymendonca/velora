import { BaseController } from './BaseController.js';
import { BetService } from '../services/BetService.js';
import { CreateBetSchema, UpdateBetSchema, CreateBetInput, UpdateBetInput } from '@velora/validators';
import { ProblemDetails } from '../types.js';

export class BetController extends BaseController {
  private betService: BetService;

  constructor(betService = new BetService()) {
    super();
    this.betService = betService;
  }

  async placeBet(
    userId: string,
    body: any,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const validatedInput = this.validate(CreateBetSchema, body) as CreateBetInput;
      const bet = await this.betService.placeBet(userId, validatedInput);
      return { status: 201, data: bet };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  async getBets(
    userId: string,
    queryParams: any,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 20;
      const cursor = queryParams.cursor || undefined;
      const status = queryParams.status || undefined;

      const bets = await this.betService.getUserBets(userId, limit, cursor, status);
      
      const nextCursor = bets.length === limit ? bets[bets.length - 1].id : undefined;

      return {
        status: 200,
        data: {
          data: bets,
          nextCursor,
        },
      };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  async getBetById(
    betId: string,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const bet = await this.betService.getBetById(betId);
      return { status: 200, data: bet };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  async settleBet(
    betId: string,
    body: any,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const validatedInput = this.validate(UpdateBetSchema, body) as UpdateBetInput;
      const bet = await this.betService.settleBet(
        betId,
        validatedInput.status,
        body.closingOddsDecimal
      );
      return { status: 200, data: bet };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  async deleteBet(
    betId: string,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const result = await this.betService.deleteBet(betId);
      return { status: 200, data: result };
    } catch (error) {
      return this.handleException(error, path);
    }
  }
}
