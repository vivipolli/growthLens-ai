import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// Logging middleware for auth routes
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [${timestamp}] Auth Route Access: ${req.method} ${req.path}`);
  console.log(`📍 [${timestamp}] Full URL: ${req.originalUrl}`);
  next();
});

// Sync user data from Clerk
router.post('/sync', authController.syncUser.bind(authController));

// Public routes (no authentication required)
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes (authentication required)
router.post('/logout', authController.logout.bind(authController));
router.post('/validate', authController.validateToken.bind(authController));

// User profile routes
router.get('/profile/:userId', (req, res) => {
  console.log(`📍 Auth Route: /profile/${req.params.userId} called`);
  authController.getProfile(req, res);
});

// Blockchain integration routes
router.post('/profile/:userId/blockchain/store', authController.storeProfileOnBlockchain.bind(authController));
router.post('/profile/:userId/blockchain/verify', authController.verifyProfileOnBlockchain.bind(authController));
router.get('/profile/:userId/hedera', authController.getHederaInfo.bind(authController));

export { router as authRoutes }; 