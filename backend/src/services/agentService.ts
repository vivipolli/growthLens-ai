import {
  HederaConversationalAgent,
  ServerSigner,
} from 'hedera-agent-kit';
import { Transaction } from '@hashgraph/sdk';
import { config } from '../config/environment';
import { AgentRequest, UserTransactionRequest, AgentResponse, SignTransactionRequest, SignTransactionResponse } from '../types/agent.types';

export class AgentService {
  private basicAgent?: HederaConversationalAgent;
  private agentSigner?: ServerSigner;
  private isInitialized = false;

  async initialize() {
    try {
      this.agentSigner = new ServerSigner(
        config.hedera.accountId,
        config.hedera.privateKey,
        config.hedera.network as any
      );

      // Only initialize AI agent if API key is available
      if (!config.openai.apiKey) {
        console.log('💡 Set OPENAI_API_KEY or OPENROUTER_API_KEY to enable AI features');
        this.isInitialized = true;
        return;
      }

      // Configuração para OpenRouter ou OpenAI
      const agentConfig: any = {
        openAIApiKey: config.openai.apiKey,
        operationalMode: 'directExecution',
      };

      // Se estiver usando OpenRouter, configurar baseURL customizada
      if (config.openai.baseURL !== 'https://api.openai.com/v1') {
        agentConfig.openAIConfiguration = {
          baseURL: config.openai.baseURL,
          defaultQuery: { model: config.openai.model }
        };
        console.log(`🔗 AgentService usando OpenRouter com modelo: ${config.openai.model}`);
      }

      this.basicAgent = new HederaConversationalAgent(this.agentSigner, agentConfig);
      await this.basicAgent.initialize();
      
      this.isInitialized = true;
      console.log('✅ AI Agent initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI agent:', error);
      this.isInitialized = true;
    }
  }

  async processBasicMessage(request: AgentRequest): Promise<AgentResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('Agent service not initialized');
      }

      if (!this.basicAgent) {
        return {
          output: 'AI features are currently disabled. Please configure an OpenAI API key to enable AI assistance.',
          message: 'AI features disabled',
          notes: ['No API key configured'],
          error: undefined
        };
      }

      const response = await this.basicAgent.processMessage(
        request.message,
        request.chatHistory || []
      );

      return {
        output: response.output,
        message: response.message,
        notes: response.notes,
        error: response.error
      };
    } catch (error) {
      return {
        output: 'Error processing message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processUserTransactionMessage(request: UserTransactionRequest): Promise<AgentResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('Agent service not initialized');
      }

      if (!this.agentSigner) {
        throw new Error('Agent signer not initialized');
      }

      if (!config.openai.apiKey) {
        return {
          output: 'AI features are currently disabled. Please configure an OpenAI API key to enable AI assistance.',
          message: 'AI features disabled',
          notes: ['No API key configured'],
          error: undefined
        };
      }

      // Configuração para transações de usuário com OpenRouter
      const userAgentConfig: any = {
        operationalMode: 'provideBytes',
        userAccountId: request.userAccountId,
        scheduleUserTransactionsInBytesMode: true,
        openAIApiKey: config.openai.apiKey,
      };

      // Aplicar configuração OpenRouter se necessário
      if (config.openai.baseURL !== 'https://api.openai.com/v1') {
        userAgentConfig.openAIConfiguration = {
          baseURL: config.openai.baseURL,
          defaultQuery: { model: config.openai.model }
        };
      }

      const userAgent = new HederaConversationalAgent(this.agentSigner, userAgentConfig);

      await userAgent.initialize();

      const response = await userAgent.processMessage(
        request.message,
        request.chatHistory || []
      );

      return {
        output: response.output,
        message: response.message,
        transactionBytes: response.transactionBytes,
        scheduleId: response.scheduleId,
        notes: response.notes,
        error: response.error
      };
    } catch (error) {
      return {
        output: 'Error processing transaction message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async signAndExecuteTransaction(request: SignTransactionRequest): Promise<SignTransactionResponse> {
    try {
      const userSigner = new ServerSigner(
        request.userAccountId,
        request.userPrivateKey,
        config.hedera.network as any
      );

      const txBytes = Buffer.from(request.transactionBytes, 'base64');
      const transaction = Transaction.fromBytes(txBytes);

      const frozenTx = transaction.isFrozen()
        ? transaction
        : await transaction.freezeWith(userSigner.getClient());

      const signedTx = await frozenTx.sign(userSigner.getOperatorPrivateKey());
      const txResponse = await signedTx.execute(userSigner.getClient());
      const receipt = await txResponse.getReceipt(userSigner.getClient());

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
        receipt: receipt
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isAIAvailable(): boolean {
    return this.isInitialized && !!this.basicAgent;
  }
} 