import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  hedera: {
    accountId: process.env.HEDERA_ACCOUNT_ID || '',
    privateKey: process.env.HEDERA_PRIVATE_KEY || '',
    network: process.env.HEDERA_NETWORK || 'testnet',
    topicId: process.env.HEDERA_TOPIC_ID || ''
  },
  ai: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-distill-llama-70b:free',
    fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'mistralai/mistral-7b-instruct:free'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

export function validateEnvironment() {
  const required = [
    'HEDERA_ACCOUNT_ID',
    'HEDERA_PRIVATE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Verificar se temos a chave de API do OpenRouter
  if (!config.ai.apiKey) {
    console.warn('⚠️  Nenhuma API key configurada (OPENROUTER_API_KEY)');
    console.warn('💡 Configure OPENROUTER_API_KEY para usar modelos gratuitos!');
  } else {
    console.log('✅ OpenRouter API key configurada');
    console.log(`🔗 Base URL: ${config.ai.baseURL}`);
    console.log(`🤖 Modelo Primário: ${config.ai.model}`);
    console.log(`🔄 Modelo Fallback: ${config.ai.fallbackModel}`);
  }
} 