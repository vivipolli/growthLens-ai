import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

function createInstance(params: any) {
  let {
    modelName,
    baseURL,
    apiKey,
    llmType,
  } = params || {};
  modelName = modelName || 'openai/gpt-3.5-turbo';
  baseURL = baseURL || process.env.OPENROUTER_BASE_URL;
  apiKey = apiKey || process.env.OPENROUTER_API_KEY;
  llmType = llmType || modelName.split('/')[0];

  console.log('openRouter openAI createInstance', {
    modelName,
    baseURL,
    apiKey: apiKey?.substring(0, 12) + '...',
    llmType,
  });

  let llm;
  switch (llmType) {
    case 'openai':
    case 'anthropic':
    case 'deepseek':
    case 'mistralai':
    case 'google':
    case 'openrouter':
      console.log(`🤖 Creating ChatOpenAI instance with model: ${modelName}`);
      console.log(`🔗 Base URL: ${baseURL}`);
      console.log(`🔑 API Key: ${apiKey?.substring(0, 12)}...`);
      
      llm = new ChatOpenAI({
        modelName,
        apiKey,
        modalities: ['text'],
        maxTokens: 2000,
        temperature: 0.7,
        timeout: 60000, // 60 seconds timeout
        configuration: {
          baseURL,
        },
      });
      
      console.log(`✅ ChatOpenAI instance created successfully`);
      break;
    default:
      throw new Error(`Unsupported LLM type: ${llmType}`);
  }

  return llm;
}

export {
  createInstance,
}; 