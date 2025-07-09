import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { connectDatabase } from './config/database';
import { swaggerDocument } from './config/swagger';
import analysisRoutes from './routes/analysis';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://*.vercel.app', 'https://*.vercel.com', process.env.FRONTEND_URL || ''].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Compression middleware
app.use(compression());

// JSON parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Swagger JSON endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerDocument);
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static audio files
app.use('/audio', express.static(path.join(process.cwd(), 'uploads', 'audio')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Web Analyzer API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Application startup function
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`📝 API docs: http://localhost:${PORT}/api-docs`);
      console.log(`📊 Swagger JSON: http://localhost:${PORT}/api-docs/swagger.json`);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

// Connect to database for tests
async function connectForTests() {
  try {
    await connectDatabase();
    console.log('✅ Connected to database for tests');
  } catch (error) {
    console.warn('⚠️ Could not connect to database for tests:', error);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down server...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down server...');
  process.exit(0);
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
} else {
  // Connect to database for tests without starting server
  connectForTests();
}

export default app; 