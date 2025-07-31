import { Request, Response } from 'express';
import { BusinessCoachingService } from '../services/businessCoachingService';
import { BusinessInsightRequest, UserProfile } from '../types/business.types';

export class BusinessController {
  constructor(private businessCoachingService: BusinessCoachingService) {}

  generateInsights = async (req: Request, res: Response) => {
    try {
      const request: BusinessInsightRequest = req.body;
      
      if (!request.userProfile || !request.insightType) {
        return res.status(400).json({
          error: 'userProfile and insightType are required'
        });
      }

      const response = await this.businessCoachingService.generateBusinessInsights(request);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  businessChat = async (req: Request, res: Response) => {
    const requestId = Date.now().toString();
    console.log(`🚀 [${requestId}] BusinessController.businessChat: New request received`);
    console.log(`📝 [${requestId}] Request body keys: ${Object.keys(req.body)}`);
    console.log(`📝 [${requestId}] Request headers: Content-Type: ${req.headers['content-type']}, User-Agent: ${req.headers['user-agent']}`);
    
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
} 