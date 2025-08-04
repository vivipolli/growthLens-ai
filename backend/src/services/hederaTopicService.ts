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
  type: 'user_profile' | 'business_data' | 'ai_insight' | 'mission_completion' | 'daily_missions' | 'weekly_goals' | 'business_observations';
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
      console.log(`📊 HederaTopicService: Fetched ${messages.length} raw messages from Mirror Node`);
      
      // Reconstruct fragmented messages
      const reconstructedMessages = this.reconstructFragmentedMessages(messages);
      console.log(`📊 HederaTopicService: After reconstruction, have ${reconstructedMessages.length} messages`);
      
      // Parse and organize messages by type
      const userData = {
        userProfile: null as any,
        businessData: null as any,
        aiInsights: [] as any[],
        missionCompletions: [] as any[]
      };

      for (const message of reconstructedMessages) {
        try {
          console.log(`🔍 HederaTopicService: Processing message ${message.consensus_timestamp || 'no-timestamp'}`);
          console.log(`🔍 HederaTopicService: Message preview: ${message.message?.substring(0, 100)}...`);
          console.log(`🔍 HederaTopicService: Message type: ${message.chunk_info ? 'fragmented' : 'single'}`);
          console.log(`🔍 HederaTopicService: Message length: ${message.message?.length || 0} characters`);
          
          // Handle different message formats
          let messageContent = message.message;
          
          // Check if message is base64 encoded
          if (messageContent && typeof messageContent === 'string') {
            // Try to decode base64 if it looks like base64
            // More lenient base64 detection
            if (messageContent.match(/^[A-Za-z0-9+/=]+$/) && messageContent.length > 20) {
              try {
                const decoded = Buffer.from(messageContent, 'base64').toString('utf-8');
                console.log(`🔧 Base64 decode attempt: ${messageContent.substring(0, 50)}... -> ${decoded.substring(0, 50)}...`);
                
                if (decoded.startsWith('{') || decoded.startsWith('[')) {
                  messageContent = decoded;
                  console.log('🔧 Decoded base64 message successfully');
                } else {
                  console.log('🔧 Base64 decode failed - not valid JSON structure');
                }
              } catch (decodeError) {
                console.log('⚠️ Failed to decode base64, using original message');
              }
            } else {
              console.log('🔧 Message does not match base64 pattern');
            }
          }
          
          // Try to parse JSON, but be more lenient
          let parsedMessage;
          try {
            parsedMessage = JSON.parse(messageContent);
            console.log('✅ Successfully parsed JSON message');
            console.log(`🔍 Message type: ${parsedMessage.type}`);
            console.log(`🔍 Has data: ${!!parsedMessage.data}`);
            console.log(`🔍 Data keys: ${parsedMessage.data ? Object.keys(parsedMessage.data) : 'none'}`);
          } catch (parseError) {
            console.log(`⚠️ JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
            console.log(`🔍 Message length: ${messageContent.length} characters`);
            console.log(`🔍 Message preview: ${messageContent.substring(0, 200)}...`);
            console.log('⚠️ JSON parsing failed, trying to extract JSON from content');
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
              // Try to find partial JSON structures
              const typeMatch = messageContent.match(/"type"\s*:\s*"([^"]+)"/);
              const insightsMatch = messageContent.match(/"insights"\s*:\s*\[/);
              const summaryMatch = messageContent.match(/"summary"\s*:\s*"([^"]+)"/);
              const userIdMatch = messageContent.match(/"userId"\s*:\s*"([^"]+)"/);
              
              if (typeMatch && insightsMatch) {
                console.log('🔧 Found partial AI insight message');
                
                // Extract insights from the fragmented message
                const insights = this.extractInsightsFromFragmentedMessage(messageContent);
                
                parsedMessage = {
                  type: typeMatch[1],
                  data: {
                    insights: insights,
                    summary: summaryMatch ? summaryMatch[1] : 'Generated insights',
                    timestamp: new Date().toISOString(),
                    userId: userIdMatch ? userIdMatch[1] : 'unknown'
                  }
                };
              } else {
                console.log('⚠️ No valid JSON structure found in message');
                continue; // Skip this message
              }
            }
          }
          
          // Validate parsed message has required structure
          if (!parsedMessage || !parsedMessage.type) {
            console.log('⚠️ Parsed message missing type field');
            continue;
          }
          
          switch (parsedMessage.type) {
            case 'user_profile':
              userData.userProfile = parsedMessage.data;
              console.log('✅ Found user profile data');
              break;
            case 'business_data':
              userData.businessData = parsedMessage.data;
              console.log('✅ Found business data');
              break;
            case 'ai_insight':
            case 'daily_missions':
            case 'weekly_goals':
            case 'business_observations':
              console.log(`🔍 Processing ${parsedMessage.type} message`);
              console.log(`🔍 Data structure:`, {
                hasData: !!parsedMessage.data,
                hasInsights: !!(parsedMessage.data && parsedMessage.data.insights),
                insightsCount: parsedMessage.data?.insights?.length || 0,
                dataKeys: parsedMessage.data ? Object.keys(parsedMessage.data) : []
              });
              
              if (parsedMessage.data && parsedMessage.data.insights) {
                // Handle insights array
                userData.aiInsights.push({
                  ...parsedMessage.data,
                  timestamp: parsedMessage.timestamp || parsedMessage.data.timestamp
                });
                console.log(`✅ Found ${parsedMessage.data.insights.length} insights in ${parsedMessage.type}`);
              } else if (parsedMessage.data) {
                // Handle single insight
                userData.aiInsights.push({
                  ...parsedMessage.data,
                  timestamp: parsedMessage.timestamp || parsedMessage.data.timestamp
                });
                console.log(`✅ Found single insight in ${parsedMessage.type}`);
              } else {
                console.log(`⚠️ No valid data found in ${parsedMessage.type} message`);
              }
              break;
            case 'mission_completion':
              userData.missionCompletions.push({
                ...parsedMessage.data,
                timestamp: parsedMessage.timestamp || parsedMessage.data.timestamp
              });
              console.log('✅ Found mission completion data');
              break;
            default:
              console.log(`⚠️ Unknown message type: ${parsedMessage.type}`);
              break;
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          console.error('❌ Message content preview:', message.message?.substring(0, 100));
        }
      }

      console.log(`✅ HederaTopicService: Retrieved ${reconstructedMessages.length} reconstructed messages from blockchain`);
      
      // Debug: Log what was found
      console.log(`📊 HederaTopicService: Data summary for ${userId}:`);
      console.log(`   - User Profile: ${userData.userProfile ? 'Found' : 'Not found'}`);
      console.log(`   - Business Data: ${userData.businessData ? 'Found' : 'Not found'}`);
      console.log(`   - AI Insights: ${userData.aiInsights.length} items`);
      console.log(`   - Mission Completions: ${userData.missionCompletions.length} items`);
      
      // Check if we have any data at all
      const hasAnyData = userData.userProfile || userData.businessData || userData.aiInsights.length > 0 || userData.missionCompletions.length > 0;
      
      if (!hasAnyData) {
        console.log(`⚠️  HederaTopicService: No valid data found in ${reconstructedMessages.length} messages for ${userId}`);
        console.log(`🔍 HederaTopicService: This might indicate parsing issues or empty messages`);
        console.log(`🔍 HederaTopicService: Returning empty userData structure instead of null`);
      }
      
      console.log(`✅ HederaTopicService: Returning userData for ${userId} with ${userData.aiInsights.length} insights`);
      return userData;

    } catch (error) {
      console.error('❌ HederaTopicService: Failed to get user data from blockchain:', error);
      return null;
    }
  }

  // 🔄 NOVO MÉTODO: Reconstruir mensagens fragmentadas
  private reconstructFragmentedMessages(messages: any[]): any[] {
    const messageGroups = new Map<string, any[]>();
    
    console.log(`🔧 HederaTopicService: Processing ${messages.length} messages for reconstruction`);
    
    // Group messages by their initial transaction ID
    for (const message of messages) {
      if (message.chunk_info && message.chunk_info.initial_transaction_id) {
        const txId = message.chunk_info.initial_transaction_id.account_id + '@' + message.chunk_info.initial_transaction_id.transaction_valid_start;
        
        if (!messageGroups.has(txId)) {
          messageGroups.set(txId, []);
        }
        messageGroups.get(txId)!.push(message);
        console.log(`🔧 Grouped message ${message.sequence_number} into group ${txId} (chunk ${message.chunk_info.number}/${message.chunk_info.total})`);
      } else {
        // Single message without chunk info
        const singleMessage = {
          ...message,
          reconstructed: false
        };
        const singleId = `single-${message.sequence_number}`;
        messageGroups.set(singleId, [singleMessage]);
        console.log(`🔧 Grouped single message ${message.sequence_number} into group ${singleId}`);
      }
    }
    
    const reconstructedMessages: any[] = [];
    
    console.log(`🔧 HederaTopicService: Found ${messageGroups.size} message groups`);
    
    // Reconstruct each group
    for (const [txId, group] of messageGroups) {
      console.log(`🔧 Processing group ${txId} with ${group.length} messages`);
      
      if (group.length > 1) {
        // Sort by chunk number
        group.sort((a, b) => a.chunk_info.number - b.chunk_info.number);
        console.log(`🔧 Chunk numbers: ${group.map(g => g.chunk_info.number).join(', ')}`);
        
        // Combine all chunks
        let fullMessage = '';
        for (const chunk of group) {
          console.log(`🔧 Adding chunk ${chunk.chunk_info.number} (${chunk.message.length} chars)`);
          fullMessage += chunk.message;
        }
        
        console.log(`🔧 Reconstructed message length: ${fullMessage.length} characters`);
        console.log(`🔧 Message preview: ${fullMessage.substring(0, 200)}...`);
        
        // Create reconstructed message
        const reconstructedMessage = {
          ...group[0],
          message: fullMessage,
          reconstructed: true
        };
        
        reconstructedMessages.push(reconstructedMessage);
        console.log(`🔧 Reconstructed message from ${group.length} chunks for transaction ${txId}`);
      } else {
        // Single message, no reconstruction needed
        console.log(`🔧 Single message length: ${group[0].message.length} characters`);
        reconstructedMessages.push(group[0]);
        console.log(`🔧 Single message (no reconstruction needed) for ${txId}`);
      }
    }
    
    console.log(`🔧 HederaTopicService: Reconstructed ${reconstructedMessages.length} messages`);
    return reconstructedMessages;
  }

  // 🔄 NOVO MÉTODO: Extrair insights de mensagens fragmentadas
  private extractInsightsFromFragmentedMessage(messageContent: string): any[] {
    const insights: any[] = [];
    
    // Look for insight objects in the fragmented message
    const insightMatches = messageContent.match(/\{[^}]*"id"\s*:\s*"[^"]+"[^}]*\}/g);
    
    if (insightMatches) {
      for (const match of insightMatches) {
        try {
          // Try to parse each potential insight
          const insight = JSON.parse(match);
          if (insight.id && insight.title) {
            insights.push(insight);
          }
        } catch (error) {
          // Skip invalid insights
          continue;
        }
      }
    }
    
    console.log(`🔧 Extracted ${insights.length} insights from fragmented message`);
    return insights;
  }

  async getTopicMessagesFromMirrorNode(topicId: string, limit: number = 50): Promise<any[]> {
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
    
    // Determinar o tipo correto baseado no insightType
    const messageType = insightData.insightType || 'ai_insight';
    
    return await this.submitMessage(topicData.topicId, {
      type: messageType,
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