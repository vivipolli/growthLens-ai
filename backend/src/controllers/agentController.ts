import { Request, Response } from 'express';
import { AgentService } from '../services/agentService';
import { AgentRequest, UserTransactionRequest, SignTransactionRequest } from '../types/agent.types';

export class AgentController {
  constructor(private agentService: AgentService) {}

  chat = async (req: Request, res: Response) => {
    try {
      const request: AgentRequest = req.body;
      
      if (!request.message) {
        return res.status(400).json({
          error: 'Message is required'
        });
      }

      const response = await this.agentService.processBasicMessage(request);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  createTransaction = async (req: Request, res: Response) => {
    try {
      const request: UserTransactionRequest = req.body;
      
      if (!request.message || !request.userAccountId) {
        return res.status(400).json({
          error: 'Message and userAccountId are required'
        });
      }

      const response = await this.agentService.processUserTransactionMessage(request);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  signTransaction = async (req: Request, res: Response) => {
    try {
      const request: SignTransactionRequest = req.body;
      
      if (!request.transactionBytes || !request.userAccountId || !request.userPrivateKey) {
        return res.status(400).json({
          error: 'transactionBytes, userAccountId, and userPrivateKey are required'
        });
      }

      const response = await this.agentService.signAndExecuteTransaction(request);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  healthCheck = async (req: Request, res: Response) => {
    try {
      // Check if agent service is initialized
      const agentStatus = await this.agentService.getStatus();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          agent: agentStatus.initialized ? 'ok' : 'initializing',
          hedera: agentStatus.hederaConnected ? 'connected' : 'disconnected',
          ai: agentStatus.aiEnabled ? 'enabled' : 'disabled'
        },
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
} 