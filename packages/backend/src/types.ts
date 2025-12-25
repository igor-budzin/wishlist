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
  LinkAnalysisService: Symbol.for('LinkAnalysisService'),
  ContentExtractor: Symbol.for('ContentExtractor'),
  AIProvider: Symbol.for('AIProvider'),

  // Controllers
  WishlistItemController: Symbol.for('WishlistItemController'),
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
  LinkAnalysisController: Symbol.for('LinkAnalysisController'),
};
