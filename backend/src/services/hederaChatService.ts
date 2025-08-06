import {
    Client,
    TopicId,
    TopicMessageSubmitTransaction,
    TopicCreateTransaction,
    TopicMessageQuery
} from "@hashgraph/sdk";
import { config } from '../config/environment';
import { UserProfile } from '../types/business.types';

export class HederaChatService {
    private client: Client;
    private topicId: TopicId | null = null;
    private operatorAccount: string;
    private isInitialized = false;

    constructor() {
        this.client = Client.forTestnet();
        this.operatorAccount = config.hedera.accountId;
        this.client.setOperator(config.hedera.accountId, config.hedera.privateKey);
    }

    async initialize(): Promise<void> {
        try {
            // Create or connect to existing topic
            if (config.hedera.topicId) {
                this.topicId = TopicId.fromString(config.hedera.topicId);
                console.log('✅ Connected to existing topic:', this.topicId.toString());
            } else {
                this.topicId = await this.createNewTopic();
                console.log('✅ Created new topic:', this.topicId.toString());
            }
            
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize Hedera chat service:', error);
            throw error;
        }
    }

    private async createNewTopic(): Promise<TopicId> {
        try {
            const response = await new TopicCreateTransaction().execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const newTopicId = receipt.topicId;
            
            if (!newTopicId) {
                throw new Error('Failed to create topic');
            }
            
            console.log('✅ Created new HCS topic:', newTopicId.toString());
            return newTopicId;
        } catch (error) {
            console.error('❌ Failed to create topic:', error);
            throw error;
        }
    }

    async sendMessage(message: string, userProfile: UserProfile, userId: string): Promise<void> {
        if (!this.isInitialized || !this.topicId) {
            throw new Error('Chat service not initialized');
        }

        try {
            const chatMessage = {
                operatorAccount: this.operatorAccount,
                userId: userId,
                message: message,
                userProfile: {
                    business: userProfile.business,
                    personal: userProfile.personal
                },
                timestamp: new Date().toISOString(),
                type: 'user_message'
            };

            await new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(JSON.stringify(chatMessage))
                .execute(this.client);

            console.log('✅ Message sent to HCS:', message.substring(0, 50) + '...');
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            throw error;
        }
    }

    async sendSystemMessage(message: string, userId: string): Promise<void> {
        if (!this.isInitialized || !this.topicId) {
            throw new Error('Chat service not initialized');
        }

        try {
            const systemMessage = {
                operatorAccount: this.operatorAccount,
                userId: userId,
                message: message,
                timestamp: new Date().toISOString(),
                type: 'system_message'
            };

            await new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(JSON.stringify(systemMessage))
                .execute(this.client);

            console.log('✅ System message sent to HCS');
        } catch (error) {
            console.error('❌ Failed to send system message:', error);
            throw error;
        }
    }

    getTopicId(): string | null {
        return this.topicId?.toString() || null;
    }

    isReady(): boolean {
        return this.isInitialized && this.topicId !== null;
    }
} 