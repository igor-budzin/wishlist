import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller.js';
import type { IAuthService, UserResponse } from './auth.service.js';
import type { IJwtService, RefreshTokenPayload } from './jwt.service.js';
import type { ILogger } from '../../lib/logger.js';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: Partial<IAuthService>;
  let mockJwtService: Partial<IJwtService>;
  let mockLogger: Partial<ILogger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Create mocks
    mockAuthService = {
      revokeRefreshToken: vi.fn(),
      isRefreshTokenValid: vi.fn(),
      getUserById: vi.fn(),
    };

    mockJwtService = {
      verifyRefreshToken: vi.fn(),
      generateAccessToken: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    mockRequest = {
      body: {},
      user: undefined,
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();

    // Create controller with mocks
    authController = new AuthController(
      mockLogger as ILogger,
      mockAuthService as IAuthService,
      mockJwtService as IJwtService
    );
  });

  describe('me', () => {
    it('should return 401 if user is not authenticated', async () => {
      await authController.me(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authenticated',
      });
    });

    it('should return user data if authenticated', async () => {
      const user: UserResponse = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        avatar: null,
        createdAt: new Date(),
      };

      mockRequest.user = user;

      await authController.me(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: user,
      });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke refresh token if provided', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload: RefreshTokenPayload = {
        userId: 'user123',
        tokenId: 'token-id-123',
      };

      mockRequest.body = { refreshToken };
      (mockJwtService.verifyRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue(payload);

      await authController.logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthService.revokeRefreshToken).toHaveBeenCalledWith('token-id-123');
      expect(mockLogger.info).toHaveBeenCalledWith('User logged out: user123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should succeed even if refresh token is invalid', async () => {
      const refreshToken = 'invalid-token';
      mockRequest.body = { refreshToken };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(null);

      await authController.logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthService.revokeRefreshToken).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should succeed if no refresh token provided', async () => {
      mockRequest.body = {};

      await authController.logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verifyRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthService.revokeRefreshToken).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should call next with error if service throws', async () => {
      const error = new Error('Database error');
      mockRequest.body = { refreshToken: 'valid-token' };
      const payload: RefreshTokenPayload = { userId: 'user123', tokenId: 'token-id-123' };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(payload);
      vi.mocked(mockAuthService.revokeRefreshToken).mockRejectedValue(error);

      await authController.logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refresh', () => {
    const validUser: UserResponse = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      provider: 'google',
      avatar: null,
      createdAt: new Date(),
    };

    it('should return 400 if refresh token is not provided', async () => {
      mockRequest.body = {};

      await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Refresh token is required',
      });
    });

    it('should return 401 if refresh token is invalid', async () => {
      mockRequest.body = { refreshToken: 'invalid-token' };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(null);

      await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    });

    it('should return 401 if refresh token is revoked', async () => {
      const payload: RefreshTokenPayload = {
        userId: 'user123',
        tokenId: 'token-id-123',
      };

      mockRequest.body = { refreshToken: 'valid-token' };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(payload);
      vi.mocked(mockAuthService.isRefreshTokenValid).mockResolvedValue(false);

      await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.isRefreshTokenValid).toHaveBeenCalledWith('token-id-123');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Refresh token has been revoked',
      });
    });

    it('should return 404 if user not found', async () => {
      const payload: RefreshTokenPayload = {
        userId: 'user123',
        tokenId: 'token-id-123',
      };

      mockRequest.body = { refreshToken: 'valid-token' };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(payload);
      vi.mocked(mockAuthService.isRefreshTokenValid).mockResolvedValue(true);
      vi.mocked(mockAuthService.getUserById).mockResolvedValue(null);

      await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.getUserById).toHaveBeenCalledWith('user123');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
    });

    it('should generate new access token for valid refresh token', async () => {
      const payload: RefreshTokenPayload = {
        userId: 'user123',
        tokenId: 'token-id-123',
      };
      const newAccessToken = 'new-access-token';

      mockRequest.body = { refreshToken: 'valid-refresh-token' };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(payload);
      vi.mocked(mockAuthService.isRefreshTokenValid).mockResolvedValue(true);
      vi.mocked(mockAuthService.getUserById).mockResolvedValue(validUser);
      vi.mocked(mockJwtService.generateAccessToken).mockReturnValue(newAccessToken);

      await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith(
        'user123',
        'test@example.com',
        'google'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Access token refreshed for user: user123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { accessToken: newAccessToken },
      });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
      const error = new Error('Database error');
      const payload: RefreshTokenPayload = {
        userId: 'user123',
        tokenId: 'token-id-123',
      };

      mockRequest.body = { refreshToken: 'valid-token' };
      vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(payload);
      vi.mocked(mockAuthService.isRefreshTokenValid).mockRejectedValue(error);

      await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle different OAuth providers', async () => {
      const providers: Array<'google' | 'facebook' | 'github'> = ['google', 'facebook', 'github'];

      for (const provider of providers) {
        const user: UserResponse = {
          ...validUser,
          provider,
        };

        const payload: RefreshTokenPayload = {
          userId: 'user123',
          tokenId: 'token-id-123',
        };

        mockRequest.body = { refreshToken: 'valid-token' };
        vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(payload);
        vi.mocked(mockAuthService.isRefreshTokenValid).mockResolvedValue(true);
        vi.mocked(mockAuthService.getUserById).mockResolvedValue(user);
        vi.mocked(mockJwtService.generateAccessToken).mockReturnValue('new-token');

        await authController.refresh(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith(
          'user123',
          'test@example.com',
          provider
        );
      }
    });
  });
});
