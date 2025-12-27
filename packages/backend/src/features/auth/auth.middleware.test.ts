import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth, attachUser } from './auth.middleware.js';
import { container } from '../../container.js';
import { TYPES } from '../../types.js';
import type { IJwtService, AccessTokenPayload } from './jwt.service.js';

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

    // Setup container mock
    vi.mocked(container.get).mockImplementation((type: symbol) => {
      if (type === TYPES.JwtService) {
        return mockJwtService as IJwtService;
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

    it('should attach user to request and call next() for valid token', () => {
      const validPayload: AccessTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        provider: 'google',
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(validPayload);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        provider: 'google',
        name: '',
        avatar: null,
        createdAt: expect.any(Date),
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

    it('should handle different OAuth providers', () => {
      const providers = ['google', 'facebook', 'github'];

      providers.forEach((provider) => {
        const payload: AccessTokenPayload = {
          userId: 'user123',
          email: 'test@example.com',
          provider,
        };

        mockRequest.headers = { authorization: 'Bearer valid-token' };
        vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(payload);

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user?.provider).toBe(provider);
      });
    });

    it('should use JwtService from DI container', () => {
      const validPayload: AccessTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        provider: 'google',
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      vi.mocked(mockJwtService.verifyAccessToken).mockReturnValue(validPayload);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(container.get).toHaveBeenCalledWith(TYPES.JwtService);
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
