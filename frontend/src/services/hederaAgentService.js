import { apiCall, apiEndpoints } from '../utils/api.js';

export const hederaAgentService = {
  async checkHealth() {
    return await apiCall(apiEndpoints.agent.health);
  },

  async sendBasicChatMessage(message, chatHistory = []) {
    const payload = {
      message,
      chatHistory
    };

    return await apiCall(apiEndpoints.agent.chat, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async createTransaction(message, userAccountId, chatHistory = []) {
    const payload = {
      message,
      userAccountId,
      chatHistory
    };

    return await apiCall(apiEndpoints.agent.createTransaction, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async signTransaction(transactionBytes, userAccountId, userPrivateKey) {
    const payload = {
      transactionBytes,
      userAccountId,
      userPrivateKey
    };

    return await apiCall(apiEndpoints.agent.signTransaction, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getAccountBalance(accountId) {
    return await this.sendBasicChatMessage(`What's the balance for account ${accountId}?`);
  },

  async transferHBAR(amount, toAccountId, fromAccountId) {
    const message = `Transfer ${amount} HBAR from ${fromAccountId} to ${toAccountId}`;
    return await this.createTransaction(message, fromAccountId);
  }
}; 