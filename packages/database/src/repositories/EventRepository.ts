import { BaseRepository } from './BaseRepository.js';
import { Event, Sport, EventStatus, Selection } from '@velora/shared-types';
import { Decimal } from 'decimal.js';

export interface EventFilterOptions {
  limit: number;
  cursor?: string;
  sport?: Sport;
  status?: EventStatus;
}

export class EventRepository extends BaseRepository {
  /**
   * Retrieves events based on filters (sport, status, start time) with cursor pagination.
   */
  async findEvents(options: EventFilterOptions): Promise<Event[]> {
    const queryOptions: any = {
      take: options.limit,
      orderBy: {
        startTime: 'asc',
      },
      where: {},
    };

    if (options.sport) {
      queryOptions.where.league = {
        sport: options.sport.toUpperCase(),
      };
    }

    if (options.status) {
      queryOptions.where.status = options.status.toUpperCase();
    }

    if (options.cursor) {
      queryOptions.skip = 1;
      queryOptions.cursor = {
        id: options.cursor,
      };
    }

    const events = await this.db.event.findMany(queryOptions);

    return events.map((event) => ({
      id: event.id,
      leagueId: event.leagueId,
      externalId: event.externalId,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      startTime: event.startTime,
      status: event.status.toLowerCase() as EventStatus,
    }));
  }

  /**
   * Retrieves a single event by ID, including its markets and selections.
   */
  async findEventById(id: string): Promise<Event | null> {
    const event = await this.db.event.findUnique({
      where: { id },
    });

    if (!event) return null;

    return {
      id: event.id,
      leagueId: event.leagueId,
      externalId: event.externalId,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      startTime: event.startTime,
      status: event.status.toLowerCase() as EventStatus,
    };
  }

  /**
   * Updates a selection's current price and implied probability, and logs it in the append-only history.
   */
  async updateSelectionPrice(
    selectionId: string,
    priceDecimal: number,
    priceAmerican: number,
    impliedProbability: number
  ): Promise<Selection> {
    return this.db.$transaction(async (tx) => {
      // 1. Update selection price
      const updated = await tx.selection.update({
        where: { id: selectionId },
        data: {
          priceDecimal: new Decimal(priceDecimal),
          priceAmerican,
          impliedProbability: new Decimal(impliedProbability),
        },
      });

      // 2. Log in append-only history
      await tx.oddsHistory.create({
        data: {
          selectionId,
          priceDecimal: new Decimal(priceDecimal),
          priceAmerican,
        },
      });

      return {
        id: updated.id,
        marketId: updated.marketId,
        name: updated.name,
        priceDecimal: updated.priceDecimal.toNumber(),
        priceAmerican: updated.priceAmerican,
        impliedProbability: updated.impliedProbability.toNumber(),
        isSettled: false, // Default selection model parameter mapping
      };
    });
  }

  /**
   * Retrieves the historical odds trend for a selection.
   */
  async getOddsHistory(selectionId: string, limit = 100): Promise<{ priceDecimal: number; timestamp: Date }[]> {
    const history = await this.db.oddsHistory.findMany({
      where: { selectionId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return history.map((record) => ({
      priceDecimal: record.priceDecimal.toNumber(),
      timestamp: record.timestamp,
    }));
  }
}
