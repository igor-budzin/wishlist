import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as AppleStrategy } from 'passport-apple';
import type { IAuthService, UserResponse } from './auth.service.js';
import type { ILogger } from '../../lib/logger.js';

export function configurePassport(authService: IAuthService, logger: ILogger) {
  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    logger.debug(`Serializing user to session: ${(user as UserResponse).id}`);
    done(null, (user as UserResponse).id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      logger.debug(`Deserializing user from session: ${id}`);
      const user = await authService.getUserById(id);
      if (!user) {
        logger.warn(`User not found during deserialization: ${id}`);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      logger.error('Error deserializing user', error);
      done(error);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            logger.info(`Google OAuth callback for user: ${profile.emails?.[0]?.value}`);

            const user = await authService.findOrCreateUser({
              provider: 'google',
              providerId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value,
            });

            logger.info(`Google OAuth successful for: ${user.email}`);
            done(null, user);
          } catch (error) {
            logger.error('Google OAuth error', error);
            done(error as Error);
          }
        }
      )
    );
  } else {
    logger.warn('Google OAuth not configured - missing credentials');
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'emails', 'photos'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            logger.info(`Facebook OAuth callback for user: ${profile.emails?.[0]?.value}`);

            const user = await authService.findOrCreateUser({
              provider: 'facebook',
              providerId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value,
            });

            logger.info(`Facebook OAuth successful for: ${user.email}`);
            done(null, user);
          } catch (error) {
            logger.error('Facebook OAuth error', error);
            done(error as Error);
          }
        }
      )
    );
  } else {
    logger.warn('Facebook OAuth not configured - missing credentials');
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
          scope: ['user:email'],
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            logger.info(`GitHub OAuth callback for user: ${profile.emails?.[0]?.value}`);

            const user = await authService.findOrCreateUser({
              provider: 'github',
              providerId: profile.id,
              name: profile.displayName || profile.username,
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value,
            });

            logger.info(`GitHub OAuth successful for: ${user.email}`);
            done(null, user);
          } catch (error) {
            logger.error('GitHub OAuth error', error);
            done(error as Error);
          }
        }
      )
    );
  } else {
    logger.warn('GitHub OAuth not configured - missing credentials');
  }

  // Apple OAuth Strategy
  if (
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY
  ) {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyString: process.env.APPLE_PRIVATE_KEY,
          callbackURL: process.env.APPLE_CALLBACK_URL || '/api/auth/apple/callback',
          passReqToCallback: false,
        } as any,
        async (_accessToken: any, _refreshToken: any, _idToken: any, profile: any, done: any) => {
          try {
            logger.info(`Apple OAuth callback for user: ${profile.email}`);

            const user = await authService.findOrCreateUser({
              provider: 'apple',
              providerId: profile.id,
              name: profile.name?.firstName
                ? `${profile.name.firstName} ${profile.name.lastName || ''}`
                : profile.email,
              email: profile.email,
            });

            logger.info(`Apple OAuth successful for: ${user.email}`);
            done(null, user);
          } catch (error) {
            logger.error('Apple OAuth error', error);
            done(error as Error);
          }
        }
      )
    );
  } else {
    logger.warn('Apple OAuth not configured - missing credentials');
  }

  return passport;
}
