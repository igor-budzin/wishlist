export const TYPES = {
  // Infrastructure
  PrismaClient: Symbol.for('PrismaClient'),
  Logger: Symbol.for('Logger'),
  ConfigService: Symbol.for('ConfigService'),

  // Repositories
  WishlistItemRepository: Symbol.for('WishlistItemRepository'),
  AuthRepository: Symbol.for('AuthRepository'),
  UserRepository: Symbol.for('UserRepository'),

  // Services
  WishlistItemService: Symbol.for('WishlistItemService'),
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),

  // Controllers
  WishlistItemController: Symbol.for('WishlistItemController'),
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};
