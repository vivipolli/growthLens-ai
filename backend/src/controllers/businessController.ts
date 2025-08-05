import { Request, Response } from 'express';
import { BusinessCoachingService } from '../services/businessCoachingService';
import { BusinessInsightRequest, UserProfile } from '../types/business.types';

export class BusinessController {
  constructor(private businessCoachingService: BusinessCoachingService) {}

  generateInsights = async (req: Request, res: Response) => {
    try {
      const request: BusinessInsightRequest = req.body;
      
      if (req.path.includes('daily-missions')) {
        request.insightType = 'daily_missions';
      } else if (req.path.includes('business-observations')) {
        request.insightType = 'business_observations';
      }
      
      if (!request.userProfile || !request.insightType) {
        return res.status(400).json({
          error: 'userProfile and insightType are required'
        });
      }

      const response = await this.businessCoachingService.generateBusinessInsights(request);
      res.json(response);
      
    } catch (error) {
      console.error('BusinessController.generateInsights error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  businessChat = async (req: Request, res: Response) => {
    try {
      const { message, userProfile, chatHistory } = req.body;
      
      if (!message || !userProfile) {
        return res.status(400).json({
          error: 'message and userProfile are required'
        });
      }

      const response = await this.businessCoachingService.getChatResponse(
        message,
        userProfile as UserProfile,
        chatHistory || []
      );

      const finalResponse = {
        output: response,
        timestamp: new Date().toISOString()
      };
      
      res.json(finalResponse);
      
    } catch (error) {
      console.error('BusinessController.businessChat error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  saveProfile = async (req: Request, res: Response) => {
    try {
      const userProfile: UserProfile = req.body;
      
      if (!userProfile.personal || !userProfile.business) {
        return res.status(400).json({
          error: 'Complete personal and business profile data is required'
        });
      }

      userProfile.updated_at = new Date().toISOString();
      if (!userProfile.created_at) {
        userProfile.created_at = userProfile.updated_at;
      }

      res.json({
        success: true,
        message: 'Profile saved successfully',
        profile: userProfile
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      res.json({
        message: 'Profile retrieval endpoint - to be implemented with database',
        userId
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getRecommendations = async (req: Request, res: Response) => {
    try {
      const { userProfile, category } = req.body;
      
      if (!userProfile) {
        return res.status(400).json({
          error: 'userProfile is required'
        });
      }

      const insightTypes = ['content_strategy', 'audience_growth', 'monetization', 'goal_planning'];
      const targetType = category || insightTypes[Math.floor(Math.random() * insightTypes.length)];

      const request: BusinessInsightRequest = {
        userProfile,
        insightType: targetType as any
      };

      const response = await this.businessCoachingService.generateBusinessInsights(request);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  saveUserProfile = async (req: Request, res: Response) => {
    try {
      const { userId, profileData } = req.body;
      
      if (!userId || !profileData) {
        return res.status(400).json({
          error: 'userId and profileData are required'
        });
      }

      const profileDataWithClerkId = {
        ...profileData,
        clerkId: userId
      };

      const txId = await this.businessCoachingService.saveUserProfileToBlockchain(profileDataWithClerkId);
      
      if (txId) {
        res.json({
          success: true,
          message: 'User profile saved to blockchain',
          transactionId: txId,
          hashscanUrl: `https://hashscan.io/testnet/tx/${txId}`
        });
      } else {
        res.json({
          success: true,
          message: 'User profile saved locally',
          blockchainAvailable: false
        });
      }
      
    } catch (error) {
      console.error('Error saving user profile:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  saveBusinessData = async (req: Request, res: Response) => {
    try {
      const { userId, businessData } = req.body;
      
      if (!userId || !businessData) {
        return res.status(400).json({
          error: 'userId and businessData are required'
        });
      }

      const businessDataWithClerkId = {
        ...businessData,
        clerkId: userId
      };

      const txId = await this.businessCoachingService.saveBusinessDataToBlockchain(businessDataWithClerkId, userId);
      
      if (txId) {
        res.json({
          success: true,
          message: 'Business data saved to blockchain',
          transactionId: txId,
          hashscanUrl: `https://hashscan.io/testnet/tx/${txId}`
        });
      } else {
        res.json({
          success: true,
          message: 'Business data saved locally',
          blockchainAvailable: false
        });
      }
      
    } catch (error) {
      console.error('Error saving business data:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  saveMissionCompletion = async (req: Request, res: Response) => {
    try {
      const { userId, missionData } = req.body;
      
      if (!userId || !missionData) {
        return res.status(400).json({
          error: 'userId and missionData are required'
        });
      }

      const txId = await this.businessCoachingService.saveMissionCompletionToBlockchain(missionData);
      
      if (txId) {
        res.json({
          success: true,
          message: 'Mission completion saved to blockchain',
          transactionId: txId,
          hashscanUrl: `https://hashscan.io/testnet/tx/${txId}`
        });
      } else {
        res.json({
          success: true,
          message: 'Mission completion saved locally',
          blockchainAvailable: false
        });
      }
      
    } catch (error) {
      console.error('Error saving mission completion:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getUserDataFromBlockchain = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      const decodedUserId = decodeURIComponent(userId);
      const userData = await this.businessCoachingService.getUserDataFromBlockchain(decodedUserId);
      
      if (userData) {
        res.json({
          success: true,
          data: userData,
          userId: decodedUserId
        });
      } else {
        res.json({
          success: true,
          data: {
            userProfile: null,
            businessData: null,
            aiInsights: [],
            missionCompletions: []
          },
          userId: decodedUserId,
          message: 'No data found for this user yet. This is normal for new users.'
        });
      }
      
    } catch (error) {
      console.error('Error reading user data from blockchain:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getTopicInfo = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      const topicInfo = await this.businessCoachingService.getTopicInfo(userId);
      
      if (topicInfo) {
        res.json({
          success: true,
          data: topicInfo
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'No topic found for this user'
        });
      }
      
    } catch (error) {
      console.error('Error getting topic info:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
} 