import { OddsProvider, OddsResponse, NormalizedEvent } from './OddsProvider.js';
import { Sport } from '@velora/shared-types';

export class TheOddsAPIProvider implements OddsProvider {
  name = 'TheOddsAPIProvider';
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey = process.env.THE_ODDS_API_KEY || 'demo-key') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.the-odds-api.com/v4/sports';
  }

  async fetchOdds(sport: Sport): Promise<OddsResponse> {
    // Normalization mapping from internal Sport enum to The Odds API sport key
    const sportKey = this.mapSportToKey(sport);
    
    // Fall back to Mock if no real API key is configured
    if (this.apiKey === 'demo-key' || !process.env.THE_ODDS_API_KEY) {
      return {
        provider: `${this.name} (Fallback)`,
        fetchedAt: new Date(),
        events: [
          {
            externalId: `toa_${sport}_1`,
            sport,
            leagueName: sport.toUpperCase(),
            homeTeam: 'Denver Nuggets',
            awayTeam: 'Dallas Mavericks',
            startTime: new Date(Date.now() + 3600 * 1000 * 12),
            markets: [
              {
                bookmakerKey: 'draftkings',
                marketType: 'h2h',
                selections: [
                  { name: 'Denver Nuggets', priceDecimal: 1.74, priceAmerican: -135, impliedProbability: 0.5747 },
                  { name: 'Dallas Mavericks', priceDecimal: 2.15, priceAmerican: +115, impliedProbability: 0.4651 },
                ],
              },
            ],
          },
        ],
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${sportKey}/odds/?apiKey=${this.apiKey}&regions=us,eu&markets=h2h,spreads,totals`
      );
      if (!response.ok) {
        throw new Error(`TheOddsAPI returned HTTP ${response.status}`);
      }
      const data: any[] = await response.json();

      const events: NormalizedEvent[] = data.map((item) => ({
        externalId: item.id,
        sport,
        leagueName: item.sport_title || sport.toUpperCase(),
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        startTime: new Date(item.commence_time),
        markets: (item.bookmakers || []).flatMap((bm: any) =>
          (bm.markets || []).map((m: any) => ({
            bookmakerKey: bm.key,
            marketType: m.key === 'h2h' ? 'h2h' : m.key === 'spreads' ? 'spreads' : 'totals',
            selections: (m.outcomes || []).map((o: any) => ({
              name: o.name,
              priceDecimal: o.price,
              priceAmerican: o.price > 2.0 ? Math.round((o.price - 1) * 100) : Math.round(-100 / (o.price - 1)),
              impliedProbability: Number((1 / o.price).toFixed(4)),
            })),
          }))
        ),
      }));

      return {
        provider: this.name,
        fetchedAt: new Date(),
        events,
      };
    } catch (error) {
      console.warn('TheOddsAPI error, returning normalized fallback:', error);
      return {
        provider: `${this.name} (Error Fallback)`,
        fetchedAt: new Date(),
        events: [],
      };
    }
  }

  async fetchEventOdds(eventId: string): Promise<NormalizedEvent | null> {
    const res = await this.fetchOdds('basketball');
    return res.events.find((e) => e.externalId === eventId) || null;
  }

  private mapSportToKey(sport: Sport): string {
    switch (sport) {
      case 'basketball':
        return 'basketball_nba';
      case 'football':
        return 'americanfootball_nfl';
      case 'soccer':
        return 'soccer_epl';
      case 'baseball':
        return 'baseball_mlb';
      case 'tennis':
        return 'tennis_atp_wimbledon';
      default:
        return 'basketball_nba';
    }
  }
}
