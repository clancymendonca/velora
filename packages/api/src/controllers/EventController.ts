import { BaseController } from './BaseController.js';
import { EventService } from '../services/EventService.js';
import { QueryEventsSchema, QueryEventsInput } from '@velora/validators';
import { ProblemDetails, PaginatedResponse } from '../types.js';
import { Event } from '@velora/shared-types';

export class EventController extends BaseController {
  private eventService: EventService;

  constructor(eventService = new EventService()) {
    super();
    this.eventService = eventService;
  }

  /**
   * GET /api/events
   */
  async getEvents(
    queryParams: any,
    path: string
  ): Promise<{ status: number; data: PaginatedResponse<Event> | ProblemDetails }> {
    try {
      const validated = this.validate(QueryEventsSchema, queryParams) as QueryEventsInput;
      const events = await this.eventService.getEvents(validated);

      const nextCursor = events.length === validated.limit ? events[events.length - 1].id : undefined;

      return {
        status: 200,
        data: {
          data: events,
          nextCursor,
        },
      };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  /**
   * GET /api/events/:id
   */
  async getEventById(
    id: string,
    path: string
  ): Promise<{ status: number; data: Event | ProblemDetails }> {
    try {
      const event = await this.eventService.getEventById(id);
      return { status: 200, data: event };
    } catch (error) {
      return this.handleException(error, path);
    }
  }
}
