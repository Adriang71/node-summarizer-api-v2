import request from 'supertest';
import app from '../src/index';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  token?: string;
}

export interface TestAnalysis {
  url: string;
  userId: string;
}

export class TestHelper {
  private static testUsers: TestUser[] = [
    {
      email: 'test1@example.com',
      password: 'password123',
      name: 'Test User 1'
    },
    {
      email: 'test2@example.com',
      password: 'password456',
      name: 'Test User 2'
    }
  ];

  /**
   * Register a test user
   */
  static async registerUser(user: TestUser): Promise<{ token: string; userId: string }> {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: user.email,
        password: user.password,
        name: user.name
      });

    if (response.status !== 201) {
      throw new Error(`Failed to register user: ${response.body.error}`);
    }

    return {
      token: response.body.data.token,
      userId: response.body.data.user.id
    };
  }

  /**
   * Login a test user
   */
  static async loginUser(user: TestUser): Promise<{ token: string; userId: string }> {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: user.password
      });

    if (response.status !== 200) {
      throw new Error(`Failed to login user: ${response.body.error}`);
    }

    return {
      token: response.body.data.token,
      userId: response.body.data.user.id
    };
  }

  /**
   * Create authenticated request
   */
  static createAuthenticatedRequest(token: string) {
    return request(app).set('Authorization', `Bearer ${token}`);
  }

  /**
   * Get test user by index
   */
  static getTestUser(index: number = 0): TestUser {
    const user = this.testUsers[index];
    if (!user) {
      throw new Error(`Test user at index ${index} not found`);
    }
    return user;
  }

  /**
   * Generate unique email for testing
   */
  static generateUniqueEmail(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  /**
   * Clean up test data (to be implemented based on your database)
   */
  static async cleanupTestData(): Promise<void> {
    // This would typically clean up test data from the database
    // Implementation depends on your database setup
    console.log('Test data cleanup completed');
  }

  /**
   * Wait for a specified time (useful for async operations)
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(typeof response.body.success).toBe('boolean');
  }

  /**
   * Validate error response
   */
  static validateErrorResponse(response: any, expectedStatus: number = 400) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
  }
} 