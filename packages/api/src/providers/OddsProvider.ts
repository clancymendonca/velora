import { Sport } from '@velora/shared-types';

export interface NormalizedSelection {
  externalId?: string;
  name: string;
  priceDecimal: number;
  priceAmerican: number;
  impliedProbability: number;
}

export interface NormalizedMarket {
  externalId?: string;
  bookmakerKey: string;
  marketType: 'h2h' | 'spreads' | 'totals' | 'props';
  selections: NormalizedSelection[];
}

export interface NormalizedEvent {
  externalId: string;
  sport: Sport;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  markets: NormalizedMarket[];
}

export interface OddsResponse {
  provider: string;
  fetchedAt: Date;
  events: NormalizedEvent[];
}

export interface OddsProvider {
  name: string;
  fetchOdds(sport: Sport): Promise<OddsResponse>;
  fetchEventOdds(eventId: string): Promise<NormalizedEvent | null>;
}
