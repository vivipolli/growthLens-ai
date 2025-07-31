import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
  /**
   * Sync user data from Clerk frontend with Hedera backend
   */
  async syncUser(req: Request, res: Response) {
    try {
      console.log('📡 Received user sync request');
      
      const { userData } = req.body;
      
      if (!userData || !userData.id) {
        console.log('❌ Missing user data in request');
        return res.status(400).json({
          success: false,
          error: 'Missing user data'
        });
      }

      console.log(`👤 Syncing user: ${userData.emailAddresses?.[0]?.emailAddress || userData.id}`);

      // Create user with Hedera account
      const email = userData.emailAddresses?.[0]?.emailAddress || userData.email;
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';
      const name = `${firstName} ${lastName}`.trim() || 'User';
      
      // Generate secure random password for Clerk users
      const password = Math.random().toString(36).slice(-12) + 
                      Math.random().toString(36).toUpperCase().slice(-4) + 
                      Math.floor(Math.random() * 10) + 
                      '!@#$%^&*'[Math.floor(Math.random() * 8)];

      const result = await authService.registerUser(email, password, name);

      if (!result) {
        console.log('❌ Failed to create user');
        return res.status(500).json({
          success: false,
          error: 'Failed to create user with Hedera'
        });
      }

      console.log(`✅ User created successfully: ${result.user.email} -> Hedera: ${result.user.hederaAccountId}`);

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            hederaAccountId: result.user.hederaAccountId
          },
          token: result.token
        }
      });

    } catch (error) {
      console.error('❌ Auth sync error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
      }

      const result = await authService.registerUser(email, password, name);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            hederaAccountId: result.user.hederaAccountId
          },
          token: result.token
        }
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.loginUser(email, password);

      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            hederaAccountId: result.user.hederaAccountId
          },
          token: result.token
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token is required'
        });
      }

      await authService.logoutUser(token);

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('❌ Logout error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      });
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token is required'
        });
      }

      const user = await authService.validateToken(token);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            hederaAccountId: user.hederaAccountId
          }
        }
      });

    } catch (error) {
      console.error('❌ Token validation error:', error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      });
    }
  }

  /**
   * Store user profile on blockchain
   */
  async storeProfileOnBlockchain(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const profileData = req.body;

      if (!userId || !profileData) {
        return res.status(400).json({
          success: false,
          error: 'User ID and profile data are required'
        });
      }

      const result = await authService.storeProfileOnBlockchain(userId, profileData);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ Store profile error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to store profile'
      });
    }
  }

  /**
   * Verify user profile on blockchain
   */
  async verifyProfileOnBlockchain(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const profileData = req.body;

      if (!userId || !profileData) {
        return res.status(400).json({
          success: false,
          error: 'User ID and profile data are required'
        });
      }

      const isValid = await authService.verifyProfileOnBlockchain(userId, profileData);

      res.json({
        success: true,
        data: { isValid }
      });

    } catch (error) {
      console.error('❌ Verify profile error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify profile'
      });
    }
  }

  /**
   * Get user's Hedera account information
   */
  async getHederaInfo(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const hederaInfo = await authService.getUserHederaInfo(userId);

      res.json({
        success: true,
        data: hederaInfo
      });

    } catch (error) {
      console.error('❌ Get Hedera info error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get Hedera info'
      });
    }
  }

  /**
   * Get user profile
   */
  getProfile = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'User ID is required'
        });
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User profile retrieved',
        data: { user }
      });

    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get profile'
      });
    }
  };
} 