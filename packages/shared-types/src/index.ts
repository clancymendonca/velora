export type OddsFormat = 'american' | 'decimal' | 'fractional';

export interface OddsInput {
  value: number;
  format: OddsFormat;
}

export interface BankrollState {
  bankroll: number;
  unitSize: number;
}
