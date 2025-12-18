import { injectable, inject } from 'inversify';
import { WishlistItem } from '@prisma/client';
import { TYPES } from '../../types.js';
import type { IWishlistItemRepository } from './wishlist.repository.js';
import type { ILogger } from '../../lib/logger.js';
import {
  CreateWishlistItemDTO,
  UpdateWishlistItemDTO,
  toPrismaPriority,
  fromPrismaPriority
} from './wishlist.schema.js';

export interface WishlistItemResponse {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistItemService {
  getAllItems(userId: string): Promise<WishlistItemResponse[]>;
  getItemById(id: string, userId: string): Promise<WishlistItemResponse>;
  createItem(data: CreateWishlistItemDTO, userId: string): Promise<WishlistItemResponse>;
  updateItem(id: string, userId: string, data: UpdateWishlistItemDTO): Promise<WishlistItemResponse>;
  deleteItem(id: string, userId: string): Promise<void>;
}

@injectable()
export class WishlistItemService implements IWishlistItemService {
  constructor(
    @inject(TYPES.WishlistItemRepository) private repository: IWishlistItemRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async getAllItems(userId: string): Promise<WishlistItemResponse[]> {
    const items = await this.repository.findAll(userId);
    return items.map(this.toResponse);
  }

  async getItemById(id: string, userId: string): Promise<WishlistItemResponse> {
    const item = await this.repository.findById(id, userId);

    if (!item) {
      throw new Error(`Wishlist item with id ${id} not found`);
    }

    return this.toResponse(item);
  }

  async createItem(data: CreateWishlistItemDTO, userId: string): Promise<WishlistItemResponse> {
    this.logger.info(`Creating wishlist item: ${data.title} for user: ${userId}`);

    const item = await this.repository.create({
      title: data.title,
      description: data.description,
      url: data.url || undefined,
      priority: toPrismaPriority(data.priority || 'medium'),
      userId,
    });

    return this.toResponse(item);
  }

  async updateItem(id: string, userId: string, data: UpdateWishlistItemDTO): Promise<WishlistItemResponse> {
    // Check if item exists
    await this.getItemById(id, userId);

    this.logger.info(`Updating wishlist item: ${id} for user: ${userId}`);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.url !== undefined) updateData.url = data.url || null;
    if (data.priority !== undefined) updateData.priority = toPrismaPriority(data.priority);

    const item = await this.repository.update(id, userId, updateData);
    return this.toResponse(item);
  }

  async deleteItem(id: string, userId: string): Promise<void> {
    // Check if item exists
    await this.getItemById(id, userId);

    this.logger.info(`Deleting wishlist item: ${id} for user: ${userId}`);
    await this.repository.delete(id, userId);
  }

  private toResponse(item: WishlistItem): WishlistItemResponse {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      priority: fromPrismaPriority(item.priority),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
