import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { BusinessCoachingService } from '../services/businessCoachingService';

const router = Router();
const businessCoachingService = new BusinessCoachingService();
const businessController = new BusinessController(businessCoachingService);

// Logging middleware for all business routes
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 [${timestamp}] Business Route Access: ${req.method} ${req.path}`);
  console.log(`📍 [${timestamp}] Full URL: ${req.originalUrl}`);
  console.log(`📊 [${timestamp}] Request size: ${JSON.stringify(req.body).length} bytes`);
  next();
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
  businessController.saveProfile(req, res);
});

router.get('/profile/:userId', (req, res) => {
  console.log(`📍 Business Route: /profile/${req.params.userId} called`);
  businessController.getProfile(req, res);
});

router.post('/recommendations', (req, res) => {
  console.log('📍 Business Route: /recommendations called');
  businessController.getRecommendations(req, res);
});

export { router as businessRoutes, businessCoachingService }; 