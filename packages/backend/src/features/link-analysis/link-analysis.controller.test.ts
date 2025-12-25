import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../lib/prisma.js';

describe('LinkAnalysisController', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('POST /api/analyze-link', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/analyze-link')
        .send({ url: 'https://example.com/product/test' });

      expect(response.status).toBe(401);
    });

    // Note: Testing authenticated endpoints would require setting up test users and sessions
    // For now, we're testing that the endpoint exists and requires authentication
    // Full integration tests with authentication can be added later
  });

  describe('Link Analysis Endpoint Existence', () => {
    it('should have the analyze-link endpoint registered', async () => {
      // This test verifies the endpoint exists by checking for 401 (auth required)
      // rather than 404 (not found)
      const response = await request(app)
        .post('/api/analyze-link')
        .send({ url: 'https://example.com/product/test' });

      // We expect 401 (unauthorized) not 404 (not found)
      expect(response.status).not.toBe(404);
    });
  });
});
