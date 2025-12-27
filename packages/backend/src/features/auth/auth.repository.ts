import { injectable, inject } from 'inversify';
import { PrismaClient, User, RefreshToken } from '@prisma/client';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';

export interface CreateUserData {
  name: string;
  email: string;
  provider: string;
  providerId: string;
  avatar?: string;
}

export interface CreateRefreshTokenData {
  tokenId: string;
  userId: string;
  expiresAt: Date;
}

export interface IAuthRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByProvider(provider: string, providerId: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken>;
  findRefreshToken(tokenId: string): Promise<RefreshToken | null>;
  revokeRefreshToken(tokenId: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
}

@injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async findById(id: string): Promise<User | null> {
    this.logger.debug(`Finding user by id: ${id}`);
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`);
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    this.logger.debug(`Finding user by provider: ${provider}, providerId: ${providerId}`);
    return this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    this.logger.info(`Creating user: ${data.email} (${data.provider})`);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        provider: data.provider,
        providerId: data.providerId,
        avatar: data.avatar,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    this.logger.debug(`Updating last login for user: ${id}`);
    await this.prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken> {
    this.logger.debug(`Creating refresh token for user: ${data.userId}`);
    return this.prisma.refreshToken.create({
      data: {
        tokenId: data.tokenId,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findRefreshToken(tokenId: string): Promise<RefreshToken | null> {
    this.logger.debug(`Finding refresh token: ${tokenId}`);
    return this.prisma.refreshToken.findUnique({
      where: { tokenId },
    });
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    this.logger.debug(`Revoking refresh token: ${tokenId}`);
    await this.prisma.refreshToken.update({
      where: { tokenId },
      data: { revoked: true },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    this.logger.debug(`Deleting all refresh tokens for user: ${userId}`);
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
