# End-to-End Tests - Web Analyzer API

## 📋 Overview

This folder contains comprehensive end-to-end tests for the Web Analyzer API application. Tests verify all endpoints, user flows, and edge cases.

## 🏗️ Test Structure

```
tests/
├── setup.ts              # Global test configuration
├── helpers.ts            # Test helpers and utilities
├── auth.test.ts          # Authentication tests
├── analysis.test.ts      # Website analysis tests
├── ai.test.ts           # AI configuration tests
├── integration.test.ts   # Integration tests
├── main.test.ts         # Main endpoint tests
└── README.md            # This documentation
```

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test -- tests/auth.test.ts
```

### Tests with Coverage
```bash
npm test -- --coverage
```

### Tests in Watch Mode
```bash
npm test -- --watch
```

## 📊 Test Types

### 1. **Authentication Tests** (`auth.test.ts`)
- User registration
- Login
- Input validation
- Error handling

### 2. **Analysis Tests** (`analysis.test.ts`)
- Website analysis
- Analysis history
- Retrieving specific analyses
- Deleting analyses
- Health check

### 3. **AI Tests** (`ai.test.ts`)
- AI configuration
- Available models
- Available prompts
- Settings updates

### 4. **Integration Tests** (`integration.test.ts`)
- Complete user flow
- Concurrent request handling
- Performance tests
- Security tests

### 5. **Main Tests** (`main.test.ts`)
- Health check
- Swagger documentation
- CORS
- Security headers
- Error handling

## 🔧 Configuration

### Environment Variables
Create a `.env.test` file with test configuration:

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/web-analyzer-test
JWT_SECRET=test-jwt-secret
OPENROUTER_API_KEY=test-key
ELEVENLABS_API_KEY=test-key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Jest Configuration
The `jest.config.js` file contains:
- Timeout: 30 seconds
- Coverage reporting
- Setup files
- TypeScript support

## 🛠️ Helpers

### TestHelper Class
Contains helper methods:
- `registerUser()` - register test user
- `loginUser()` - user login
- `createAuthenticatedRequest()` - create authorized requests
- `generateUniqueEmail()` - generate unique emails
- `validateApiResponse()` - validate API responses
- `validateErrorResponse()` - validate errors

## 📈 Coverage

Tests cover:
- ✅ All API endpoints
- ✅ Input validation
- ✅ Error handling
- ✅ JWT authorization
- ✅ User flows
- ✅ Security
- ✅ Performance

## 🐛 Debugging

### Test Logs
```bash
npm test -- --verbose
```

### Single Test
```bash
npm test -- --testNamePattern="should register a new user"
```

### Debug with Node.js
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 🔄 CI/CD

### GitHub Actions
Add to `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## 📝 Adding New Tests

### 1. Create New Test File
```typescript
import request from 'supertest';
import app from '../src/index';
import { TestHelper } from './helpers';

describe('New Feature Tests', () => {
  it('should test new functionality', async () => {
    // Test implementation
  });
});
```

### 2. Use Helpers
```typescript
const { token, userId } = await TestHelper.registerUser({
  email: TestHelper.generateUniqueEmail(),
  password: 'password123',
  name: 'Test User'
});
```

### 3. Validate Responses
```typescript
TestHelper.validateApiResponse(response, 200);
TestHelper.validateErrorResponse(response, 400);
```

## 🚨 Best Practices

1. **Test Isolation** - each test should be independent
2. **Cleanup** - clean up data after tests
3. **Mocking** - mock external APIs in tests
4. **Timeout** - set appropriate timeouts for long operations
5. **Assertions** - use precise assertions
6. **Naming** - use descriptive test names

## 📊 Metrics

### Sample Results
```
Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        15.23 s
Ran all test suites.
```

### Coverage
```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.23 |    78.45 |   82.10 |   85.23 |
```