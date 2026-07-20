import { BaseRepository } from './BaseRepository.js';
import { User } from '@prisma/client';

export class UserRepository extends BaseRepository {
  async createUser(email: string, name?: string): Promise<User> {
    return this.db.user.create({
      data: {
        email,
        name,
        settings: {
          create: {}, // initializes default UserSettings
        },
      },
      include: {
        settings: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        settings: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        settings: true,
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
