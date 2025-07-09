import request from 'supertest';
import app from '../src/index';

describe('Integration Tests', () => {
  describe('Basic API Functionality', () => {
    it('should handle health check requests', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('running properly');
    });

    it('should serve Swagger documentation', async () => {
      const response = await request(app)
        .get('/api-docs')
        .redirects(1); // Allow one redirect

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should serve Swagger JSON', async () => {
      const response = await request(app)
        .get('/api-docs/swagger.json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('openapi');
    });
  });

  describe('Authentication Flow', () => {
    it('should validate registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        name: 'A'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate login data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Endpoints', () => {
    it('should require authentication for AI config', async () => {
      const response = await request(app)
        .get('/api/ai/config');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication for analysis', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication for history', async () => {
      const response = await request(app)
        .get('/api/history');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle large payloads appropriately', async () => {
      const largeUrl = 'https://example.com/' + 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/analyze')
        .set('Authorization', 'Bearer mock-token')
        .send({ url: largeUrl });

      // Should either accept or reject gracefully
      expect([200, 400, 413, 401, 403]).toContain(response.status);
    });
  });

  describe('Security', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should validate JWT tokens properly', async () => {
      const response = await request(app)
        .get('/api/ai/config')
        .set('Authorization', 'Bearer invalid.jwt.token');

      // Accept both 401 and 403 as valid responses for invalid tokens
      expect([401, 403]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/ai/config');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should respond to health check quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/health');

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple rapid requests', async () => {
      const startTime = Date.now();
      
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/health')
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 