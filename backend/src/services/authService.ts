import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/environment';
import { HederaAuthService } from './hederaAuthService';
import { User, AuthRequest, AuthResponse, UserSession } from '../types/auth.types';

// In-memory storage (replace with database in production)
const users: Map<string, User> = new Map();
const sessions: Map<string, UserSession> = new Map();

export class AuthService {
  private hederaAuthService: HederaAuthService;

  constructor() {
    this.hederaAuthService = new HederaAuthService();
  }

  /**
   * Register a new user with Hedera account
   */
  async registerUser(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      console.log(`🔐 Registering new user: ${email}`);

      // Check if user already exists
      const existingUser = Array.from(users.values()).find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user ID
      const userId = uuidv4();

      // Create Hedera account for the user
      const hederaAccount = await this.hederaAuthService.createUserAccount(userId);

      // Create user object
      const user: User = {
        id: userId,
        email,
        name,
        hederaAccountId: hederaAccount.accountId,
        hederaPublicKey: hederaAccount.publicKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        profileComplete: false
      };

      // Store user (in production, save to database)
      users.set(userId, user);

      // Generate JWT token
      const token = this.generateToken(user);

      console.log(`✅ User registered successfully: ${userId}`);
      console.log(`🔗 Hedera Account ID: ${hederaAccount.accountId}`);

      return {
        user,
        token,
        hederaAccountId: hederaAccount.accountId
      };

    } catch (error) {
      console.error('❌ Registration error:', error);
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log(`🔐 User login attempt: ${email}`);

      // Find user by email
      const user = Array.from(users.values()).find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password (in production, get from database)
      const isValidPassword = await bcrypt.compare(password, 'hashed_password_placeholder');
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Create session
      const session: UserSession = {
        userId: user.id,
        hederaAccountId: user.hederaAccountId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      sessions.set(token, session);

      console.log(`✅ User logged in successfully: ${user.id}`);

      return {
        user,
        token,
        hederaAccountId: user.hederaAccountId
      };

    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store user profile on blockchain
   */
  async storeProfileOnBlockchain(userId: string, profileData: any): Promise<any> {
    try {
      console.log(`📝 Storing profile on blockchain for user: ${userId}`);

      const user = users.get(userId);
      if (!user || !user.hederaAccountId) {
        throw new Error('User not found or no Hedera account');
      }

      // Store profile on Hedera blockchain
      const blockchainProfile = await this.hederaAuthService.storeUserProfile(
        userId,
        user.hederaAccountId,
        profileData
      );

      // Update user profile completion status
      user.profileComplete = true;
      user.updatedAt = new Date().toISOString();
      users.set(userId, user);

      console.log(`✅ Profile stored on blockchain: ${blockchainProfile.profileHash}`);

      return blockchainProfile;

    } catch (error) {
      console.error('❌ Error storing profile on blockchain:', error);
      throw new Error(`Failed to store profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify user profile on blockchain
   */
  async verifyProfileOnBlockchain(userId: string, profileData: any): Promise<boolean> {
    try {
      console.log(`🔍 Verifying profile on blockchain for user: ${userId}`);

      const user = users.get(userId);
      if (!user || !user.hederaAccountId) {
        throw new Error('User not found or no Hedera account');
      }

      const isValid = await this.hederaAuthService.verifyUserProfile(
        userId,
        user.hederaAccountId,
        profileData
      );

      return isValid;

    } catch (error) {
      console.error('❌ Error verifying profile:', error);
      return false;
    }
  }

  /**
   * Get user's Hedera account information
   */
  async getUserHederaInfo(userId: string): Promise<any> {
    try {
      const user = users.get(userId);
      if (!user || !user.hederaAccountId) {
        throw new Error('User not found or no Hedera account');
      }

      const accountInfo = await this.hederaAuthService.getAccountInfo(user.hederaAccountId);
      const balance = await this.hederaAuthService.getAccountBalance(user.hederaAccountId);

      return {
        accountId: accountInfo.accountId,
        publicKey: accountInfo.publicKey,
        balance,
        isActive: accountInfo.isActive
      };

    } catch (error) {
      console.error('❌ Error getting Hedera info:', error);
      throw new Error(`Failed to get Hedera info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = users.get(decoded.userId);
      
      if (!user) {
        return null;
      }

      // Check if session exists and is valid
      const session = sessions.get(token);
      if (!session || new Date(session.expiresAt) < new Date()) {
        sessions.delete(token);
        return null;
      }

      return user;

    } catch (error) {
      console.error('❌ Token validation error:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logoutUser(token: string): Promise<void> {
    try {
      sessions.delete(token);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        hederaAccountId: user.hederaAccountId 
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return users.get(userId) || null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const user = users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    users.set(userId, updatedUser);
    return updatedUser;
  }
} 