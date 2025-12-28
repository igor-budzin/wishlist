import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { cleanupAllTestData } from '../../src/features/auth/test-helpers/auth-test-helpers.js';

/**
 * E2E tests for Social OAuth authentication flow using Playwright
 *
 * These tests verify the complete OAuth flow in a real browser:
 * 1. User clicks on OAuth provider button (Google/Facebook/GitHub)
 * 2. Backend redirects to OAuth provider (mocked in test environment)
 * 3. OAuth provider redirects back with authorization code
 * 4. Backend exchanges code for user profile
 * 5. Backend creates/finds user and generates JWT tokens
 * 6. Frontend receives tokens and stores them in localStorage
 * 7. User is redirected to home page as authenticated
 *
 * Prerequisites:
 * - Frontend server running on http://localhost:3000
 * - Backend server running on http://localhost:3002
 * - Test environment (NODE_ENV=test) with test login endpoint enabled
 *
 * Run with: npm run test:e2e:social-auth
 */

describe('Social OAuth Browser E2E Tests', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const TIMEOUT = 30000; // 30 seconds

  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  afterEach(async () => {
    // Close page and context after each test
    if (page) {
      await page.close();
    }
    if (context) {
      await context.close();
    }

    // Clean up test data after each test
    await cleanupAllTestData();
  });

  describe('Login Page UI', () => {
    it('should display login page with all OAuth provider buttons', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      // Act
      await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });

      // Assert - Check page title and content
      await page.waitForSelector('text=Welcome back', { timeout: TIMEOUT });
      const welcomeText = await page.locator('text=Welcome back').textContent();
      expect(welcomeText).toContain('Welcome back');

      const signInText = await page
        .locator('text=Sign in to your account to continue')
        .textContent();
      expect(signInText).toBeTruthy();

      // Assert - Check all OAuth provider buttons are present
      const googleButton = page.locator('button:has-text("Continue with Google")');
      const facebookButton = page.locator('button:has-text("Continue with Facebook")');
      const githubButton = page.locator('button:has-text("Continue with GitHub")');

      await googleButton.waitFor({ state: 'visible', timeout: TIMEOUT });
      await facebookButton.waitFor({ state: 'visible', timeout: TIMEOUT });
      await githubButton.waitFor({ state: 'visible', timeout: TIMEOUT });

      expect(await googleButton.count()).toBeGreaterThan(0);
      expect(await facebookButton.count()).toBeGreaterThan(0);
      expect(await githubButton.count()).toBeGreaterThan(0);
    });

    it('should redirect authenticated users away from login page', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      // Login first using test endpoint
      const testEmail = `test-redirect-${Date.now()}@test.e2e.local`;
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });

      // Wait for redirect and tokens to be stored
      await page.waitForURL(`${FRONTEND_URL}/**`, { timeout: TIMEOUT });

      // Act - Try to navigate to login page
      await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });

      // Assert - Should be redirected to home page
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });
      expect(page.url()).toBe(`${FRONTEND_URL}/`);
    });
  });

  describe('OAuth Login Flow (Test Endpoint)', () => {
    it('should complete OAuth login flow and store tokens in localStorage', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-oauth-${Date.now()}@test.e2e.local`;

      // Act - Navigate to test login endpoint (simulates OAuth callback)
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });

      // Wait for redirect to auth callback page
      await page.waitForURL(`${FRONTEND_URL}/auth/callback**`, { timeout: TIMEOUT });

      // Wait for final redirect to home page
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Assert - Tokens should be stored in localStorage
      const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
      const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
      expect(accessToken.split('.')).toHaveLength(3); // JWT format: header.payload.signature
      expect(refreshToken.split('.')).toHaveLength(3);
    });

    it('should display authenticated UI after successful login', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-auth-ui-${Date.now()}@test.e2e.local`;

      // Act - Complete login flow
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });

      // Wait for redirect to home page
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Assert - Authenticated UI elements should be visible
      // Note: Exact selectors depend on your HomePage implementation
      await expect(page.locator('text=Add Item')).toBeVisible({ timeout: TIMEOUT });

      // Check that user can access their profile
      const profileLink = page.locator('a[href="/profile"]');
      if ((await profileLink.count()) > 0) {
        await expect(profileLink).toBeVisible();
      }
    });

    it('should allow authenticated API requests with stored tokens', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-api-${Date.now()}@test.e2e.local`;

      // Act - Complete login flow
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Get stored access token
      const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));

      // Make authenticated API request
      const response = await page.evaluate(
        async ({ apiUrl, token }) => {
          const res = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return {
            status: res.status,
            body: await res.json(),
          };
        },
        { apiUrl: BACKEND_URL, token: accessToken }
      );

      // Assert - API request should succeed
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data.provider).toBe('test');
    });

    it('should handle login errors gracefully', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      // Act - Navigate to login page with error parameter
      await page.goto(`${FRONTEND_URL}/login?error=auth_failed`, { waitUntil: 'networkidle' });

      // Assert - Error toast should be displayed
      // Note: Exact selector depends on your toast implementation (sonner)
      await expect(page.locator('text=/authentication failed/i')).toBeVisible({
        timeout: TIMEOUT,
      });
    });
  });

  describe('Authenticated State Management', () => {
    it('should persist authentication across page refreshes', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-persist-${Date.now()}@test.e2e.local`;

      // Complete login
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Act - Reload the page
      await page.reload({ waitUntil: 'networkidle' });

      // Assert - Should still be authenticated
      await expect(page.locator('text=Add Item')).toBeVisible({ timeout: TIMEOUT });

      // Verify tokens are still in localStorage
      const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
      const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
    });

    it('should protect routes and redirect to login when not authenticated', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      // Act - Try to access protected route without authentication
      await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle' });

      // Assert - Should be redirected to login page
      await page.waitForURL(`${FRONTEND_URL}/login`, { timeout: TIMEOUT });
      expect(page.url()).toBe(`${FRONTEND_URL}/login`);
    });

    it('should allow navigation between authenticated pages', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-nav-${Date.now()}@test.e2e.local`;

      // Complete login
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Act - Navigate to profile page
      await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });

      // Assert - Should load profile page successfully
      expect(page.url()).toBe(`${FRONTEND_URL}/profile`);
      await expect(page.locator('text=/profile/i')).toBeVisible({ timeout: TIMEOUT });

      // Act - Navigate back to home
      await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle' });

      // Assert - Should load home page
      expect(page.url()).toBe(`${FRONTEND_URL}/`);
    });
  });

  describe('Logout Flow', () => {
    it('should clear tokens and redirect to login after logout', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-logout-${Date.now()}@test.e2e.local`;

      // Complete login
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Navigate to profile page
      await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });

      // Act - Click sign out button
      const signOutButton = page.locator('button:has-text("Sign out")');
      await signOutButton.click();

      // Wait for redirect to login page
      await page.waitForURL(`${FRONTEND_URL}/login`, { timeout: TIMEOUT });

      // Assert - Should be on login page
      expect(page.url()).toBe(`${FRONTEND_URL}/login`);

      // Assert - Tokens should be cleared from localStorage
      const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
      const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));

      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });

    it('should prevent access to protected pages after logout', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-protect-${Date.now()}@test.e2e.local`;

      // Complete login
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Navigate to profile and logout
      await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });
      const signOutButton = page.locator('button:has-text("Sign out")');
      await signOutButton.click();
      await page.waitForURL(`${FRONTEND_URL}/login`, { timeout: TIMEOUT });

      // Act - Try to access home page after logout
      await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle' });

      // Assert - Should be redirected back to login
      await page.waitForURL(`${FRONTEND_URL}/login`, { timeout: TIMEOUT });
      expect(page.url()).toBe(`${FRONTEND_URL}/login`);

      // Act - Try to access profile page after logout
      await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });

      // Assert - Should be redirected to login
      await page.waitForURL(`${FRONTEND_URL}/login`, { timeout: TIMEOUT });
      expect(page.url()).toBe(`${FRONTEND_URL}/login`);
    });
  });

  describe('Token Security', () => {
    it('should clear tokens from URL hash after storing them', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-security-${Date.now()}@test.e2e.local`;

      // Act - Navigate to test login endpoint
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });

      // Wait for redirect to home page
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Assert - URL hash should be cleared (no tokens in URL)
      const currentUrl = page.url();
      expect(currentUrl).toBe(`${FRONTEND_URL}/`);
      expect(currentUrl).not.toContain('access_token');
      expect(currentUrl).not.toContain('refresh_token');
      expect(currentUrl).not.toContain('#');
    });

    it('should not expose tokens in browser history', async () => {
      // Arrange
      context = await browser.newContext();
      page = await context.newPage();

      const testEmail = `test-history-${Date.now()}@test.e2e.local`;

      // Act - Complete login flow
      await page.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

      // Navigate to another page
      await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle' });

      // Go back in history
      await page.goBack();

      // Assert - URL should not contain tokens
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('access_token');
      expect(currentUrl).not.toContain('refresh_token');
    });
  });

  describe('Multiple Users', () => {
    it('should handle different users in different browser contexts', async () => {
      // Arrange
      const testEmail1 = `test-user1-${Date.now()}@test.e2e.local`;
      const testEmail2 = `test-user2-${Date.now()}@test.e2e.local`;

      const context1 = await browser.newContext();
      const page1 = await context1.newPage();

      const context2 = await browser.newContext();
      const page2 = await context2.newPage();

      try {
        // Act - Login with first user
        await page1.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail1}`, {
          waitUntil: 'networkidle',
        });
        await page1.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

        // Act - Login with second user
        await page2.goto(`${BACKEND_URL}/api/auth/test-login?email=${testEmail2}`, {
          waitUntil: 'networkidle',
        });
        await page2.waitForURL(`${FRONTEND_URL}/`, { timeout: TIMEOUT });

        // Assert - Get user info for both contexts
        const user1Response = await page1.evaluate(
          async ({ apiUrl, token }) => {
            const res = await fetch(`${apiUrl}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return res.json();
          },
          {
            apiUrl: BACKEND_URL,
            token: await page1.evaluate(() => localStorage.getItem('access_token')),
          }
        );

        const user2Response = await page2.evaluate(
          async ({ apiUrl, token }) => {
            const res = await fetch(`${apiUrl}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return res.json();
          },
          {
            apiUrl: BACKEND_URL,
            token: await page2.evaluate(() => localStorage.getItem('access_token')),
          }
        );

        // Assert - Users should be different
        expect(user1Response.data.email).toBe(testEmail1);
        expect(user2Response.data.email).toBe(testEmail2);
        expect(user1Response.data.id).not.toBe(user2Response.data.id);
      } finally {
        await page1.close();
        await page2.close();
        await context1.close();
        await context2.close();
      }
    });
  });
});
