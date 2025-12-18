import { injectable, inject } from 'inversify';
import { PrismaClient, WishlistItem, Priority } from '@prisma/client';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';

export interface IWishlistItemRepository {
  findAll(): Promise<WishlistItem[]>;
  findById(id: string): Promise<WishlistItem | null>;
  create(data: {
    title: string;
    description?: string;
    url?: string;
    priority: Priority;
  }): Promise<WishlistItem>;
  update(id: string, data: {
    title?: string;
    description?: string | null;
    url?: string | null;
    priority?: Priority;
  }): Promise<WishlistItem>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

@injectable()
export class WishlistItemRepository implements IWishlistItemRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async findAll(): Promise<WishlistItem[]> {
    this.logger.debug('Fetching all wishlist items');
    return this.prisma.wishlistItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<WishlistItem | null> {
    this.logger.debug(`Fetching wishlist item with id: ${id}`);
    return this.prisma.wishlistItem.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    url?: string;
    priority: Priority;
  }): Promise<WishlistItem> {
    this.logger.info(`Creating wishlist item: ${data.title}`);
    return this.prisma.wishlistItem.create({
      data,
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string | null;
    url?: string | null;
    priority?: Priority;
  }): Promise<WishlistItem> {
    this.logger.info(`Updating wishlist item: ${id}`);
    return this.prisma.wishlistItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    this.logger.info(`Deleting wishlist item: ${id}`);
    await this.prisma.wishlistItem.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return this.prisma.wishlistItem.count();
  }
}
