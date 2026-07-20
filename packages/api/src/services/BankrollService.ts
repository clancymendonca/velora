import { BankrollRepository } from '@velora/database';
import { BankrollEntry } from '@velora/shared-types';
import { BankrollTransactionInput } from '@velora/validators';

export class BankrollService {
  private bankrollRepo: BankrollRepository;

  constructor(bankrollRepo = new BankrollRepository()) {
    this.bankrollRepo = bankrollRepo;
  }

  async getBankroll(userId: string): Promise<{ balance: number; history: BankrollEntry[] }> {
    const balance = await this.bankrollRepo.getBalance(userId);
    const history = await this.bankrollRepo.getHistory(userId);
    return { balance, history };
  }

  async updateBankroll(userId: string, input: BankrollTransactionInput): Promise<BankrollEntry> {
    return this.bankrollRepo.createTransaction(userId, input.type, input.amount);
  }
}
