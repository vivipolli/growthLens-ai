export interface User {
  id: string;
  email: string;
  name: string;
  hederaAccountId?: string;
  hederaPublicKey?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  profileComplete: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  hederaAccountId?: string;
}

export interface HederaAccountInfo {
  accountId: string;
  publicKey: string;
  balance: number;
  isActive: boolean;
}

export interface BlockchainProfile {
  userId: string;
  hederaAccountId: string;
  profileHash: string;
  timestamp: string;
  signature?: string;
}

export interface UserSession {
  userId: string;
  hederaAccountId?: string;
  token: string;
  expiresAt: string;
} 