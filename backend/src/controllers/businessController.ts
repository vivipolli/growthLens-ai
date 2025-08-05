import { Request, Response } from 'express';
import { BusinessCoachingService } from '../services/businessCoachingService';
import { BusinessInsightRequest, UserProfile } from '../types/business.types';

export class BusinessController {
  constructor(private businessCoachingService: BusinessCoachingService) {}

  generateInsights = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.generateInsights: New request received`);
    console.log(`📝 [${requestId}] Request body: ${req.body ? 'Present' : 'Missing'}`);
    console.log(`📝 [${requestId}] Request body keys: ${req.body ? Object.keys(req.body) : 'No body'}`);
    console.log(`📝 [${requestId}] Request headers: ${req.headers ? 'Present' : 'Missing'}`);
    console.log(`📝 [${requestId}] Content-Type: ${req.headers?.['content-type'] || 'Not specified'}`);
    console.log(`📝 [${requestId}] Request path: ${req.path}`);
    
    try {
      const request: BusinessInsightRequest = req.body;
      
      // Determine insight type based on the request path
      if (req.path.includes('daily-missions')) {
        request.insightType = 'daily_missions';
      
      } else if (req.path.includes('business-observations')) {
        request.insightType = 'business_observations';
      }
      
      console.log(`📝 [${requestId}] Request data:`, {
        hasUserProfile: !!request.userProfile,
        insightType: request.insightType,
        userProfileKeys: request.userProfile ? Object.keys(request.userProfile) : []
      });
      
      if (!request.userProfile || !request.insightType) {
        console.error(`❌ [${requestId}] Missing required fields - userProfile: ${!!request.userProfile}, insightType: ${!!request.insightType}`);
        return res.status(400).json({
          error: 'userProfile and insightType are required'
        });
      }

      console.log(`🔄 [${requestId}] Calling businessCoachingService.generateBusinessInsights...`);
      const startTime = Date.now();
      
      const response = await this.businessCoachingService.generateBusinessInsights(request);

      const responseTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] Service response received in ${responseTime}ms`);
      console.log(`📦 [${requestId}] Response type: ${typeof response}`);
      console.log(`📝 [${requestId}] Response keys: ${response ? Object.keys(response) : 'No response'}`);
      
      res.json(response);
      
      console.log(`✅ [${requestId}] Response sent successfully`);
    } catch (error) {
      console.error(`❌ [${requestId}] BusinessController.generateInsights error:`, error);
      console.error(`❌ [${requestId}] Error type: ${typeof error}`);
      console.error(`❌ [${requestId}] Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`❌ [${requestId}] Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
      
      console.log(`📤 [${requestId}] Error response sent`);
    }
  };

  businessChat = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.businessChat: New request received`);
    console.log(`📝 [${requestId}] Request body: ${req.body ? 'Present' : 'Missing'}`);
    console.log(`📝 [${requestId}] Request body keys: ${req.body ? Object.keys(req.body) : 'No body'}`);
    console.log(`📝 [${requestId}] Request headers: ${req.headers ? 'Present' : 'Missing'}`);
    console.log(`📝 [${requestId}] Content-Type: ${req.headers?.['content-type'] || 'Not specified'}`);
    console.log(`📝 [${requestId}] User-Agent: ${req.headers?.['user-agent'] || 'Not specified'}`);
    
    try {
      const { message, userProfile, chatHistory } = req.body;
      
      console.log(`📨 [${requestId}] Message received: "${message}"`);
      console.log(`👤 [${requestId}] User profile present: ${!!userProfile}`);
      console.log(`📚 [${requestId}] Chat history present: ${!!chatHistory}, length: ${chatHistory?.length || 0}`);
      
      if (userProfile) {
        console.log(`👤 [${requestId}] User profile details:`);
        console.log(`   - Industry: ${userProfile.business?.industry || 'Not specified'}`);
        console.log(`   - Primary motivation: ${userProfile.personal?.primary_motivation || 'Not specified'}`);
        console.log(`   - Success definition: ${userProfile.personal?.success_definition?.substring(0, 100) || 'Not specified'}...`);
        console.log(`   - User profile structure:`, {
          hasPersonal: !!userProfile.personal,
          hasBusiness: !!userProfile.business,
          personalKeys: userProfile.personal ? Object.keys(userProfile.personal) : [],
          businessKeys: userProfile.business ? Object.keys(userProfile.business) : []
        });
      }
      
      if (!message || !userProfile) {
        console.error(`❌ [${requestId}] Missing required fields - message: ${!!message}, userProfile: ${!!userProfile}`);
        return res.status(400).json({
          error: 'message and userProfile are required'
        });
      }

      console.log(`🔄 [${requestId}] Calling businessCoachingService.getChatResponse...`);
      const startTime = Date.now();
      
      const response = await this.businessCoachingService.getChatResponse(
        message,
        userProfile as UserProfile,
        chatHistory || []
      );

      const responseTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] Service response received in ${responseTime}ms`);
      console.log(`📦 [${requestId}] Response type: ${typeof response}`);
      console.log(`📝 [${requestId}] Response length: ${response?.length || 0}`);
      console.log(`📝 [${requestId}] Response preview: ${response?.substring(0, 200) || 'Empty response'}...`);

      const finalResponse = {
        output: response,
        timestamp: new Date().toISOString()
      };

      console.log(`📤 [${requestId}] Sending response to client`);
      console.log(`📦 [${requestId}] Final response keys: ${Object.keys(finalResponse)}`);
      
      res.json(finalResponse);
      
      console.log(`✅ [${requestId}] Response sent successfully`);
    } catch (error) {
      console.error(`❌ [${requestId}] BusinessController error:`, error);
      console.error(`❌ [${requestId}] Error type: ${typeof error}`);
      console.error(`❌ [${requestId}] Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`❌ [${requestId}] Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
      
      console.log(`📤 [${requestId}] Error response sent`);
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
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.saveUserProfile: New request received`);
    
    try {
      const { userId, profileData } = req.body;
      
      if (!userId || !profileData) {
        console.error(`❌ [${requestId}] Missing required fields - userId: ${!!userId}, profileData: ${!!profileData}`);
        return res.status(400).json({
          error: 'userId and profileData are required'
        });
      }

      // Add clerkId to profileData for the service
      const profileDataWithClerkId = {
        ...profileData,
        clerkId: userId
      };

      console.log(`🔄 [${requestId}] Saving user profile to blockchain for user: ${userId}`);
      const txId = await this.businessCoachingService.saveUserProfileToBlockchain(profileDataWithClerkId);
      
      if (txId) {
        console.log(`✅ [${requestId}] User profile saved to blockchain. TX ID: ${txId}`);
        res.json({
          success: true,
          message: 'User profile saved to blockchain',
          transactionId: txId,
          hashscanUrl: `https://hashscan.io/testnet/tx/${txId}`
        });
      } else {
        console.log(`⚠️  [${requestId}] User profile saved locally only (blockchain unavailable)`);
        res.json({
          success: true,
          message: 'User profile saved locally',
          blockchainAvailable: false
        });
      }
      
    } catch (error) {
      console.error(`❌ [${requestId}] Error saving user profile:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  saveBusinessData = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.saveBusinessData: New request received`);
    
    try {
      const { userId, businessData } = req.body;
      
      if (!userId || !businessData) {
        console.error(`❌ [${requestId}] Missing required fields - userId: ${!!userId}, businessData: ${!!businessData}`);
        return res.status(400).json({
          error: 'userId and businessData are required'
        });
      }

      // Add clerkId to businessData for the service
      const businessDataWithClerkId = {
        ...businessData,
        clerkId: userId
      };

      console.log(`🔄 [${requestId}] Saving business data to blockchain for user: ${userId}`);
      const txId = await this.businessCoachingService.saveBusinessDataToBlockchain(businessDataWithClerkId, userId);
      
      if (txId) {
        console.log(`✅ [${requestId}] Business data saved to blockchain. TX ID: ${txId}`);
        res.json({
          success: true,
          message: 'Business data saved to blockchain',
          transactionId: txId,
          hashscanUrl: `https://hashscan.io/testnet/tx/${txId}`
        });
      } else {
        console.log(`⚠️  [${requestId}] Business data saved locally only (blockchain unavailable)`);
        res.json({
          success: true,
          message: 'Business data saved locally',
          blockchainAvailable: false
        });
      }
      
    } catch (error) {
      console.error(`❌ [${requestId}] Error saving business data:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  saveMissionCompletion = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.saveMissionCompletion: New request received`);
    
    try {
      const { userId, missionData } = req.body;
      
      if (!userId || !missionData) {
        console.error(`❌ [${requestId}] Missing required fields - userId: ${!!userId}, missionData: ${!!missionData}`);
        return res.status(400).json({
          error: 'userId and missionData are required'
        });
      }

      console.log(`🔄 [${requestId}] Saving mission completion to blockchain for user: ${userId}`);
      const txId = await this.businessCoachingService.saveMissionCompletionToBlockchain(missionData);
      
      if (txId) {
        console.log(`✅ [${requestId}] Mission completion saved to blockchain. TX ID: ${txId}`);
        res.json({
          success: true,
          message: 'Mission completion saved to blockchain',
          transactionId: txId,
          hashscanUrl: `https://hashscan.io/testnet/tx/${txId}`
        });
      } else {
        console.log(`⚠️  [${requestId}] Mission completion saved locally only (blockchain unavailable)`);
        res.json({
          success: true,
          message: 'Mission completion saved locally',
          blockchainAvailable: false
        });
      }
      
    } catch (error) {
      console.error(`❌ [${requestId}] Error saving mission completion:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getUserDataFromBlockchain = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.getUserDataFromBlockchain: New request received`);
    
    try {
      const { userId } = req.params;
      
      if (!userId) {
        console.error(`❌ [${requestId}] Missing userId parameter`);
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      // Decode URL encoding if present
      const decodedUserId = decodeURIComponent(userId);
      console.log(`🔄 [${requestId}] Reading user data from blockchain for user: ${decodedUserId}`);
      
      const userData = await this.businessCoachingService.getUserDataFromBlockchain(decodedUserId);
      
      if (userData) {
        console.log(`✅ [${requestId}] User data retrieved from blockchain successfully`);
        console.log(`🔍 [${requestId}] userData keys: ${Object.keys(userData)}`);
        console.log(`🔍 [${requestId}] userData.allMessages length: ${userData.allMessages?.length || 'undefined'}`);
        res.json({
          success: true,
          data: userData,
          userId: decodedUserId
        });
      } else {
        console.log(`ℹ️  [${requestId}] No data found for user ${decodedUserId} - this is normal for new users`);
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
      console.error(`❌ [${requestId}] Error reading user data from blockchain:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getTopicInfo = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.getTopicInfo: New request received`);
    
    try {
      const { userId } = req.params;
      
      if (!userId) {
        console.error(`❌ [${requestId}] Missing userId parameter`);
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      console.log(`🔄 [${requestId}] Getting topic info for user: ${userId}`);
      const topicInfo = await this.businessCoachingService.getTopicInfo(userId);
      
      if (topicInfo) {
        console.log(`✅ [${requestId}] Topic info retrieved successfully`);
        res.json({
          success: true,
          data: topicInfo
        });
      } else {
        console.log(`❌ [${requestId}] No topic found for user ${userId}`);
        res.status(404).json({
          success: false,
          error: 'No topic found for this user'
        });
      }
      
    } catch (error) {
      console.error(`❌ [${requestId}] Error getting topic info:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
} 