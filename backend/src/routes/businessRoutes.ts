import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { BusinessCoachingService } from '../services/businessCoachingService';

const router = Router();
const businessCoachingService = new BusinessCoachingService();
const businessController = new BusinessController(businessCoachingService);

// Test endpoint to check parser
router.post('/test-parser', (req, res) => {
  console.log('📍 Test parser endpoint called');
  
  const testResponse = {
    insights: [
      {
        id: "test-1",
        type: "strategy",
        title: "Test Mission 1",
        content: "This is a test mission for today",
        priority: "high",
        category: "content",
        action: "Test Mission 1",
        impact: "Test impact",
        confidence: 85,
        reasoning: "Test reasoning",
        timeline: "Today",
        resources: []
      },
      {
        id: "test-2",
        type: "strategy", 
        title: "Test Mission 2",
        content: "Another test mission for today",
        priority: "medium",
        category: "social",
        action: "Test Mission 2",
        impact: "Test impact",
        confidence: 85,
        reasoning: "Test reasoning",
        timeline: "Today",
        resources: []
      }
    ],
    summary: "Test missions generated",
    nextSteps: ["Test step 1", "Test step 2"],
    personalized_message: "Test personalized message"
  };
  
  res.json(testResponse);
});

// Logging middleware for all business routes
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 [${timestamp}] Business Route Access: ${req.method} ${req.path}`);
  console.log(`📍 [${timestamp}] Full URL: ${req.originalUrl}`);
  console.log(`📊 [${timestamp}] Request size: ${JSON.stringify(req.body).length} bytes`);
  next();
});

// Daily Missions API
router.post('/daily-missions', (req, res) => {
  console.log('📍 Business Route: /daily-missions called');
  businessController.generateInsights(req, res);
});



// Business Observations API
router.post('/business-observations', (req, res) => {
  console.log('📍 Business Route: /business-observations called');
  businessController.generateInsights(req, res);
});

router.post('/insights/generate', (req, res) => {
  console.log('📍 Business Route: /insights/generate called');
  businessController.generateInsights(req, res);
});

router.post('/chat', (req, res) => {
  console.log('📍 Business Route: /chat called');
  businessController.businessChat(req, res);
});

router.post('/profile/save', (req, res) => {
  console.log('📍 Business Route: /profile/save called');
  businessController.saveUserProfile(req, res);
});

router.post('/business/save', (req, res) => {
  console.log('📍 Business Route: /business/save called');
  businessController.saveBusinessData(req, res);
});

router.post('/mission/save', (req, res) => {
  console.log('📍 Business Route: /mission/save called');
  businessController.saveMissionCompletion(req, res);
});

router.get('/profile/:userId', (req, res) => {
  console.log(`📍 Business Route: /profile/${req.params.userId} called`);
  businessController.getProfile(req, res);
});

router.post('/recommendations', (req, res) => {
  console.log('📍 Business Route: /recommendations called');
  businessController.getRecommendations(req, res);
});

router.get('/user/:userId/data', (req, res) => {
  console.log('📍 Business Route: /user/:userId/data called');
  businessController.getUserDataFromBlockchain(req, res);
});

// 🔄 ENDPOINT SIMPLES: Usar qualquer ID único
router.get('/user/clerk/:clerkId/data', (req, res) => {
  console.log('📍 Business Route: /user/clerk/:clerkId/data called');
  businessController.getUserDataFromBlockchain(req, res);
});

router.get('/user/hedera/:accountId/data', (req, res) => {
  console.log('📍 Business Route: /user/hedera/:accountId/data called');
  businessController.getUserDataFromBlockchain(req, res);
});

router.get('/user/:userId/topic', (req, res) => {
  console.log('📍 Business Route: /user/:userId/topic called');
  businessController.getTopicInfo(req, res);
});

// Test endpoint to save simple business insight
router.post('/test/save-simple-insight', (req, res) => {
  console.log('📍 Business Route: /test/save-simple-insight called');
  
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  // Save a simple business insight (smaller message)
  const simpleInsight = {
    type: 'business_observation',
    timestamp: new Date().toISOString(),
    data: {
      insightType: 'daily_missions',
      insights: [
        {
          id: 'test-insight-1',
          title: 'Test Mission 1',
          content: 'This is a test mission for blockchain storage',
          priority: 'high',
          category: 'strategy'
        }
      ],
      summary: 'Test insights generated',
      nextSteps: ['Test step 1', 'Test step 2'],
      personalizedMessage: 'Test message'
    },
    userId: userId
  };
  
  businessCoachingService.saveBusinessInsightToBlockchain(userId, simpleInsight.data);
  
  res.json({
    success: true,
    message: 'Simple business insight saved to blockchain',
    data: simpleInsight
  });
});

// Debug endpoint to check cache and blockchain data
router.get('/test/debug-cache/:userId', (req, res) => {
  console.log('📍 Business Route: /test/debug-cache called');
  
  const { userId } = req.params;
  
  // Get cache data
  const cacheData = businessCoachingService.getCacheData ? businessCoachingService.getCacheData(userId) : 'No cache method available';
  
  // Get blockchain data
  businessCoachingService.getUserDataFromBlockchain(userId).then(blockchainData => {
    res.json({
      success: true,
      userId,
      cacheData,
      blockchainData,
      message: 'Debug data retrieved'
    });
  }).catch(error => {
    res.status(500).json({
      success: false,
      error: error.message,
      userId
    });
  });
});

// Test endpoint to force save AI insights
router.post('/test/force-save-insights', (req, res) => {
  console.log('📍 Business Route: /test/force-save-insights called');
  
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  // Create a test AI response
  const testResponse = {
    insights: [
      {
        id: 'force-test-1',
        title: 'Force Test Mission 1',
        content: 'This is a force test mission',
        priority: 'high',
        category: 'strategy'
      }
    ],
    summary: 'Force test insights generated',
    nextSteps: ['Force step 1', 'Force step 2'],
    personalized_message: 'Force test message'
  };
  
  // Force save to blockchain
  businessCoachingService.saveBusinessInsightToBlockchain(userId, testResponse).then((txId) => {
    res.json({
      success: true,
      message: 'Force save completed',
      transactionId: txId,
      data: testResponse
    });
  }).catch(error => {
    res.status(500).json({
      success: false,
      error: error.message
    });
  });
});

// Test endpoint to check cache directly
router.get('/test/cache/:userId', (req, res) => {
  console.log('📍 Business Route: /test/cache called');
  
  const { userId } = req.params;
  const cacheData = businessCoachingService.getCacheData(userId);
  
  res.json({
    success: true,
    userId,
    cacheData,
    message: 'Cache data retrieved'
  });
});

export { router as businessRoutes, businessCoachingService }; 