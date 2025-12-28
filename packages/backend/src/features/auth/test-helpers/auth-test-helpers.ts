import type { Express } from 'express';
import request from 'supertest';
import { prisma } from '../../../lib/prisma.js';
import { container } from '../../../container.js';
import { TYPES } from '../../../types.js';
import type { IJwtService } from '../jwt.service.js';
import type { IAuthService } from '../auth.service.js';
import type { User } from '@prisma/client';

const TEST_EMAIL_DOMAIN = '@test.e2e.local';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  provider: string;
  providerId: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
  expiresAt: Date;
}

/**
 * Test context to track resources created during a test
 * Enables isolated cleanup per test
 */
export class TestContext {
  private userIds: Set<string> = new Set();

  trackUser(userId: string): void {
    this.userIds.add(userId);
  }

  async cleanup(): Promise<void> {
    // Delete only the users created in this test context
    // Cascade will automatically delete associated refresh tokens
    if (this.userIds.size > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: Array.from(this.userIds),
          },
        },
      });
      this.userIds.clear();
    }
  }
}

/**
 * Create a test user in the database with a unique email
 * @param overrides - Optional fields to override
 * @param context - Optional test context to track the user for cleanup
 */
export async function createTestUser(
  overrides: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> = {},
  context?: TestContext
): Promise<TestUser> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);

  const defaultUser = {
    name: 'Test User',
    email: `test-${timestamp}-${randomSuffix}${TEST_EMAIL_DOMAIN}`,
    provider: 'google',
    providerId: `test-${timestamp}-${randomSuffix}`,
    avatar: null,
  };

  const user = await prisma.user.create({
    data: { ...defaultUser, ...overrides },
  });

  // Track user in context for isolated cleanup
  if (context) {
    context.trackUser(user.id);
  }

  return user;
}

/**
 * Delete a specific test user by ID
 */
export async function deleteTestUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * Clean up all test users (identified by email domain)
 * Prisma cascade will automatically delete associated refresh tokens
 */
export async function cleanupAllTestData(): Promise<void> {
  await prisma.user.deleteMany();
  await prisma.refreshToken.deleteMany();
}

/**
 * Create a test user with a token pair (access + refresh tokens)
 * Stores the refresh token in the database
 */
export async function createTestTokenPair(userId: string): Promise<TokenPair> {
  const jwtService = container.get<IJwtService>(TYPES.JwtService);
  const authService = container.get<IAuthService>(TYPES.AuthService);

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
console.log('user', user);
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Generate token pair
  const tokens = jwtService.generateTokenPair({
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    avatar: user.avatar,
    createdAt: user.createdAt,
  });

  // Store refresh token in database
  await authService.storeRefreshToken(user.id, tokens.tokenId, tokens.expiresAt);

  return tokens;
}

/**
 * Revoke a refresh token by tokenId
 */
export async function revokeTestToken(tokenId: string): Promise<void> {
  const authService = container.get<IAuthService>(TYPES.AuthService);
  await authService.revokeRefreshToken(tokenId);
}

/**
 * Helper to make authenticated GET request with supertest
 * Automatically adds Authorization header with Bearer token
 */
export function makeAuthenticatedRequest(app: Express, token: string) {
  const agent = request(app);
  return {
    get: (url: string) => agent.get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => agent.post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => agent.put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => agent.delete(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Extract access and refresh tokens from OAuth redirect URL
 * Example: http://localhost:3000/auth/callback#access_token=xxx&refresh_token=yyy
 */
export function extractTokensFromRedirect(redirectUrl: string): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const match = redirectUrl.match(/access_token=([^&]+).*refresh_token=([^&]+)/);

  if (!match) {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: match[1],
    refreshToken: match[2],
  };
}

/**
 * Wait for a specified amount of time (in milliseconds)
 * Useful for testing token expiration
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
