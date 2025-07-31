# Hedera AI Business Coaching Platform API

A comprehensive REST API backend that combines Hedera AI Agent Kit with specialized business coaching capabilities. This platform guides autonomous professionals to scale their digital businesses using AI-powered insights and personalized recommendations.

## Features

### 🤖 Core Hedera AI Agent
- **Basic Conversational Agent**: Direct execution mode for blockchain operations
- **User Transaction Management**: Generate transaction bytes for user signing
- **Transaction Signing**: Sign and execute transactions on behalf of users

### 🚀 Business Coaching Intelligence
- **Personalized Business Insights**: AI-generated recommendations based on user profile
- **Content Strategy Guidance**: Tailored content recommendations for target audience
- **Audience Growth Strategies**: Organic growth tactics specific to user's niche
- **Monetization Optimization**: Revenue strategies based on audience and industry
- **Competitive Analysis**: Market positioning and differentiation strategies
- **Goal Planning**: SMART goals and milestone tracking for business growth

### 🔧 Platform Features
- **Rate Limiting**: Built-in protection against abuse
- **TypeScript**: Full type safety and development experience
- **Personalized AI Chat**: Context-aware business mentoring conversations
- **Profile Management**: Save and retrieve user business profiles

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- Hedera testnet account
- **AI Provider** (escolha uma das opções):
  - **🆓 OpenRouter** (Recomendado - tem modelos gratuitos!) 
  - 💰 OpenAI API key (pago)

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. **Configure AI Provider** (escolha uma opção):

#### 🆓 Opção 1: OpenRouter (GRATUITO!)
```env
# Hedera (obrigatório)
HEDERA_ACCOUNT_ID=0.0.your_account_id
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_NETWORK=testnet

# OpenRouter (modelos gratuitos disponíveis!)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=sk-or-v1-your_api_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
PORT=3001
```

**📋 Como obter OpenRouter API Key (gratuita):**
1. Acesse: https://openrouter.ai/
2. Crie conta gratuita
3. Vá em: https://openrouter.ai/keys
4. Clique "Create Key"
5. Use modelos gratuitos como `mistralai/mistral-7b-instruct:free`

**💡 Veja o guia completo**: [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md)

#### 💰 Opção 2: OpenAI (Pago)
```env
# Hedera (obrigatório)
HEDERA_ACCOUNT_ID=0.0.your_account_id
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_NETWORK=testnet

# OpenAI (requer pagamento)
OPENAI_API_KEY=sk-your_openai_api_key_here
PORT=3001
```

### Development

Start the development server:
```bash
yarn dev
```

### Production

Build and start:
```bash
yarn build
yarn start
```

## API Endpoints

### Core Hedera Agent Endpoints

#### Health Check
```
GET /api/agent/health
```

#### Basic Chat
```
POST /api/agent/chat
Content-Type: application/json

{
  "message": "What's my HBAR balance?",
  "chatHistory": []
}
```

#### Create Transaction
```
POST /api/agent/transaction/create
Content-Type: application/json

{
  "message": "Transfer 5 HBAR to 0.0.12345",
  "userAccountId": "0.0.67890",
  "chatHistory": []
}
```

#### Sign Transaction
```
POST /api/agent/transaction/sign
Content-Type: application/json

{
  "transactionBytes": "base64_encoded_transaction",
  "userAccountId": "0.0.67890",
  "userPrivateKey": "user_private_key"
}
```

### Business Coaching Endpoints

#### Personalized Business Chat
```
POST /api/business/chat
Content-Type: application/json

{
  "message": "How can I improve my content strategy?",
  "userProfile": {
    "personal": { ... },
    "business": { ... }
  },
  "chatHistory": []
}
```

#### Generate Business Insights
```
POST /api/business/insights/generate
Content-Type: application/json

{
  "userProfile": {
    "personal": {
      "name": "John Doe",
      "age": "26-35",
      "location": "São Paulo, Brazil",
      "primary_motivation": "Financial freedom",
      "biggest_challenge": "Finding ideal customers",
      "success_definition": "Profitable online business",
      "core_values": ["Authenticity", "Growth", "Service"],
      "work_style": "Creative and flexible",
      "dream_lifestyle": "Remote work with travel",
      "impact_goal": "Help 1000+ people achieve goals",
      "fear": "Content not resonating with audience"
    },
    "business": {
      "industry": "Health & Wellness",
      "target_audience": {
        "age_range": "26-35 years old",
        "gender": "Primarily women",
        "income_level": "Middle class",
        "education_level": "Bachelor's degree",
        "location": "Urban areas",
        "pain_points": "Struggling with consistency",
        "goals_aspirations": "Feel confident and healthy"
      },
      "competitors": [
        {"name": "@competitor1", "link": "instagram.com/competitor1"}
      ],
      "content_analysis": {
        "engaging_aspects": "Personal stories, tutorials",
        "visual_style": "Bright colors, clean layouts",
        "competitive_gaps": "Beginner-friendly content missing"
      },
      "main_offer": "8-week transformation program"
    }
  },
  "insightType": "content_strategy",
  "specificQuestion": "How to create engaging content for beginners?"
}
```

Available `insightType` values:
- `content_strategy`: Content themes, formats, and engagement strategies
- `audience_growth`: Organic growth and community building tactics  
- `monetization`: Pricing strategies and revenue optimization
- `competitive_analysis`: Market positioning and differentiation
- `goal_planning`: SMART goals and milestone tracking

#### Save User Profile
```
POST /api/business/profile/save
Content-Type: application/json

{
  "personal": { ... },
  "business": { ... }
}
```

#### Get Personalized Recommendations
```
POST /api/business/recommendations
Content-Type: application/json

{
  "userProfile": { ... },
  "category": "audience_growth"
}
```

## Response Format

### Basic Agent Responses
```typescript
{
  output: string;           // Main response text
  message?: string;         // Additional message
  transactionBytes?: string; // Base64 transaction bytes
  scheduleId?: string;      // Schedule ID if transaction was scheduled
  notes?: string[];         // Agent's inferences and assumptions
  error?: string;           // Error message if something went wrong
}
```

### Business Insights Response
```typescript
{
  insights: [
    {
      id: string;
      type: 'performance' | 'opportunity' | 'strategy' | 'warning' | 'success';
      title: string;
      content: string;
      priority: 'high' | 'medium' | 'low';
      category: 'content' | 'audience' | 'monetization' | 'strategy';
      action: string;
      impact: string;
      confidence: number;      // 1-100
      reasoning: string;
      timeline: string;
      resources?: string[];
    }
  ],
  summary: string;
  nextSteps: string[];
  personalized_message: string;
}
```

## Examples

### Testing the API

Run the business coaching demo:
```bash
node examples/business-coaching-usage.js
```

Run the basic agent demo:
```bash
node examples/api-usage.js
```

### Example User Profile Structure

The platform expects user profiles with both personal and business information collected through onboarding forms. See `examples/business-coaching-usage.js` for a complete example profile.

## Security Considerations

- API includes rate limiting (100 requests per 15 minutes per IP)
- CORS enabled for cross-origin requests
- Helmet.js for basic security headers
- Input validation on all endpoints
- Environment variables for sensitive data
- Separate services for different functionalities

## Architecture

- **Express.js**: Web framework
- **TypeScript**: Type safety and development experience
- **Hedera Agent Kit**: Core blockchain AI agent functionality
- **Business Coaching Service**: Specialized AI coaching with personalized prompts
- **Modular Design**: Controllers, Services, and Routes separation
- **Context-Aware AI**: Prompts dynamically generated based on user profiles

## Integration with Frontend

The API is designed to integrate seamlessly with the existing frontend components:

- **PersonalOnboarding**: Data flows to `userProfile.personal`
- **BusinessOnboarding**: Data flows to `userProfile.business`  
- **AIInsights**: Powered by `/api/business/insights/generate`
- **Dashboard**: Uses `/api/business/recommendations`
- **AIMentor**: Powered by `/api/business/chat`

The frontend can call these endpoints to provide personalized, AI-powered business coaching based on the user's specific profile, goals, and challenges.