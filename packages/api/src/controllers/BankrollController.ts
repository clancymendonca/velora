import { BaseController } from './BaseController.js';
import { BankrollService } from '../services/BankrollService.js';
import { BankrollTransactionSchema, BankrollTransactionInput } from '@velora/validators';

export class BankrollController extends BaseController {
  private bankrollService: BankrollService;

  constructor(bankrollService = new BankrollService()) {
    super();
    this.bankrollService = bankrollService;
  }

  /**
   * GET /api/bankroll
   */
  async getBankroll(
    userId: string,
    path: string
  ): Promise<{ status: number; data: unknown }> {
    try {
      const bankroll = await this.bankrollService.getBankroll(userId);
      return { status: 200, data: bankroll };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  /**
   * PATCH /api/bankroll
   */
  async updateBankroll(
    userId: string,
    body: unknown,
    path: string
  ): Promise<{ status: number; data: unknown }> {
    try {
      const validated = this.validate(BankrollTransactionSchema, body) as BankrollTransactionInput;
      const entry = await this.bankrollService.updateBankroll(userId, validated);
      return { status: 200, data: entry };
    } catch (error) {
      return this.handleException(error, path);
    }
  }
}
