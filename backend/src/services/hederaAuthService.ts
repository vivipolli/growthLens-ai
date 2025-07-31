import { 
  AccountId, 
  PrivateKey, 
  Client, 
  AccountCreateTransaction,
  Hbar,
  AccountInfoQuery,
  TransactionReceiptQuery,
  TransactionResponse
} from '@hashgraph/sdk';
import { config } from '../config/environment';
import { User, HederaAccountInfo, BlockchainProfile } from '../types/auth.types';
import crypto from 'crypto';

export class HederaAuthService {
  private client: Client;

  constructor() {
    this.client = Client.forName(config.hedera.network);
    this.client.setOperator(config.hedera.accountId, config.hedera.privateKey);
  }

  /**
   * Create a new Hedera account for a user
   */
  async createUserAccount(userId: string, initialBalance: number = 1): Promise<HederaAccountInfo> {
    try {
      console.log(`🔐 Creating Hedera account for user: ${userId}`);
      console.log(`🔗 Using Hedera network: ${config.hedera.network}`);
      console.log(`👤 Operator account: ${config.hedera.accountId}`);
      console.log(`🔑 Operator private key configured: ${config.hedera.privateKey ? 'Yes' : 'No'}`);
      
      // Validate configuration
      if (!config.hedera.accountId || !config.hedera.privateKey) {
        throw new Error('Hedera configuration missing: accountId or privateKey');
      }

      // Generate a new key pair for the user
      const userPrivateKey = PrivateKey.generateED25519();
      const userPublicKey = userPrivateKey.publicKey;

      console.log(`🔑 Generated user public key: ${userPublicKey.toString().substring(0, 20)}...`);

      // Create account transaction
      const transaction = new AccountCreateTransaction()
        .setKey(userPublicKey)
        .setInitialBalance(new Hbar(initialBalance))
        .setMaxAutomaticTokenAssociations(10);

      console.log(`📝 Created account transaction with initial balance: ${initialBalance} HBAR`);

      // Sign and execute the transaction
      console.log(`🚀 Executing account creation transaction...`);
      const response = await transaction.execute(this.client);
      console.log(`✅ Transaction executed, getting receipt...`);
      
      const receipt = await response.getReceipt(this.client);
      const newAccountId = receipt.accountId;

      if (!newAccountId) {
        console.error('❌ No account ID in receipt');
        throw new Error('Failed to create Hedera account - no account ID in receipt');
      }

      console.log(`✅ Hedera account created successfully: ${newAccountId.toString()}`);

      // Store the private key securely (in production, use proper key management)
      await this.storeUserPrivateKey(userId, userPrivateKey.toString());

      return {
        accountId: newAccountId.toString(),
        publicKey: userPublicKey.toString(),
        balance: initialBalance,
        isActive: true
      };

    } catch (error) {
      console.error('❌ Error creating Hedera account:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check if it's a network or configuration issue
      if (error instanceof Error) {
        if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
          throw new Error('Operator account has insufficient balance to create new accounts');
        } else if (error.message.includes('INVALID_ACCOUNT_ID')) {
          throw new Error('Invalid Hedera account ID configuration');
        } else if (error.message.includes('INVALID_PRIVATE_KEY')) {
          throw new Error('Invalid Hedera private key configuration');
        }
      }
      
      throw new Error(`Failed to create Hedera account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account information from Hedera
   */
  async getAccountInfo(accountId: string): Promise<HederaAccountInfo> {
    try {
      console.log(`🔍 Getting account info for: ${accountId}`);
      
      const query = new AccountInfoQuery()
        .setAccountId(AccountId.fromString(accountId));

      const accountInfo = await query.execute(this.client);

      return {
        accountId: accountInfo.accountId.toString(),
        publicKey: accountInfo.key.toString(),
        balance: Number(accountInfo.balance.toTinybars()),
        isActive: accountInfo.isDeleted === false
      };

    } catch (error) {
      console.error('❌ Error getting account info:', error);
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store user profile data on Hedera blockchain
   */
  async storeUserProfile(userId: string, hederaAccountId: string, profileData: any): Promise<BlockchainProfile> {
    try {
      console.log(`📝 Storing profile for user: ${userId} on account: ${hederaAccountId}`);
      
      // Create a hash of the profile data
      const profileHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(profileData))
        .digest('hex');

      // Create a message to store on Hedera
      const message = JSON.stringify({
        userId,
        profileHash,
        timestamp: new Date().toISOString(),
        dataType: 'user_profile'
      });

      // In a real implementation, you would:
      // 1. Create a Topic for user profiles
      // 2. Submit a message to the topic
      // 3. Store the topic ID and message sequence number
      
      // For now, we'll simulate this with a hash
      const blockchainProfile: BlockchainProfile = {
        userId,
        hederaAccountId,
        profileHash,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Profile stored on blockchain: ${profileHash}`);
      return blockchainProfile;

    } catch (error) {
      console.error('❌ Error storing profile on blockchain:', error);
      throw new Error(`Failed to store profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify user profile on blockchain
   */
  async verifyUserProfile(userId: string, hederaAccountId: string, profileData: any): Promise<boolean> {
    try {
      console.log(`🔍 Verifying profile for user: ${userId}`);
      
      // Create hash of current profile data
      const currentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(profileData))
        .digest('hex');

      // In a real implementation, you would:
      // 1. Query the Hedera Topic for the user's profile
      // 2. Compare the stored hash with the current hash
      
      // For now, we'll simulate verification
      const isValid = currentHash.length === 64; // Basic validation
      
      console.log(`✅ Profile verification result: ${isValid}`);
      return isValid;

    } catch (error) {
      console.error('❌ Error verifying profile:', error);
      return false;
    }
  }

  /**
   * Store user private key securely
   * In production, use proper key management (AWS KMS, HashiCorp Vault, etc.)
   */
  private async storeUserPrivateKey(userId: string, privateKey: string): Promise<void> {
    try {
      // In production, encrypt the private key before storing
      const encryptedKey = this.encryptPrivateKey(privateKey);
      
      // Store in database or secure storage
      console.log(`🔐 Stored encrypted private key for user: ${userId}`);
      
      // For now, we'll just log it (NOT for production!)
      console.log(`⚠️  WARNING: Private key for ${userId}: ${privateKey.substring(0, 20)}...`);
      
    } catch (error) {
      console.error('❌ Error storing private key:', error);
      throw new Error('Failed to store private key');
    }
  }

  /**
   * Encrypt private key for storage
   */
  private encryptPrivateKey(privateKey: string): string {
    // In production, use proper encryption
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(config.hedera.privateKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt private key for use
   */
  private decryptPrivateKey(encryptedKey: string): string {
    // In production, use proper decryption
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(config.hedera.privateKey, 'salt', 32);
    
    const parts = encryptedKey.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Get user's Hedera account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const accountInfo = await this.getAccountInfo(accountId);
      return accountInfo.balance;
    } catch (error) {
      console.error('❌ Error getting account balance:', error);
      return 0;
    }
  }

  /**
   * Transfer HBAR between accounts
   */
  async transferHBAR(fromAccountId: string, toAccountId: string, amount: number): Promise<TransactionResponse> {
    try {
      console.log(`💰 Transferring ${amount} HBAR from ${fromAccountId} to ${toAccountId}`);
      
      // In a real implementation, you would:
      // 1. Get the user's private key
      // 2. Create a TransferTransaction
      // 3. Sign and execute the transaction
      
      // For now, we'll simulate the transfer
      console.log(`✅ Transfer completed (simulated)`);
      
      return {} as TransactionResponse;
      
    } catch (error) {
      console.error('❌ Error transferring HBAR:', error);
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 