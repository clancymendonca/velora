import { prisma, PrismaClient } from '../client.js';

/**
 * Base Repository class exposing the shared Prisma Client instance.
 * Isolates data storage details from application business logic.
 */
export class BaseRepository {
  protected db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }
}
