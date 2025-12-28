import passport from 'passport';
import { Strategy as PassportStrategy } from 'passport-strategy';

export interface MockOAuthProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

/**
 * Mock OAuth strategy for testing OAuth flows without real provider credentials
 * Extends Passport's base Strategy class to simulate OAuth provider responses
 */
export class MockOAuthStrategy extends PassportStrategy {
  name: string;
  private mockProfile: MockOAuthProfile | null = null;
  private shouldFail: boolean = false;

  constructor(strategyName: string) {
    super();
    this.name = strategyName;
  }

  /**
   * Set the mock user profile that will be returned on successful authentication
   */
  setMockProfile(profile: MockOAuthProfile): void {
    this.mockProfile = profile;
    this.shouldFail = false;
  }

  /**
   * Configure the strategy to fail authentication
   */
  setFailure(shouldFail: boolean = true): void {
    this.shouldFail = shouldFail;
  }

  /**
   * Simulate OAuth authentication flow
   * This is called by Passport.js when the OAuth callback is hit
   */
  authenticate(_req: unknown, _options?: unknown): void {
    if (this.shouldFail) {
      this.fail({ message: 'OAuth authentication failed' }, 401);
      return;
    }

    if (!this.mockProfile) {
      this.error(new Error('Mock profile not configured. Call setMockProfile() first.'));
      return;
    }

    // Simulate async OAuth callback
    // In real OAuth, this would involve API calls to the provider
    setImmediate(() => {
      this.success(this.mockProfile);
    });
  }
}

/**
 * Register mock OAuth strategies for all supported providers
 * Returns the mock strategy instances so tests can configure them
 */
export function registerMockOAuthStrategies(): {
  googleMock: MockOAuthStrategy;
  facebookMock: MockOAuthStrategy;
  githubMock: MockOAuthStrategy;
} {
  const googleMock = new MockOAuthStrategy('google');
  const facebookMock = new MockOAuthStrategy('facebook');
  const githubMock = new MockOAuthStrategy('github');

  // Unregister any existing strategies (in case tests run multiple times)
  passport.unuse('google');
  passport.unuse('facebook');
  passport.unuse('github');

  // Register mock strategies
  passport.use(googleMock);
  passport.use(facebookMock);
  passport.use(githubMock);

  return { googleMock, facebookMock, githubMock };
}

/**
 * Create a mock Google OAuth profile
 */
export function createMockGoogleProfile(
  overrides: Partial<MockOAuthProfile> = {}
): MockOAuthProfile {
  const timestamp = Date.now();
  return {
    id: `google-${timestamp}`,
    displayName: 'Test Google User',
    emails: [{ value: `test-${timestamp}@gmail.com` }],
    photos: [{ value: 'https://example.com/google-avatar.jpg' }],
    ...overrides,
  };
}

/**
 * Create a mock Facebook OAuth profile
 */
export function createMockFacebookProfile(
  overrides: Partial<MockOAuthProfile> = {}
): MockOAuthProfile {
  const timestamp = Date.now();
  return {
    id: `facebook-${timestamp}`,
    displayName: 'Test Facebook User',
    emails: [{ value: `test-${timestamp}@facebook.com` }],
    photos: [{ value: 'https://example.com/facebook-avatar.jpg' }],
    ...overrides,
  };
}

/**
 * Create a mock GitHub OAuth profile
 */
export function createMockGitHubProfile(
  overrides: Partial<MockOAuthProfile> = {}
): MockOAuthProfile {
  const timestamp = Date.now();
  return {
    id: `github-${timestamp}`,
    displayName: 'Test GitHub User',
    emails: [{ value: `test-${timestamp}@github.com` }],
    photos: [{ value: 'https://example.com/github-avatar.jpg' }],
    ...overrides,
  };
}
