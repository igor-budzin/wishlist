import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

describe('Backend Smoke Tests', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('should return 200 OK on health endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Database Connection', () => {
    it('should successfully connect to database', async () => {
      // Try to execute a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });
  });

  describe('API Authentication', () => {
    it('should require authentication for GET /api/items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(401);
    });

    it('should require authentication for POST /api/items', async () => {
      const response = await request(app).post('/api/items').send({
        title: 'Test Item',
        description: 'Test description',
        priority: 'medium',
      });

      expect(response.status).toBe(401);
    });

    it('should require authentication for DELETE /api/items', async () => {
      const response = await request(app).delete('/api/items/test-id');

      expect(response.status).toBe(401);
    });
  });

  describe('Public Endpoints', () => {
    it('should have accessible auth routes', async () => {
      // Test that auth routes exist
      // Possible responses:
      // - 302: OAuth redirect (provider configured)
      // - 401: Unauthorized (provider configured but no credentials)
      // - 500: Internal error (provider not configured in environment)
      const googleResponse = await request(app).get('/api/auth/google');
      expect([302, 401, 500]).toContain(googleResponse.status);

      const facebookResponse = await request(app).get('/api/auth/facebook');
      expect([302, 401, 500]).toContain(facebookResponse.status);

      const githubResponse = await request(app).get('/api/auth/github');
      expect([302, 401, 500]).toContain(githubResponse.status);
    });
  });
});
