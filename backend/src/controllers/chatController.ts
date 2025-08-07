import { Request, Response } from 'express';
import { HederaChatService } from '../services/hederaChatService';
import { BusinessCoachingService } from '../services/businessCoachingService';
import { UserProfile } from '../types/business.types';

export class ChatController {
    constructor(
        private hederaChatService: HederaChatService,
        private businessCoachingService: BusinessCoachingService
    ) {}

    sendMessage = async (req: Request, res: Response) => {
        try {
            const { message, userProfile, userId } = req.body;
            
            if (!message || !userProfile || !userId) {
                return res.status(400).json({
                    error: 'message, userProfile, and userId are required'
                });
            }

            // Send message to Hedera
            await this.hederaChatService.sendMessage(message, userProfile as UserProfile, userId);
            
            // 🔥 NOVO: Recuperar histórico de chat do Hedera
            const chatHistory = await this.getChatHistoryFromHedera(userId);
            
            // Generate AI response with historical context
            const aiResponse = await this.businessCoachingService.getChatResponse(
                message, 
                userProfile as UserProfile, 
                chatHistory  // ← Passar histórico do Hedera
            );
            
            // Send AI response to Hedera
            await this.hederaChatService.sendSystemMessage(aiResponse, userId);
            
            res.json({
                success: true,
                message: 'Message sent successfully',
                aiResponse: aiResponse,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('ChatController.sendMessage error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };

    // 🔥 NOVO: Função para recuperar histórico de chat do Hedera
    private async getChatHistoryFromHedera(userId: string): Promise<any[]> {
        try {
            // Usar o hederaTopicService para recuperar dados do blockchain
            const blockchainData = await this.businessCoachingService.getUserDataFromBlockchain(userId);
            return blockchainData?.allMessages || [];
        } catch (error) {
            console.error('Error getting chat history from Hedera:', error);
            return [];
        }
    }

    sendSystemMessage = async (req: Request, res: Response) => {
        try {
            const { message, userId } = req.body;
            
            if (!message || !userId) {
                return res.status(400).json({
                    error: 'message and userId are required'
                });
            }

            await this.hederaChatService.sendSystemMessage(message, userId);
            
            res.json({
                success: true,
                message: 'System message sent successfully',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('ChatController.sendSystemMessage error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };

    getChatStatus = async (req: Request, res: Response) => {
        try {
            const status = {
                isReady: this.hederaChatService.isReady(),
                topicId: this.hederaChatService.getTopicId(),
                timestamp: new Date().toISOString()
            };
            
            res.json(status);
            
        } catch (error) {
            console.error('ChatController.getChatStatus error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };

    getAIStatus = async (req: Request, res: Response) => {
        try {
            const aiStatus = this.businessCoachingService.getAIServiceStatus();
            const status = {
                ...aiStatus,
                timestamp: new Date().toISOString()
            };
            
            res.json(status);
            
        } catch (error) {
            console.error('ChatController.getAIStatus error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };

    reinitializeAI = async (req: Request, res: Response) => {
        try {
            const success = await this.businessCoachingService.reinitializeAIService();
            
            if (success) {
                res.json({
                    success: true,
                    message: 'AI service reinitialized successfully',
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to reinitialize AI service',
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('ChatController.reinitializeAI error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };
} 