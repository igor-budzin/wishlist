export const TYPES = {
  // Infrastructure
  PrismaClient: Symbol.for('PrismaClient'),
  Logger: Symbol.for('Logger'),
  ConfigService: Symbol.for('ConfigService'),

  // Repositories
  WishlistItemRepository: Symbol.for('WishlistItemRepository'),

  // Services
  WishlistItemService: Symbol.for('WishlistItemService'),

  // Controllers
  WishlistItemController: Symbol.for('WishlistItemController'),
};
