import { injectable, inject } from 'inversify';
import { User } from '@prisma/client';
import { TYPES } from '../../types.js';
import type { IAuthRepository } from './auth.repository.js';
import type { ILogger } from '../../lib/logger.js';

export interface OAuthUserData {
  provider: string;
  providerId: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar: string | null;
  createdAt: Date;
}

export interface IAuthService {
  findOrCreateUser(oauthData: OAuthUserData): Promise<UserResponse>;
  getUserById(id: string): Promise<UserResponse | null>;
}

export class ProviderConflictError extends Error {
  existingProvider: string;
  attemptedProvider: string;

  constructor(existingProvider: string, attemptedProvider: string) {
    super(
      `This email is already registered with ${existingProvider}. Please use ${existingProvider} to log in.`
    );
    this.name = 'ProviderConflictError';
    this.existingProvider = existingProvider;
    this.attemptedProvider = attemptedProvider;
  }
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.AuthRepository) private repository: IAuthRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async findOrCreateUser(oauthData: OAuthUserData): Promise<UserResponse> {
    const { provider, providerId, name, email, avatar } = oauthData;

    // Try to find user by provider and providerId
    let user = await this.repository.findByProvider(provider, providerId);

    if (user) {
      this.logger.info(`User found: ${email} (${provider})`);
      await this.repository.updateLastLogin(user.id);
      return this.toResponse(user);
    }

    // Check if email is already used by another provider
    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(
        `Email ${email} already exists with provider ${existingUser.provider}. Cannot create account with ${provider}.`
      );
      throw new ProviderConflictError(existingUser.provider, provider);
    }

    // Create new user
    this.logger.info(`Creating new user: ${email} (${provider})`);
    user = await this.repository.create({
      name,
      email,
      provider,
      providerId,
      avatar,
    });

    return this.toResponse(user);
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await this.repository.findById(id);
    if (!user) {
      return null;
    }
    return this.toResponse(user);
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
