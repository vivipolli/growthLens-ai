import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateEnvironment } from './config/environment';
import { agentRoutes, agentService } from './routes/agentRoutes';
import { businessRoutes, businessCoachingService } from './routes/businessRoutes';
import { authRoutes } from './routes/authRoutes';

async function startServer() {
  console.log('🚀 Starting Hedera AI Business Coaching Platform...');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Working directory: ${process.cwd()}`);
  
  try {
    console.log('🔧 Validating environment configuration...');
    validateEnvironment();
    console.log('✅ Environment configuration validated');
    
    console.log('🔧 Creating Express application...');
    const app = express();

    console.log('🛡️ Setting up security middleware...');
    app.use(helmet());
    console.log('✅ Helmet security middleware configured');
    
    // CORS configuration with environment variables
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173', 
      'http://localhost:5174',
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_2,
      process.env.FRONTEND_URL_3
    ].filter(Boolean); // Remove undefined values

    app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // In production, be more strict
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Not allowed by CORS'), false);
        }
        
        // In development, allow all origins
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    console.log('✅ CORS middleware configured for frontend');
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    console.log('✅ JSON and URL encoding middleware configured');

    console.log('🚦 Setting up rate limiting...');
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.'
    });
    app.use('/api', limiter);
    console.log('✅ Rate limiting configured (100 requests per 15 minutes)');

    console.log('🤖 Initializing AI services...');
    console.log('🔄 Initializing Agent Service...');
    await agentService.initialize();
    console.log('✅ Agent Service initialized successfully');
    
    console.log('🔄 Initializing Business Coaching Service...');
    await businessCoachingService.initialize();
    console.log('✅ Business Coaching Service initialized successfully');
    
    console.log('🎯 Hedera AI Agent and Business Coaching services initialized successfully');

    console.log('🛣️ Setting up API routes...');
    app.use('/api/agent', agentRoutes);
    console.log('✅ Agent routes configured at /api/agent');
    
    app.use('/api/business', businessRoutes);
    console.log('✅ Business routes configured at /api/business');

    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes configured at /api/auth');

    console.log('🏠 Setting up home route...');
    app.get('/', (req, res) => {
      console.log('📍 Home route accessed');
      res.json({
        message: 'Hedera AI Business Coaching Platform API',
        version: '1.0.0',
        services: {
          'basic_agent': 'Core Hedera AI Agent functionality',
          'business_coaching': 'AI-powered business coaching and insights'
        },
        endpoints: {
          health: 'GET /api/agent/health',
          chat: 'POST /api/agent/chat',
          createTransaction: 'POST /api/agent/transaction/create',
          signTransaction: 'POST /api/agent/transaction/sign',
          businessChat: 'POST /api/business/chat',
          generateInsights: 'POST /api/business/insights/generate',
          saveProfile: 'POST /api/business/profile/save',
          getRecommendations: 'POST /api/business/recommendations',
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          validateToken: 'GET /api/auth/validate',
          storeProfileOnBlockchain: 'POST /api/auth/profile/:userId/blockchain/store',
          verifyProfileOnBlockchain: 'POST /api/auth/profile/:userId/blockchain/verify',
          getHederaInfo: 'GET /api/auth/profile/:userId/hedera'
        }
      });
    });

    console.log('🔧 Setting up 404 handler...');
    app.use('*', (req, res) => {
      console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ error: 'Endpoint not found' });
    });

    console.log('🔧 Setting up error handler...');
    app.use((error: any, req: any, res: any, next: any) => {
      console.error('💥 Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    const port = Number(config.port);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    console.log(`🚀 Starting server on ${host}:${port}...`);
    
    app.listen(port, host, () => {
      console.log('🎉 =================================');
      console.log('🎉 SERVER STARTED SUCCESSFULLY!');
      console.log('🎉 =================================');
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `http://${host}:${port}` 
        : `http://localhost:${port}`;
      
      console.log(`🌐 Server running on ${host}:${port}`);
      console.log(`🔗 Business Coaching API available at ${baseUrl}`);
      console.log(`📋 API Documentation available at ${baseUrl}`);
      console.log(`🔍 Health check: ${baseUrl}/api/agent/health`);
      console.log(`💬 Business chat: ${baseUrl}/api/business/chat`);
      console.log('🎉 =================================');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    console.error('💥 Error type:', typeof error);
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

startServer(); 