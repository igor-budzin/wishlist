import { injectable, inject } from 'inversify';
import { PrismaClient, User } from '@prisma/client';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';

export interface UserStats {
  totalItems: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  getUserStats(userId: string): Promise<UserStats>;
}

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async findById(id: string): Promise<User | null> {
    this.logger.debug(`Fetching user with id: ${id}`);
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserStats(userId: string): Promise<UserStats> {
    this.logger.debug(`Fetching stats for user: ${userId}`);

    const [totalItems, highPriority, mediumPriority, lowPriority] = await Promise.all([
      this.prisma.wishlistItem.count({ where: { userId } }),
      this.prisma.wishlistItem.count({ where: { userId, priority: 'HIGH' } }),
      this.prisma.wishlistItem.count({ where: { userId, priority: 'MEDIUM' } }),
      this.prisma.wishlistItem.count({ where: { userId, priority: 'LOW' } }),
    ]);

    return {
      totalItems,
      highPriority,
      mediumPriority,
      lowPriority,
    };
  }
}
