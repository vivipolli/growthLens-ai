import {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery
} from "@hashgraph/sdk";
import { config } from '../config/environment';
import * as fs from 'fs';
import * as path from 'path';

export interface UserTopicData {
  userId: string;
  topicId: string;
  createdAt: string;
  memo: string;
}

export interface TopicMessage {
  type: 'user_profile' | 'business_data' | 'ai_insight' | 'mission_completion';
  timestamp: string;
  data: any;
  userId: string;
}

export class HederaTopicService {
  private client!: Client;
  private isInitialized = false;
  private readonly storageFile = path.join(__dirname, '../../data/userTopics.json');

  async initialize() {
    try {
      console.log('🔄 HederaTopicService: Initializing...');
      
      // Validate required environment variables
      if (!config.hedera.accountId || !config.hedera.privateKey) {
        throw new Error('Hedera account ID and private key are required');
      }

      // Create client
      this.client = Client.forTestnet();
      
      // Set operator
      const accountId = AccountId.fromString(config.hedera.accountId);
      
      // Handle different private key formats
      let privateKey;
      try {
        // Try DER format first (common for Hedera accounts)
        privateKey = PrivateKey.fromString(config.hedera.privateKey);
        console.log('✅ Using DER private key format');
      } catch (error) {
        console.log('⚠️  DER format failed, trying ED25519 format...');
        
        try {
          // Try ED25519 format
          privateKey = PrivateKey.fromStringED25519(config.hedera.privateKey);
          console.log('✅ Using ED25519 private key format');
        } catch (ed25519Error) {
          console.log('⚠️  ED25519 format failed, trying alternative formats...');
          
          // Try to convert from different formats
          try {
            // If it's a hex string that's too long, try to extract the actual key
            if (config.hedera.privateKey.length > 64) {
              // Extract the last 64 characters (32 bytes) as the actual key
              const actualKey = config.hedera.privateKey.slice(-64);
              console.log(`🔧 Extracting key from longer format: ${actualKey}`);
              privateKey = PrivateKey.fromStringED25519(actualKey);
            } else {
              // Try as raw hex
              privateKey = PrivateKey.fromStringED25519(config.hedera.privateKey);
            }
            console.log('✅ Successfully converted private key format');
          } catch (conversionError) {
            console.error('❌ Failed to convert private key format:', conversionError);
            throw new Error(`Invalid private key format. Expected DER or ED25519 format, got ${config.hedera.privateKey.length} bytes`);
          }
        }
      }
      
      this.client.setOperator(accountId, privateKey);
      
      this.isInitialized = true;
      console.log('✅ HederaTopicService: Initialized successfully');
      console.log(`🔑 Account ID: ${config.hedera.accountId}`);
      console.log(`🌐 Network: ${config.hedera.network}`);
      
    } catch (error) {
      console.error('❌ HederaTopicService: Failed to initialize:', error);
      console.log('⚠️  Blockchain features will be disabled, but service will continue running');
      this.isInitialized = false;
    }
  }

  async createUserTopic(userId: string, userData: any): Promise<UserTopicData> {
    if (!this.isInitialized) {
      throw new Error('HederaTopicService not initialized');
    }

    try {
      console.log(`🔄 HederaTopicService: Creating topic for user ${userId}...`);

      // Create topic transaction
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(`User journey data for ${userId}`)
        .setAutoRenewPeriod(2592000); // 30 days in seconds

      // Execute transaction
      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      // Get topic ID
      const topicId = receipt.topicId!.toString();
      
      console.log(`✅ HederaTopicService: Topic created successfully`);
      console.log(`📋 Topic ID: ${topicId}`);
      console.log(`🔗 HashScan URL: https://hashscan.io/testnet/topic/${topicId}`);

      // Save topic info to file storage
      const topicData: UserTopicData = {
        userId,
        topicId,
        createdAt: new Date().toISOString(),
        memo: `User journey data for ${userId}`
      };

      // Save to file
      const userTopics = this.getUserTopics();
      userTopics[userId] = topicData;
      this.saveUserTopics(userTopics);

      // Submit initial user data message
      await this.submitMessage(topicId, {
        type: 'user_profile',
        timestamp: new Date().toISOString(),
        data: userData,
        userId
      });

      return topicData;

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to create topic:', error);
      throw error;
    }
  }

  async submitMessage(topicId: string, message: TopicMessage): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('HederaTopicService not initialized');
    }

    try {
      console.log(`🔄 HederaTopicService: Submitting message to topic ${topicId}...`);
      console.log(`📝 Message type: ${message.type}`);

      // Create message transaction
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(JSON.stringify(message));

      // Execute transaction
      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`✅ HederaTopicService: Message submitted successfully`);
      console.log(`🔗 HashScan URL: https://hashscan.io/testnet/tx/${txResponse.transactionId.toString()}`);

      return txResponse.transactionId.toString();

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to submit message:', error);
      throw error;
    }
  }

  async getUserTopic(userId: string): Promise<UserTopicData | null> {
    const userTopics = this.getUserTopics();
    return userTopics[userId] || null;
  }

  async getUserDataFromBlockchain(userId: string): Promise<{
    userProfile: any;
    businessData: any;
    aiInsights: any[];
    missionCompletions: any[];
  } | null> {
    try {
      console.log(`🔄 HederaTopicService: Fetching user data from blockchain for ${userId}...`);
      
      // Get user's topic
      const topicData = await this.getUserTopic(userId);
      if (!topicData) {
        console.log(`❌ HederaTopicService: No topic found for user ${userId}`);
        return null;
      }

      // Fetch messages from Mirror Node API
      const messages = await this.getTopicMessagesFromMirrorNode(topicData.topicId);
      
      // Parse and organize messages by type
      const userData = {
        userProfile: null as any,
        businessData: null as any,
        aiInsights: [] as any[],
        missionCompletions: [] as any[]
      };

      for (const message of messages) {
        try {
          // Handle different message formats
          let messageContent = message.message;
          
          // Check if message is base64 encoded
          if (messageContent && typeof messageContent === 'string') {
            // Try to decode base64 if it looks like base64
            if (messageContent.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
              try {
                messageContent = Buffer.from(messageContent, 'base64').toString('utf-8');
                console.log('🔧 Decoded base64 message');
              } catch (decodeError) {
                console.log('⚠️ Failed to decode base64, using original message');
              }
            }
          }
          
          // Try to parse JSON, but be more lenient
          let parsedMessage;
          try {
            parsedMessage = JSON.parse(messageContent);
          } catch (parseError) {
            // If JSON parsing fails, try to extract JSON from the content
            const jsonMatch = messageContent.match(/\{.*\}/s);
            if (jsonMatch) {
              try {
                parsedMessage = JSON.parse(jsonMatch[0]);
                console.log('🔧 Extracted JSON from message content');
              } catch (extractError) {
                console.log('⚠️ Failed to extract JSON from message');
                continue; // Skip this message
              }
            } else {
              console.log('⚠️ No valid JSON found in message');
              continue; // Skip this message
            }
          }
          
          switch (parsedMessage.type) {
            case 'user_profile':
              userData.userProfile = parsedMessage.data;
              break;
            case 'business_data':
              userData.businessData = parsedMessage.data;
              break;
            case 'ai_insight':
              userData.aiInsights.push({
                ...parsedMessage.data,
                timestamp: parsedMessage.timestamp
              });
              break;
            case 'mission_completion':
              userData.missionCompletions.push({
                ...parsedMessage.data,
                timestamp: parsedMessage.timestamp
              });
              break;
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          console.error('❌ Message content preview:', message.message?.substring(0, 100));
        }
      }

      console.log(`✅ HederaTopicService: Retrieved ${messages.length} messages from blockchain`);
      return userData;

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to get user data from blockchain:', error);
      return null;
    }
  }

  async getTopicMessagesFromMirrorNode(topicId: string, limit: number = 100): Promise<any[]> {
    try {
      console.log(`🔄 HederaTopicService: Fetching messages from Mirror Node for topic ${topicId}...`);
      
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      const messages = data.messages || [];

      console.log(`✅ HederaTopicService: Retrieved ${messages.length} messages from Mirror Node`);
      return messages;

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to fetch messages from Mirror Node:', error);
      return [];
    }
  }

  async getTopicInfoFromMirrorNode(topicId: string): Promise<any> {
    try {
      console.log(`🔄 HederaTopicService: Fetching topic info from Mirror Node for ${topicId}...`);
      
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      console.log(`✅ HederaTopicService: Retrieved topic info from Mirror Node`);
      return data;

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to fetch topic info from Mirror Node:', error);
      return null;
    }
  }

  async getOrCreateUserTopic(userId: string, userData: any): Promise<UserTopicData> {
    // Try to get existing topic
    const existingTopic = await this.getUserTopic(userId);
    
    if (existingTopic) {
      console.log(`📋 HederaTopicService: Found existing topic for user ${userId}: ${existingTopic.topicId}`);
      return existingTopic;
    }

    // Create new topic
    console.log(`🆕 HederaTopicService: Creating new topic for user ${userId}`);
    return await this.createUserTopic(userId, userData);
  }

  async saveUserProfile(userId: string, profileData: any): Promise<string> {
    const topicData = await this.getOrCreateUserTopic(userId, profileData);
    
    return await this.submitMessage(topicData.topicId, {
      type: 'user_profile',
      timestamp: new Date().toISOString(),
      data: profileData,
      userId
    });
  }

  async saveBusinessData(userId: string, businessData: any): Promise<string> {
    const topicData = await this.getOrCreateUserTopic(userId, businessData);
    
    return await this.submitMessage(topicData.topicId, {
      type: 'business_data',
      timestamp: new Date().toISOString(),
      data: businessData,
      userId
    });
  }

  async saveAIInsight(userId: string, insightData: any): Promise<string> {
    const topicData = await this.getOrCreateUserTopic(userId, insightData);
    
    return await this.submitMessage(topicData.topicId, {
      type: 'ai_insight',
      timestamp: new Date().toISOString(),
      data: insightData,
      userId
    });
  }

  async saveMissionCompletion(userId: string, missionData: any): Promise<string> {
    const topicData = await this.getOrCreateUserTopic(userId, missionData);
    
    return await this.submitMessage(topicData.topicId, {
      type: 'mission_completion',
      timestamp: new Date().toISOString(),
      data: missionData,
      userId
    });
  }

  private getUserTopics(): Record<string, UserTopicData> {
    try {
      if (!fs.existsSync(this.storageFile)) {
        return {};
      }
      const data = fs.readFileSync(this.storageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading user topics:', error);
      return {};
    }
  }

  private saveUserTopics(userTopics: Record<string, UserTopicData>): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.storageFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storageFile, JSON.stringify(userTopics, null, 2));
    } catch (error) {
      console.error('❌ Error saving user topics:', error);
    }
  }

  async getTopicMessages(topicId: string, maxMessages: number = 10): Promise<TopicMessage[]> {
    if (!this.isInitialized) {
      throw new Error('HederaTopicService not initialized');
    }

    try {
      console.log(`🔄 HederaTopicService: Querying messages for topic ${topicId}...`);

      const query = new TopicMessageQuery()
        .setTopicId(topicId)
        .setMaxAttempts(3);

      const messages: TopicMessage[] = [];
      
      // Note: This is a simplified implementation
      // In production, you might want to use mirror node API for better performance
      console.log(`📝 HederaTopicService: Querying topic messages (max: ${maxMessages})`);
      
      // For now, return empty array - implement full query logic as needed
      return messages;

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to query messages:', error);
      throw error;
    }
  }
} 