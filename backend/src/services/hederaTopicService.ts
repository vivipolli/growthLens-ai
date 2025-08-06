import {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { config } from '../config/environment';
import { DataProcessingService } from './dataProcessingService';
import * as fs from 'fs';
import * as path from 'path';

export interface UserTopicData {
  userId: string;
  topicId: string;
  createdAt: string;
  memo: string;
}

export interface TopicMessage {
  type: 'user_profile' | 'business_data' | 'ai_insight' | 'mission_completion' | 'daily_missions' | 'business_observations';
  timestamp: string;
  data: any;
  userId: string;
  chunkIndex?: number;
  totalChunks?: number;
}

export class HederaTopicService {
  private client!: Client;
  private isInitialized = false;
  private readonly storageFile = path.join(__dirname, '../../data/userTopics.json');
  private dataProcessor = new DataProcessingService();

  async initialize() {
    try {
      if (!config.hedera.accountId || !config.hedera.privateKey) {
        throw new Error('Hedera account ID and private key are required');
      }

      this.client = Client.forTestnet();
      const accountId = AccountId.fromString(config.hedera.accountId);
      
      let privateKey;
      try {
        privateKey = PrivateKey.fromString(config.hedera.privateKey);
      } catch (error) {
        try {
          privateKey = PrivateKey.fromStringED25519(config.hedera.privateKey);
        } catch (ed25519Error) {
          try {
            if (config.hedera.privateKey.length > 64) {
              const actualKey = config.hedera.privateKey.slice(-64);
              privateKey = PrivateKey.fromStringED25519(actualKey);
            } else {
              privateKey = PrivateKey.fromStringED25519(config.hedera.privateKey);
            }
          } catch (conversionError) {
            throw new Error(`Invalid private key format. Expected DER or ED25519 format, got ${config.hedera.privateKey.length} bytes`);
          }
        }
      }
      
      this.client.setOperator(accountId, privateKey);
      this.isInitialized = true;
      
    } catch (error) {
      console.error('HederaTopicService: Failed to initialize:', error);
      this.isInitialized = false;
    }
  }

  async createUserTopic(userId: string, userData: any): Promise<UserTopicData> {
    if (!this.isInitialized) {
      throw new Error('HederaTopicService not initialized');
    }

    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(`User journey data for ${userId}`)
        .setAutoRenewPeriod(2592000);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const topicId = receipt.topicId!.toString();
      
      const topicData: UserTopicData = {
        userId,
        topicId,
        createdAt: new Date().toISOString(),
        memo: `User journey data for ${userId}`
      };

      const userTopics = this.getUserTopics();
      userTopics[userId] = topicData;
      this.saveUserTopics(userTopics);

      await this.submitMessage(topicId, {
        type: 'user_profile',
        timestamp: new Date().toISOString(),
        data: userData,
        userId
      });

      return topicData;

    } catch (error) {
      console.error('HederaTopicService: Failed to create topic:', error);
      throw error;
    }
  }

  async submitMessage(topicId: string, message: TopicMessage): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('HederaTopicService not initialized');
    }

    try {
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(JSON.stringify(message));

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      return txResponse.transactionId.toString();

    } catch (error) {
      console.error('HederaTopicService: Failed to submit message:', error);
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
    allMessages: any[];
  } | null> {
    try {
      const topicData = await this.getUserTopic(userId);
      if (!topicData) {
        return null;
      }

      const messages = await this.getTopicMessagesFromMirrorNode(topicData.topicId);
      const reconstructedMessages = this.dataProcessor.reconstructFragmentedMessages(messages);
      
      const userData = {
        userProfile: null as any,
        businessData: null as any,
        aiInsights: [] as any[],
        missionCompletions: [] as any[],
        allMessages: [] as any[]
      };

      const combinedUserProfile = this.dataProcessor.combineUserDataFromMultipleMessages(reconstructedMessages, 'user_profile');
      const combinedBusinessData = this.dataProcessor.combineUserDataFromMultipleMessages(reconstructedMessages, 'business_data');
      
      const chunkedUserProfile = this.dataProcessor.reconstructChunkedData(reconstructedMessages, 'user_profile');
      const chunkedBusinessData = this.dataProcessor.reconstructChunkedData(reconstructedMessages, 'business_data');
      
      let finalUserProfile = chunkedUserProfile || combinedUserProfile;
      let finalBusinessData = chunkedBusinessData || combinedBusinessData;
        
        try {
          const allBusinessChunks = [];
          
          for (const msg of reconstructedMessages) {
            try {
              const content = msg.decoded || msg.message;
              const parsed = JSON.parse(content);
              
              if (parsed.type === 'business_data' && 
                  parsed.totalChunks === 4 && 
                  parsed.chunkIndex !== undefined &&
                  parsed.data) {
                allBusinessChunks.push(parsed);
              }
            } catch {}
          }
          
          if (allBusinessChunks.length >= 4) {
            const indices = new Set(allBusinessChunks.map(chunk => chunk.chunkIndex));
            const hasCompleteSet = [0, 1, 2, 3].every(i => indices.has(i));
            
            if (hasCompleteSet) {
              const latestChunks: Record<number, any> = {};
              allBusinessChunks.forEach(chunk => {
                const existing = latestChunks[chunk.chunkIndex];
                if (!existing || new Date(chunk.timestamp) > new Date(existing.timestamp)) {
                  latestChunks[chunk.chunkIndex] = chunk;
                }
              });
              
              const reconstructed: Record<string, any> = {};
              [0, 1, 2, 3].forEach(index => {
                const chunk = latestChunks[index];
                if (chunk && chunk.data) {
                  Object.assign(reconstructed, chunk.data);
                }
              });
              
              const fieldCount = Object.keys(reconstructed).length;
              
              if (fieldCount >= 10) {
                finalBusinessData = reconstructed;
              }
            }
          }
        } catch (error) {
          // Ignore reconstruction errors
        }
        
        const chunkedBusinessMessages = reconstructedMessages.filter(msg => {
          try {
            const content = msg.decoded || msg.message;
            const parsed = JSON.parse(content);
            return parsed.type === 'business_data' && parsed.chunkIndex !== undefined;
          } catch {
            return false;
          }
        });
        
        if (chunkedBusinessMessages.length > 0) {
          const chunksByTotalCount = new Map<number, any[]>();
          chunkedBusinessMessages.forEach(msg => {
            try {
              const content = msg.decoded || msg.message;
              const parsed = JSON.parse(content);
              const totalChunks = parsed.totalChunks;
              
              if (!chunksByTotalCount.has(totalChunks)) {
                chunksByTotalCount.set(totalChunks, []);
              }
              chunksByTotalCount.get(totalChunks)!.push(parsed);
            } catch (error) {
              // Ignore parsing errors
            }
          });
          
          let bestReconstructedData: any = null;
          let bestFieldCount = 0;
          
          for (const [totalChunks, allChunks] of chunksByTotalCount) {
            const chunkIndices = new Set(allChunks.map(chunk => chunk.chunkIndex));
            const expectedIndices = Array.from({length: totalChunks}, (_, i) => i);
            const hasCompleteSet = expectedIndices.every(index => chunkIndices.has(index));
            
            if (hasCompleteSet) {
              allChunks.sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));
              
              const recentChunks = new Map<number, any>();
              for (const chunk of allChunks) {
                const existing = recentChunks.get(chunk.chunkIndex);
                if (!existing || new Date(chunk.timestamp) > new Date(existing.timestamp)) {
                  recentChunks.set(chunk.chunkIndex, chunk);
                }
              }
              
              const reconstructedData: any = {};
              for (let i = 0; i < totalChunks; i++) {
                const chunk = recentChunks.get(i);
                if (chunk && chunk.data) {
                  Object.assign(reconstructedData, chunk.data);
                }
              }
              
              const fieldCount = Object.keys(reconstructedData).length;
              
              if (fieldCount > bestFieldCount) {
                bestFieldCount = fieldCount;
                bestReconstructedData = reconstructedData;
              }
            }
          }
          
          if (bestReconstructedData && bestFieldCount >= 10) {
            finalBusinessData = bestReconstructedData;
          } else if (bestReconstructedData && bestFieldCount > Object.keys(finalBusinessData || {}).length) {
            finalBusinessData = bestReconstructedData;
          }
        }
        
        if (!finalBusinessData || Object.keys(finalBusinessData).length < 10) {
          const allBusinessMessages = reconstructedMessages.filter(msg => {
            try {
              const content = msg.decoded || msg.message;
              const parsed = JSON.parse(content);
              return parsed.type === 'business_data';
            } catch {
              return false;
            }
          });
          
          if (allBusinessMessages.length > 0) {
            const messagesWithCompleteness = allBusinessMessages.map(msg => {
              try {
                const content = msg.decoded || msg.message;
                const parsed = JSON.parse(content);
                const data = parsed.data || {};
                const fieldCount = Object.keys(data).length;
                const hasComplexFields = data.competitor_profiles || data.pain_points || data.goals_aspirations;
                
                return {
                  data,
                  fieldCount,
                  hasComplexFields: !!hasComplexFields,
                  timestamp: new Date(parsed.timestamp).getTime()
                };
              } catch {
                return { data: {}, fieldCount: 0, hasComplexFields: false, timestamp: 0 };
              }
            });
            
            messagesWithCompleteness.sort((a, b) => {
              if (a.hasComplexFields && !b.hasComplexFields) return -1;
              if (!a.hasComplexFields && b.hasComplexFields) return 1;
              if (a.fieldCount !== b.fieldCount) return b.fieldCount - a.fieldCount;
              return b.timestamp - a.timestamp;
            });
            
            const bestData = messagesWithCompleteness[0];
            if (bestData.fieldCount > Object.keys(finalBusinessData || {}).length) {
              finalBusinessData = bestData.data;
            }
          }
        }
        
        if (!finalUserProfile || Object.keys(finalUserProfile).length < 5) {
          const allUserProfileMessages = reconstructedMessages.filter(msg => {
            try {
              const content = msg.decoded || msg.message;
              const parsed = JSON.parse(content);
              return parsed.type === 'user_profile';
            } catch {
              return false;
            }
          });
          
          if (allUserProfileMessages.length > 0) {
            const messagesWithCompleteness = allUserProfileMessages.map(msg => {
              try {
                const content = msg.decoded || msg.message;
                const parsed = JSON.parse(content);
                const data = parsed.data || {};
                const fieldCount = Object.keys(data).length;
                const hasComplexFields = data.personal || data.business || data.core_values || data.dream_lifestyle;
                
                return {
                  data,
                  fieldCount,
                  hasComplexFields: !!hasComplexFields,
                  timestamp: new Date(parsed.timestamp).getTime()
                };
              } catch {
                return { data: {}, fieldCount: 0, hasComplexFields: false, timestamp: 0 };
              }
            });
            
            messagesWithCompleteness.sort((a, b) => {
              if (a.hasComplexFields && !b.hasComplexFields) return -1;
              if (!a.hasComplexFields && b.hasComplexFields) return 1;
              if (a.fieldCount !== b.fieldCount) return b.fieldCount - a.fieldCount;
              return b.timestamp - a.timestamp;
            });
            
            const bestData = messagesWithCompleteness[0];
            if (bestData.fieldCount > Object.keys(finalUserProfile || {}).length) {
              finalUserProfile = bestData.data;
            }
          }
        }
        
        if (!finalUserProfile || Object.keys(finalUserProfile).length < 3) {
          const userProfileMessages = reconstructedMessages.filter(msg => {
            try {
              const content = msg.decoded || msg.message;
              const parsed = JSON.parse(content);
              return parsed.type === 'user_profile';
            } catch {
              return false;
            }
          });
          
          if (userProfileMessages.length > 0) {
            userProfileMessages.sort((a, b) => {
              try {
                const contentA = a.decoded || a.message;
                const contentB = b.decoded || b.message;
                const parsedA = JSON.parse(contentA);
                const parsedB = JSON.parse(contentB);
                return new Date(parsedB.timestamp).getTime() - new Date(parsedA.timestamp).getTime();
              } catch {
                return 0;
              }
            });
            
            const mostRecent = userProfileMessages[0];
            try {
              const content = mostRecent.decoded || mostRecent.message;
              const parsed = JSON.parse(content);
              if (parsed.data && Object.keys(parsed.data).length > 0) {
                finalUserProfile = parsed.data;
              }
            } catch (error) {
              // Ignore parsing errors
            }
          }
        }
        
        const allUserProfileMessages = reconstructedMessages.filter(msg => {
          try {
            const content = msg.decoded || msg.message;
            const parsed = JSON.parse(content);
            return parsed.type === 'user_profile';
          } catch {
            return false;
          }
        });
        
        if (allUserProfileMessages.length > 0) {
          const messagesWithCompleteness = allUserProfileMessages.map(msg => {
            try {
              const content = msg.decoded || msg.message;
              const parsed = JSON.parse(content);
              const data = parsed.data || {};
              const fieldCount = Object.keys(data).length;
              const hasName = data.name && data.name !== '@socialmediacreator';
              const hasLocation = data.location;
              const hasMotivation = data.primary_motivation;
              
              return {
                data,
                fieldCount,
                hasName,
                hasLocation,
                hasMotivation,
                timestamp: new Date(parsed.timestamp).getTime()
              };
            } catch {
              return { data: {}, fieldCount: 0, hasName: false, hasLocation: false, hasMotivation: false, timestamp: 0 };
            }
          });
          
          messagesWithCompleteness.sort((a, b) => {
            if (a.hasName && !b.hasName) return -1;
            if (!a.hasName && b.hasName) return 1;
            if (a.fieldCount !== b.fieldCount) return b.fieldCount - a.fieldCount;
            return b.timestamp - a.timestamp;
          });
          
          const bestData = messagesWithCompleteness[0];
          if (bestData.fieldCount > Object.keys(finalUserProfile || {}).length) {
            finalUserProfile = bestData.data;
          }
        }
        
        if (finalUserProfile) {
          if (finalUserProfile.personal && finalUserProfile.business) {
            userData.userProfile = finalUserProfile;
          } else {
            userData.userProfile = this.dataProcessor.convertLegacyUserProfileToComplete(finalUserProfile);
          }
        }
        
        if (finalBusinessData) {
          if (finalBusinessData.target_audience && finalBusinessData.competitors) {
            userData.businessData = finalBusinessData;
          } else {
            userData.businessData = this.dataProcessor.convertLegacyBusinessDataToComplete(finalBusinessData);
          }
        }

            for (const message of reconstructedMessages) {
        try {
          let messageContent = message.message;
          
          if (messageContent && typeof messageContent === 'string') {
            if (messageContent.match(/^[A-Za-z0-9+/=]+$/) && messageContent.length > 20) {
              try {
                const decoded = Buffer.from(messageContent, 'base64').toString('utf-8');
                
                if (decoded.startsWith('{') || decoded.startsWith('[')) {
                  messageContent = decoded;
                }
              } catch (decodeError) {
                // Continue with original message
              }
            }
          }
          
          let parsedMessage;
          try {
            parsedMessage = JSON.parse(messageContent);
          } catch (parseError) {
            parsedMessage = this.dataProcessor.reconstructTruncatedJSON(messageContent);
            
            if (!parsedMessage) {
              const typeMatch = messageContent.match(/"type"\s*:\s*"([^"]+)"/); 
              const insightsMatch = messageContent.match(/"insights"\s*:\s*\[/);
              const summaryMatch = messageContent.match(/"summary"\s*:\s*"([^"]+)"/); 
              const userIdMatch = messageContent.match(/"userId"\s*:\s*"([^"]+)"/);
              
              if (typeMatch && insightsMatch) {
                const insights = this.dataProcessor.extractInsightsFromFragmentedMessage(messageContent);
                
                parsedMessage = {
                  type: typeMatch[1],
                  data: {
                    insights: insights,
                    insightType: typeMatch[1],
                    summary: summaryMatch ? summaryMatch[1] : 'Generated insights',
                    timestamp: new Date().toISOString(),
                    userId: userIdMatch ? userIdMatch[1] : 'unknown'
                  }
                };
              } else {
                const userProfileMatch = messageContent.match(/"type"\s*:\s*"user_profile"/);
                const businessDataMatch = messageContent.match(/"type"\s*:\s*"business_data"/);
                
                if (userProfileMatch) {
                  const extractedData = this.dataProcessor.extractUserDataFromTruncatedMessage(messageContent, 'user_profile');
                  if (extractedData) {
                    userData.userProfile = extractedData;
                  }
                } else if (businessDataMatch) {
                  const extractedData = this.dataProcessor.extractUserDataFromTruncatedMessage(messageContent, 'business_data');
                  if (extractedData) {
                    userData.businessData = extractedData;
                  }
                }
                
                continue;
              }
            }
          }
          
          if (!parsedMessage || !parsedMessage.type) {
            continue;
          }
          
          switch (parsedMessage.type) {
            case 'user_profile':
              userData.userProfile = parsedMessage.data;
              break;
            case 'business_data':
              userData.businessData = parsedMessage.data;
              break;
            case 'ai_insight':
            case 'daily_missions':
            case 'business_observations':
              if (parsedMessage.data && parsedMessage.data.insights) {
                userData.aiInsights.push({
                  ...parsedMessage.data,
                  timestamp: parsedMessage.timestamp || parsedMessage.data.timestamp
                });
              } else if (parsedMessage.data) {
                userData.aiInsights.push({
                  ...parsedMessage.data,
                  timestamp: parsedMessage.timestamp || parsedMessage.data.timestamp
                });
              }
              break;
            case 'mission_completion':
              userData.missionCompletions.push({
                ...parsedMessage.data,
                timestamp: parsedMessage.timestamp || parsedMessage.data.timestamp
              });
              break;
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }

      userData.allMessages = this.dataProcessor.processAllMessagesForOutput(reconstructedMessages);
      return userData;

    } catch (error) {
      console.error('HederaTopicService: Failed to get user data from blockchain:', error);
      return null;
    }
  }

  async getTopicMessagesFromMirrorNode(topicId: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.messages || [];

    } catch (error) {
      console.error('HederaTopicService: Failed to fetch messages from Mirror Node:', error);
      return [];
    }
  }

  async getTopicInfoFromMirrorNode(topicId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('HederaTopicService: Failed to fetch topic info from Mirror Node:', error);
      return null;
    }
  }

  async getOrCreateUserTopic(userId: string, userData: any): Promise<UserTopicData> {
    const existingTopic = await this.getUserTopic(userId);
    
    if (existingTopic) {
      return existingTopic;
    }

    return await this.createUserTopic(userId, userData);
  }

  async saveUserProfile(userId: string, profileData: any): Promise<string> {
    try {
      console.log(`🔄 HederaTopicService.saveUserProfile called for userId: ${userId}`);
      console.log(`🔍 Service initialized: ${this.isInitialized}`);
      
      if (!this.isInitialized) {
        console.error('❌ HederaTopicService not initialized - cannot save to blockchain');
        throw new Error('HederaTopicService not initialized');
      }
      
      console.log(`📊 Profile data to save:`, JSON.stringify(profileData, null, 2));
      
      console.log(`🏗️ Getting or creating user topic...`);
      const topicData = await this.getOrCreateUserTopic(userId, profileData);
      console.log(`✅ Topic obtained: ${topicData.topicId}`);
      
      console.log(`🔧 Splitting data into chunks...`);
      const chunks = this.dataProcessor.splitDataIntoChunks(profileData, 'user_profile');
      console.log(`📦 Created ${chunks.length} chunks`);
      
      const txIds: string[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📤 Submitting chunk ${i + 1}/${chunks.length} to topic ${topicData.topicId}`);
        
        const message = {
          type: 'user_profile',
          timestamp: new Date().toISOString(),
          data: chunk,
          userId,
          chunkIndex: i,
          totalChunks: chunks.length
        };
        
        const txId = await this.submitMessage(topicData.topicId, message);
        console.log(`✅ Chunk ${i + 1} submitted with txId: ${txId}`);
        txIds.push(txId);
      }
      
      console.log(`🎉 All chunks submitted successfully. Main txId: ${txIds[0]}`);
      return txIds[0];
      
    } catch (error) {
      console.error(`❌ Error in saveUserProfile:`, error);
      throw error;
    }
  }

  async saveBusinessData(userId: string, businessData: any): Promise<string> {
    try {
      console.log(`🔄 HederaTopicService.saveBusinessData called for userId: ${userId}`);
      console.log(`🔍 Service initialized: ${this.isInitialized}`);
      
      if (!this.isInitialized) {
        console.error('❌ HederaTopicService not initialized - cannot save to blockchain');
        throw new Error('HederaTopicService not initialized');
      }
      
      console.log(`📊 Business data to save:`, JSON.stringify(businessData, null, 2));
      
      console.log(`🏗️ Getting or creating user topic...`);
      const topicData = await this.getOrCreateUserTopic(userId, businessData);
      console.log(`✅ Topic obtained: ${topicData.topicId}`);
      
      console.log(`🔧 Splitting business data into chunks...`);
      const chunks = this.dataProcessor.splitDataIntoChunks(businessData, 'business_data');
      console.log(`📦 Created ${chunks.length} chunks`);
      
      const txIds: string[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📤 Submitting chunk ${i + 1}/${chunks.length} to topic ${topicData.topicId}`);
        
        const message = {
          type: 'business_data',
          timestamp: new Date().toISOString(),
          data: chunk,
          userId,
          chunkIndex: i,
          totalChunks: chunks.length
        };
        
        const txId = await this.submitMessage(topicData.topicId, message);
        console.log(`✅ Chunk ${i + 1} submitted with txId: ${txId}`);
        txIds.push(txId);
      }
      
      console.log(`🎉 All business chunks submitted successfully. Main txId: ${txIds[0]}`);
      return txIds[0];
      
    } catch (error) {
      console.error(`❌ Error in saveBusinessData:`, error);
      throw error;
    }
  }

  async saveAIInsight(userId: string, insightData: any): Promise<string> {
    const topicData = await this.getOrCreateUserTopic(userId, insightData);
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

} 