import { OddsProvider, OddsResponse, NormalizedEvent } from './OddsProvider.js';
import { Sport } from '@velora/shared-types';
import { devigShin, Decimal } from '@velora/calculations';

export class MockOddsProvider implements OddsProvider {
  name = 'MockOddsProvider';

  async fetchOdds(sport: Sport): Promise<OddsResponse> {
    const events = [
      this.generateMockEvent('mock_event_1', sport, 'Boston Celtics', 'LA Lakers'),
      this.generateMockEvent('mock_event_2', sport, 'Golden State Warriors', 'Milwaukee Bucks'),
      this.generateMockEvent('mock_event_3', sport, 'Kansas City Chiefs', 'San Francisco 49ers'),
    ];

    return {
      provider: this.name,
      fetchedAt: new Date(),
      events,
    };
  }

  async fetchEventOdds(eventId: string): Promise<NormalizedEvent | null> {
    return this.generateMockEvent(eventId, 'basketball', 'Boston Celtics', 'LA Lakers');
  }

  private generateMockEvent(id: string, sport: Sport, homeTeam: string, awayTeam: string): NormalizedEvent {
    const rawOdds = [1.87, 2.02];
    const probs = devigShin(rawOdds.map((o) => new Decimal(1).div(o)));

    return {
      externalId: id,
      sport,
      leagueName: sport.toUpperCase(),
      homeTeam,
      awayTeam,
      startTime: new Date(Date.now() + 3600 * 1000 * 6),
      markets: [
        {
          bookmakerKey: 'pinnacle',
          marketType: 'h2h',
          selections: [
            {
              name: homeTeam,
              priceDecimal: rawOdds[0],
              priceAmerican: -115,
              impliedProbability: Number(probs[0].toNumber().toFixed(4)),
            },
            {
              name: awayTeam,
              priceDecimal: rawOdds[1],
              priceAmerican: +102,
              impliedProbability: Number(probs[1].toNumber().toFixed(4)),
            },
          ],
        },
      ],
    };
  }
}
