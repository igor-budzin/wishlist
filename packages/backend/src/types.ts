export const TYPES = {
  // Infrastructure
  PrismaClient: Symbol.for('PrismaClient'),
  Logger: Symbol.for('Logger'),
  ConfigService: Symbol.for('ConfigService'),

  // Repositories
  WishlistItemRepository: Symbol.for('WishlistItemRepository'),
  AuthRepository: Symbol.for('AuthRepository'),

  // Services
  WishlistItemService: Symbol.for('WishlistItemService'),
  AuthService: Symbol.for('AuthService'),

  // Controllers
  WishlistItemController: Symbol.for('WishlistItemController'),
  AuthController: Symbol.for('AuthController'),
};
