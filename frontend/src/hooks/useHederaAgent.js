import { useState, useCallback } from 'react';
import { hederaAgentService } from '../services/hederaAgentService.js';

export const useHederaAgent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [agentStatus, setAgentStatus] = useState('unknown');

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await hederaAgentService.checkHealth();
      setAgentStatus('healthy');
      return response;
    } catch (err) {
      setError(err.message);
      setAgentStatus('error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hederaAgentService.sendBasicChatMessage(message, chatHistory);
      
      const newMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.output,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, 
        { id: Date.now() - 1, type: 'human', content: message, timestamp: new Date().toISOString() },
        newMessage
      ]);

      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [chatHistory]);

  const createTransaction = useCallback(async (message, userAccountId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hederaAgentService.createTransaction(message, userAccountId, chatHistory);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [chatHistory]);

  const signTransaction = useCallback(async (transactionBytes, userAccountId, userPrivateKey) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hederaAgentService.signTransaction(transactionBytes, userAccountId, userPrivateKey);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccountBalance = useCallback(async (accountId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hederaAgentService.getAccountBalance(accountId);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const transferHBAR = useCallback(async (amount, toAccountId, fromAccountId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hederaAgentService.transferHBAR(amount, toAccountId, fromAccountId);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    loading,
    error,
    chatHistory,
    agentStatus,
    checkHealth,
    sendMessage,
    createTransaction,
    signTransaction,
    getAccountBalance,
    transferHBAR,
    clearError,
    clearChatHistory
  };
}; 