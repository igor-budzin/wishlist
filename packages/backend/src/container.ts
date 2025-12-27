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
import { JwtService } from './features/auth/jwt.service.js';
import { AuthController } from './features/auth/auth.controller.js';
import { UserRepository } from './features/users/user.repository.js';
import { UserService } from './features/users/user.service.js';
import { UserController } from './features/users/user.controller.js';
import { LinkAnalysisService } from './features/link-analysis/link-analysis.service.js';
import { LinkAnalysisController } from './features/link-analysis/link-analysis.controller.js';
import { ContentExtractorService } from './features/link-analysis/content-extractor.service.js';
import { OpenAIProvider } from './features/link-analysis/openai-provider.service.js';
import { MockAIProvider } from './features/link-analysis/mock-ai-provider.service.js';
import type { IAIProvider } from './features/link-analysis/ai-provider.interface.js';
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
container.bind<JwtService>(TYPES.JwtService).to(JwtService).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container
  .bind<LinkAnalysisService>(TYPES.LinkAnalysisService)
  .to(LinkAnalysisService)
  .inSingletonScope();
container
  .bind<ContentExtractorService>(TYPES.ContentExtractor)
  .to(ContentExtractorService)
  .inSingletonScope();

// Use MockAIProvider in test/CI environments, OpenAIProvider in production
const shouldUseMock = process.env.NODE_ENV === 'test' || process.env.CI === 'true';
if (shouldUseMock) {
  container.bind<IAIProvider>(TYPES.AIProvider).to(MockAIProvider).inSingletonScope();
} else {
  container.bind<IAIProvider>(TYPES.AIProvider).to(OpenAIProvider).inSingletonScope();
}

// Controllers
container
  .bind<WishlistItemController>(TYPES.WishlistItemController)
  .to(WishlistItemController)
  .inTransientScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inTransientScope();
container.bind<UserController>(TYPES.UserController).to(UserController).inTransientScope();
container
  .bind<LinkAnalysisController>(TYPES.LinkAnalysisController)
  .to(LinkAnalysisController)
  .inTransientScope();

export { container };
