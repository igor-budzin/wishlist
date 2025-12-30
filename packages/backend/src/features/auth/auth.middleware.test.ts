import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { User } from '@prisma/client';
import { requireAuth, attachUser } from './auth.middleware.js';
import { container } from '../../container.js';
import { TYPES } from '../../types.js';
import type { IJwtService, AccessTokenPayload } from './jwt.service.js';
import type { IUserRepository } from '../users/user.repository.js';

// Mock the container
vi.mock('../../container.js', () => ({
  container: {
    get: vi.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJwtService: Partial<IJwtService>;
  let mockUserRepository: Partial<IUserRepository>;

  beforeEach(() => {
    // Reset mocks
    mockRequest = {
      headers: {},
      user: undefined,
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();

    mockJwtService = {
      verifyAccessToken: vi.fn(),
    };

    mockUserRepository = {
      findById: vi.fn(),
    };

    // Setup container mock
    vi.mocked(container.get).mockImplementation((type: symbol) => {
      if (type === TYPES.JwtService) {
        return mockJwtService as IJwtService;
      }
      if (type === TYPES.UserRepository) {
        return mockUserRepository as IUserRepository;
      }
      throw new Error(`Unexpected type: ${type.toString()}`);
    });
  });

  describe('requireAuth', () => {
    it('should return 401 if no Authorization header is present', () => {
      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header does not start with "Bearer "', () => {
      mockRequest.headers = { authorization: 'Basic xyz' };

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(null);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith('invalid-token');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should attach user to request and call next() for valid token', async () => {
      const validPayload: AccessTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        provider: 'google',
      };

      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        provider: 'google',
        providerId: 'google123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(validPayload);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockRequest.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        provider: 'google',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should extract token correctly from Authorization header', () => {
      const validPayload: AccessTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        provider: 'google',
      };

      mockRequest.headers = { authorization: 'Bearer my.jwt.token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(validPayload);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith('my.jwt.token');
    });

    it('should handle different OAuth providers', async () => {
      const providers = ['google', 'facebook', 'github'];

      for (const provider of providers) {
        const payload: AccessTokenPayload = {
          userId: 'user123',
          email: 'test@example.com',
          provider,
        };

        const mockUser: User = {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          avatar: null,
          provider,
          providerId: `${provider}123`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockRequest.headers = { authorization: 'Bearer valid-token' };
        vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(payload);
        vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

        await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user?.provider).toBe(provider);
      }
    });

    it('should return 401 if user not found in database', async () => {
      const validPayload: AccessTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        provider: 'google',
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(validPayload);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use JwtService from DI container', async () => {
      const validPayload: AccessTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        provider: 'google',
      };

      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        provider: 'google',
        providerId: 'google123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(validPayload);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(container.get).toHaveBeenCalledWith(TYPES.JwtService);
      expect(container.get).toHaveBeenCalledWith(TYPES.UserRepository);
    });
  });

  describe('attachUser', () => {
    it('should call next() without modification', () => {
      attachUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should not modify request or response', () => {
      const originalRequest = { ...mockRequest };
      const originalResponse = { ...mockResponse };

      attachUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest).toEqual(originalRequest);
      expect(mockResponse).toEqual(originalResponse);
    });
  });
});
