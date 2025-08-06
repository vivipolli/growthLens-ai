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
  openai: {
    // Prioritize OpenRouter over OpenAI
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
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

  // Verificar se temos pelo menos uma chave de API
  if (!config.openai.apiKey) {
    console.warn('⚠️  Nenhuma API key configurada (OPENROUTER_API_KEY ou OPENAI_API_KEY)');
    console.warn('💡 Configure OPENROUTER_API_KEY para usar modelos gratuitos!');
  } else {
    if (process.env.OPENROUTER_API_KEY) {
      console.log('✅ OpenRouter API key configurada');
      console.log(`🔗 Base URL: ${config.openai.baseURL}`);
      console.log(`🤖 Modelo: ${config.openai.model}`);
    } else {
      console.log('✅ OpenAI API key configurada');
    }
  }
} 