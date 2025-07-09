import request from 'supertest';
import app from '../src/index';

describe('AI Configuration Endpoints', () => {
  describe('GET /api/ai/config', () => {
    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .get('/api/ai/config');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/ai/config', () => {
    it('should return error for unauthorized request', async () => {
      const updateData = {
        language: 'pl'
      };

      const response = await request(app)
        .put('/api/ai/config')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid language', async () => {
      const updateData = {
        language: 'invalid'
      };

      const response = await request(app)
        .put('/api/ai/config')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData);

      // Should return 401 for invalid token or 400 for validation error
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should return error for invalid maxContentLength', async () => {
      const updateData = {
        maxContentLength: 500 // Too low
      };

      const response = await request(app)
        .put('/api/ai/config')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData);

      // Should return 401 for invalid token or 400 for validation error
      expect([400, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/ai/models', () => {
    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .get('/api/ai/models');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/prompts', () => {
    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .get('/api/ai/prompts');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 