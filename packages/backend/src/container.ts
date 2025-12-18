import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from './types.js';
import { ConfigService } from './config/index.js';
import { Logger } from './lib/logger.js';
import { WishlistItemRepository } from './features/wishlist/wishlist.repository.js';
import { WishlistItemService } from './features/wishlist/wishlist.service.js';
import { WishlistItemController } from './features/wishlist/wishlist.controller.js';
import { prisma } from './lib/prisma.js';

const container = new Container();

// Infrastructure
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
container.bind<Logger>(TYPES.Logger).to(Logger).inSingletonScope();
container.bind<ConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();

// Repositories
container.bind<WishlistItemRepository>(TYPES.WishlistItemRepository)
  .to(WishlistItemRepository)
  .inSingletonScope();

// Services
container.bind<WishlistItemService>(TYPES.WishlistItemService)
  .to(WishlistItemService)
  .inSingletonScope();

// Controllers
container.bind<WishlistItemController>(TYPES.WishlistItemController)
  .to(WishlistItemController)
  .inTransientScope();

export { container };
