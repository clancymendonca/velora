import { EventRepository, EventFilterOptions } from '@velora/database';
import { Event } from '@velora/shared-types';
import { ApiError } from '../types.js';

export class EventService {
  private eventRepo: EventRepository;

  constructor(eventRepo = new EventRepository()) {
    this.eventRepo = eventRepo;
  }

  async getEvents(options: EventFilterOptions): Promise<Event[]> {
    return this.eventRepo.findEvents(options);
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepo.findEventById(id);
    if (!event) {
      throw new ApiError(404, `Event with ID '${id}' not found.`, 'NOT_FOUND');
    }
    return event;
  }
}
