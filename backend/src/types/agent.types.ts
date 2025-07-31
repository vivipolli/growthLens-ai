export interface AgentRequest {
  message: string;
  chatHistory?: any[];
}

export interface UserTransactionRequest extends AgentRequest {
  userAccountId: string;
}

export interface AgentResponse {
  output: string;
  message?: string;
  transactionBytes?: string;
  scheduleId?: string;
  notes?: string[];
  error?: string;
}

export interface SignTransactionRequest {
  transactionBytes: string;
  userAccountId: string;
  userPrivateKey: string;
}

export interface SignTransactionResponse {
  success: boolean;
  transactionId?: string;
  receipt?: any;
  error?: string;
} 