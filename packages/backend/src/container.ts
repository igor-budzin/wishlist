import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from './types.js';
import { ConfigService } from './config/index.js';
import { Logger } from './lib/logger.js';
import { WishlistItemRepository } from './features/wishlist/wishlist.repository.js';
import { WishlistItemService } from './features/wishlist/wishlist.service.js';
import { WishlistItemController } from './features/wishlist/wishlist.controller.js';
import { AuthRepository } from './features/auth/auth.repository.js';
import { AuthService } from './features/auth/auth.service.js';
import { AuthController } from './features/auth/auth.controller.js';
import { UserRepository } from './features/users/user.repository.js';
import { UserService } from './features/users/user.service.js';
import { UserController } from './features/users/user.controller.js';
import { prisma } from './lib/prisma.js';

const container = new Container();

// Infrastructure
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
container.bind<Logger>(TYPES.Logger).to(Logger).inSingletonScope();
container.bind<ConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();

// Repositories
container
  .bind<WishlistItemRepository>(TYPES.WishlistItemRepository)
  .to(WishlistItemRepository)
  .inSingletonScope();
container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository).inSingletonScope();
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

// Services
container
  .bind<WishlistItemService>(TYPES.WishlistItemService)
  .to(WishlistItemService)
  .inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();

// Controllers
container
  .bind<WishlistItemController>(TYPES.WishlistItemController)
  .to(WishlistItemController)
  .inTransientScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inTransientScope();
container.bind<UserController>(TYPES.UserController).to(UserController).inTransientScope();

export { container };
