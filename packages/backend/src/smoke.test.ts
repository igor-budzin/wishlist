import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { prisma } from './lib/prisma.js';

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

  describe('API Endpoints', () => {
    it('should return success response for GET /api/items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).get('/api/items/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for POST /api/items without title', async () => {
      const response = await request(app).post('/api/items').send({
        description: 'Test description',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should create and delete an item successfully', async () => {
      // Create an item
      const createResponse = await request(app).post('/api/items').send({
        title: 'Smoke Test Item',
        description: 'This is a test item',
        priority: 'high',
      });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('success', true);
      expect(createResponse.body.data).toHaveProperty('id');
      expect(createResponse.body.data).toHaveProperty('title', 'Smoke Test Item');

      const itemId = createResponse.body.data.id;

      // Get the item
      const getResponse = await request(app).get(`/api/items/${itemId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data).toHaveProperty('id', itemId);

      // Delete the item
      const deleteResponse = await request(app).delete(`/api/items/${itemId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('success', true);

      // Verify item is deleted
      const verifyResponse = await request(app).get(`/api/items/${itemId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});
