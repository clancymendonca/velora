export type Sport = 'basketball' | 'football' | 'soccer' | 'baseball' | 'tennis' | 'esports';

export type EventStatus = 'scheduled' | 'live' | 'finished' | 'suspended' | 'cancelled';

export type BetStatus = 'pending' | 'won' | 'lost' | 'push' | 'void';

export type OddsFormat = 'american' | 'decimal' | 'fractional';

export interface OddsInput {
  value: number;
  format: OddsFormat;
}

export interface BankrollState {
  bankroll: number;
  unitSize: number;
}

export interface League {
  id: string;
  sport: Sport;
  name: string;
  country: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  leagueId: string;
  externalId: string; // Feed provider ID
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  status: EventStatus;
  score?: {
    home: number;
    away: number;
  };
}

export interface Bookmaker {
  id: string;
  key: string; // e.g. 'pinnacle', 'draftkings'
  name: string;
  isActive: boolean;
}

export interface Market {
  id: string;
  eventId: string;
  bookmakerId: string;
  marketType: 'h2h' | 'spreads' | 'totals' | 'props';
  status: 'open' | 'suspended' | 'settled';
}

export interface Selection {
  id: string;
  marketId: string;
  name: string; // e.g. 'Home Team -3.5'
  priceDecimal: number;
  priceAmerican: number;
  impliedProbability: number;
  isSettled: boolean;
  outcome?: 'win' | 'loss' | 'push' | 'void';
}

export interface OddsSnapshot {
  id: string;
  selectionId: string;
  timestamp: Date;
  priceDecimal: number;
  priceAmerican: number;
}

export interface Parlay {
  id: string;
  userId: string;
  status: BetStatus;
  stake: number;
  oddsDecimal: number;
  placedAt: Date;
  settledAt?: Date;
  legs: ParlayLeg[];
}

export interface ParlayLeg {
  id: string;
  parlayId?: string;
  betId?: string;
  selectionId: string;
  status: BetStatus;
}

export interface Bet {
  id: string;
  userId: string;
  status: BetStatus;
  stake: number;
  oddsDecimal: number;
  expectedValue: number;
  kellyApplied: number;
  placedAt: Date;
  settledAt?: Date;
  isParlay: boolean;
  legs: ParlayLeg[];
}

export interface BankrollEntry {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'deposit' | 'withdrawal' | 'bet_place' | 'bet_settlement' | 'adjustment';
  amount: number;
  balanceAfter: number;
  referenceId?: string; // Bet ID or transaction hash
}

export interface CLVRecord {
  id: string;
  betId: string;
  placedOddsDecimal: number;
  closingOddsDecimal: number;
  clvPercent: number;
}

export interface CalibrationBucket {
  bucketRange: [number, number]; // [0.45, 0.50]
  predictionsCount: number;
  observedFrequency: number;
  brierScore: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'value_bet' | 'line_movement' | 'bankroll_warning';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  eventId: string;
  marketId: string;
  selectionId: string;
  suggestedOdds: number;
  evPercent: number;
  kellyFraction: number;
  recommendedStake: number;
  status: 'active' | 'expired' | 'accepted';
  createdAt: Date;
}

export interface Settings {
  userId: string;
  oddsFormat: OddsFormat;
  defaultStake: number;
  riskTolerancePercent: number;
  kellyFraction: number;
  trackedBookmakers: string[]; // Bookmaker keys
  trackedSports: Sport[];
}
