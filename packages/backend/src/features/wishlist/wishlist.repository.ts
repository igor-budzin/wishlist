import { injectable, inject } from 'inversify';
import { PrismaClient, WishlistItem, Priority } from '@prisma/client';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';

export interface IWishlistItemRepository {
  findAll(userId: string): Promise<WishlistItem[]>;
  findById(id: string, userId: string): Promise<WishlistItem | null>;
  create(data: {
    title: string;
    description?: string;
    url?: string;
    priority: Priority;
    userId: string;
  }): Promise<WishlistItem>;
  update(id: string, userId: string, data: {
    title?: string;
    description?: string | null;
    url?: string | null;
    priority?: Priority;
  }): Promise<WishlistItem>;
  delete(id: string, userId: string): Promise<void>;
  count(userId: string): Promise<number>;
}

@injectable()
export class WishlistItemRepository implements IWishlistItemRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async findAll(userId: string): Promise<WishlistItem[]> {
    this.logger.debug(`Fetching all wishlist items for user: ${userId}`);
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string): Promise<WishlistItem | null> {
    this.logger.debug(`Fetching wishlist item with id: ${id} for user: ${userId}`);
    return this.prisma.wishlistItem.findUnique({
      where: { id, userId },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    url?: string;
    priority: Priority;
    userId: string;
  }): Promise<WishlistItem> {
    this.logger.info(`Creating wishlist item: ${data.title} for user: ${data.userId}`);
    return this.prisma.wishlistItem.create({
      data,
    });
  }

  async update(id: string, userId: string, data: {
    title?: string;
    description?: string | null;
    url?: string | null;
    priority?: Priority;
  }): Promise<WishlistItem> {
    this.logger.info(`Updating wishlist item: ${id} for user: ${userId}`);
    return this.prisma.wishlistItem.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    this.logger.info(`Deleting wishlist item: ${id} for user: ${userId}`);
    await this.prisma.wishlistItem.delete({
      where: { id, userId },
    });
  }

  async count(userId: string): Promise<number> {
    return this.prisma.wishlistItem.count({
      where: { userId },
    });
  }
}
