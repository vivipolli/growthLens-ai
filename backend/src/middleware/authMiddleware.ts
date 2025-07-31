import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware to authenticate JWT token
   */
  authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          error: 'Access token required'
        });
      }

      const user = await this.authService.validateToken(token);
      
      if (!user) {
        return res.status(403).json({
          error: 'Invalid or expired token'
        });
      }

      // Add user to request object
      (req as any).user = user;
      next();

    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      return res.status(401).json({
        error: 'Authentication failed'
      });
    }
  };

  /**
   * Middleware to check if user has Hedera account
   */
  requireHederaAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user || !user.hederaAccountId) {
        return res.status(403).json({
          error: 'Hedera account required for this operation'
        });
      }

      next();

    } catch (error) {
      console.error('❌ Hedera account check error:', error);
      return res.status(403).json({
        error: 'Hedera account verification failed'
      });
    }
  };

  /**
   * Middleware to check if user profile is complete
   */
  requireCompleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user || !user.profileComplete) {
        return res.status(403).json({
          error: 'Complete profile required for this operation'
        });
      }

      next();

    } catch (error) {
      console.error('❌ Profile completion check error:', error);
      return res.status(403).json({
        error: 'Profile completion verification failed'
      });
    }
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        const user = await this.authService.validateToken(token);
        if (user) {
          (req as any).user = user;
        }
      }

      next();

    } catch (error) {
      // Don't fail, just continue without user
      console.log('⚠️ Optional auth failed, continuing without user');
      next();
    }
  };
} 