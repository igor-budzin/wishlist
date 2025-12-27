import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JwtService } from './jwt.service.js';
import type { UserResponse } from './auth.service.js';

describe('JwtService', () => {
  let jwtService: JwtService;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    vi.resetModules();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '30d',
    };
    jwtService = new JwtService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should throw error if JWT_SECRET is missing', () => {
      process.env.JWT_SECRET = '';
      expect(() => new JwtService()).toThrow(
        'JWT_SECRET environment variable is required and must be at least 32 characters long'
      );
    });

    it('should throw error if JWT_SECRET is too short', () => {
      process.env.JWT_SECRET = 'short';
      expect(() => new JwtService()).toThrow(
        'JWT_SECRET environment variable is required and must be at least 32 characters long'
      );
    });

    it('should use default expiry values if not provided', () => {
      delete process.env.JWT_ACCESS_EXPIRY;
      delete process.env.JWT_REFRESH_EXPIRY;
      const service = new JwtService();
      expect(service).toBeDefined();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = jwtService.generateAccessToken('user123', 'test@example.com', 'google');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include userId, email, and provider in token payload', () => {
      const token = jwtService.generateAccessToken('user123', 'test@example.com', 'google');
      const payload = jwtService.verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user123');
      expect(payload?.email).toBe('test@example.com');
      expect(payload?.provider).toBe('google');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = jwtService.generateRefreshToken('user123', 'token-id-123');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include userId and tokenId in token payload', () => {
      const token = jwtService.generateRefreshToken('user123', 'token-id-123');
      const payload = jwtService.verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user123');
      expect(payload?.tokenId).toBe('token-id-123');
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const user: UserResponse = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        avatar: null,
        createdAt: new Date(),
      };

      const result = jwtService.generateTokenPair(user);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.tokenId).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate unique tokenId for each pair', () => {
      const user: UserResponse = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        avatar: null,
        createdAt: new Date(),
      };

      const pair1 = jwtService.generateTokenPair(user);
      const pair2 = jwtService.generateTokenPair(user);

      expect(pair1.tokenId).not.toBe(pair2.tokenId);
    });

    it('should set expiresAt to 30 days in the future', () => {
      const user: UserResponse = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        avatar: null,
        createdAt: new Date(),
      };

      const result = jwtService.generateTokenPair(user);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 30);

      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedDate.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode valid access token', () => {
      const token = jwtService.generateAccessToken('user123', 'test@example.com', 'google');
      const payload = jwtService.verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user123');
      expect(payload?.email).toBe('test@example.com');
      expect(payload?.provider).toBe('google');
    });

    it('should return null for invalid token', () => {
      const payload = jwtService.verifyAccessToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for token with wrong signature', () => {
      const token = jwtService.generateAccessToken('user123', 'test@example.com', 'google');

      // Create new service with different secret
      process.env.JWT_SECRET = 'different-secret-key-that-is-at-least-32-chars';
      const otherService = new JwtService();

      const payload = otherService.verifyAccessToken(token);
      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create service with very short expiry
      process.env.JWT_ACCESS_EXPIRY = '0s';
      const shortService = new JwtService();

      const token = shortService.generateAccessToken('user123', 'test@example.com', 'google');

      // Wait a bit for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const payload = shortService.verifyAccessToken(token);
          expect(payload).toBeNull();
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode valid refresh token', () => {
      const token = jwtService.generateRefreshToken('user123', 'token-id-123');
      const payload = jwtService.verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user123');
      expect(payload?.tokenId).toBe('token-id-123');
    });

    it('should return null for invalid token', () => {
      const payload = jwtService.verifyRefreshToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for token with wrong signature', () => {
      const token = jwtService.generateRefreshToken('user123', 'token-id-123');

      // Create new service with different secret
      process.env.JWT_SECRET = 'different-secret-key-that-is-at-least-32-chars';
      const otherService = new JwtService();

      const payload = otherService.verifyRefreshToken(token);
      expect(payload).toBeNull();
    });
  });

  describe('Token Compatibility', () => {
    it('should not accept refresh token as access token', () => {
      const refreshToken = jwtService.generateRefreshToken('user123', 'token-id-123');
      const payload = jwtService.verifyAccessToken(refreshToken);

      // Should verify but won't have expected access token fields
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user123');
      // email and provider should not exist on refresh token
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((payload as any).email).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((payload as any).provider).toBeUndefined();
    });

    it('should not accept access token as refresh token', () => {
      const accessToken = jwtService.generateAccessToken('user123', 'test@example.com', 'google');
      const payload = jwtService.verifyRefreshToken(accessToken);

      // Should verify but won't have expected refresh token fields
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user123');
      // tokenId should not exist on access token
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((payload as any).tokenId).toBeUndefined();
    });
  });
});
