import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { UserResponse } from './auth.service.js';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  provider: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
  expiresAt: Date;
}

export interface IJwtService {
  generateAccessToken(userId: string, email: string, provider: string): string;
  generateRefreshToken(userId: string, tokenId: string): string;
  generateTokenPair(user: UserResponse): TokenPair;
  verifyAccessToken(token: string): AccessTokenPayload | null;
  verifyRefreshToken(token: string): RefreshTokenPayload | null;
}

@injectable()
export class JwtService implements IJwtService {
  private readonly jwtSecret: string;
  private readonly accessTokenExpiry: string | number;
  private readonly refreshTokenExpiry: string | number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || '';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '30d';

    if (!this.jwtSecret || this.jwtSecret.length < 32) {
      throw new Error(
        'JWT_SECRET environment variable is required and must be at least 32 characters long'
      );
    }
  }

  generateAccessToken(userId: string, email: string, provider: string): string {
    const payload: AccessTokenPayload = {
      userId,
      email,
      provider,
    };

    // @ts-expect-error - TypeScript has issues with string types for expiresIn, but it works at runtime
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256' as const,
    });
  }

  generateRefreshToken(userId: string, tokenId: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      tokenId,
    };

    // @ts-expect-error - TypeScript has issues with string types for expiresIn, but it works at runtime
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
      algorithm: 'HS256' as const,
    });
  }

  generateTokenPair(user: UserResponse): TokenPair {
    // Generate unique token ID for refresh token tracking
    const tokenId = randomBytes(32).toString('hex');

    const accessToken = this.generateAccessToken(user.id, user.email, user.provider);
    const refreshToken = this.generateRefreshToken(user.id, tokenId);

    // Calculate expiration date for refresh token (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return {
      accessToken,
      refreshToken,
      tokenId,
      expiresAt,
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as AccessTokenPayload;

      return decoded;
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;

      return decoded;
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }
}
