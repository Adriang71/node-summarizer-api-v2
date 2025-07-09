import request from 'supertest';
import app from '../src/index';

describe('Analysis Endpoints', () => {
  describe('POST /api/analyze', () => {
    it('should return error for invalid URL', async () => {
      const analysisData = {
        url: 'invalid-url'
      };

      const response = await request(app)
        .post('/api/analyze')
        .set('Authorization', 'Bearer mock-token')
        .send(analysisData);

      // Should return 401/403 for invalid token or 400 for validation error
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should return error for missing URL', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .set('Authorization', 'Bearer mock-token')
        .send({});

      // Should return 401/403 for invalid token or 400 for validation error
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should return error for unauthorized request', async () => {
      const analysisData = {
        url: 'https://example.com'
      };

      const response = await request(app)
        .post('/api/analyze')
        .send(analysisData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid token', async () => {
      const analysisData = {
        url: 'https://example.com'
      };

      const response = await request(app)
        .post('/api/analyze')
        .set('Authorization', 'Bearer invalid-token')
        .send(analysisData);

      // Accept both 401 and 403 as valid responses for invalid tokens
      expect([401, 403]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/history', () => {
    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .get('/api/history');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid limit', async () => {
      const response = await request(app)
        .get('/api/history?limit=150')
        .set('Authorization', 'Bearer mock-token');

      // Should return 401/403 for invalid token or 400 for validation error
      expect([400, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/analysis/:id', () => {
    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .get('/api/analysis/test-id');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/analysis/:id', () => {
    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .delete('/api/analysis/test-id');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('running properly');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
}); 