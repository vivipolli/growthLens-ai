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

// Weekly Goals API
router.post('/weekly-goals', (req, res) => {
  console.log('📍 Business Route: /weekly-goals called');
  businessController.generateInsights(req, res);
});

// AI Insights API
router.post('/ai-insights', (req, res) => {
  console.log('📍 Business Route: /ai-insights called');
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

router.get('/user/:userId/topic', (req, res) => {
  console.log('📍 Business Route: /user/:userId/topic called');
  businessController.getTopicInfo(req, res);
});

export { router as businessRoutes, businessCoachingService }; 