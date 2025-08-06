# 🚀 GrowthLens AI - Hedera Hackathon Project

An innovative business coaching platform that combines **Artificial Intelligence** with **Hedera blockchain** to create a unique business development experience.

## 🎯 **Overview**

GrowthLens AI is a complete solution that uses **Hedera Consensus Service (HCS)** to store immutable user data, business profiles, AI insights, and completed missions. The platform offers personalized AI-based coaching that evolves with the user's history stored on the blockchain.

## ⛓️ **Hedera Services Used**

### **Hedera Consensus Service (HCS) - Topics**
- **Immutable Storage**: All user data is stored in HCS topics
- **Data Types**:
  - `user_profile`: Personal and professional profile
  - `business_data`: Business information
  - `ai_insight`: AI-generated insights
  - `mission_completion`: Completed missions and goals
  - `daily_missions`: Daily missions  
  - `business_observations`: Business observations

### **Mirror Node API**
- **Historical Query**: Retrieval of historical data from blockchain
- **Message Reconstruction**: Intelligent system to reconstruct fragmented messages
- **Integrity Validation**: Verification of stored data

### **🔄 Smart Data Processing**
- **Automatic Recovery**: Reconstructs incomplete or fragmented blockchain messages
- **Data Continuity**: Ensures your coaching history is always complete, even from partial data
- **Intelligent Parsing**: Understands and organizes your business information from any format
- **Seamless Experience**: You never lose progress, even if data gets split during blockchain storage

## 🤖 **AI Integration**

### **OpenRouter + LangChain**
- **Models**: GPT-3.5-turbo, Claude-3.5-sonnet
- **Historical Context**: AI analyzes complete user history from blockchain
- **Personalized Insights**: Coaching based on real business data
- **Continuous Evolution**: AI learns from each stored interaction

### **Types of Generated Insights**
- **Marketing Strategy**: Target audience and channel analysis
- **Financial Optimization**: Cost and revenue management
- **Business Expansion**: Growth opportunities
- **Team Management**: Leadership development
- **Innovation**: New technologies and trends

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Hedera        │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Blockchain    │
│                 │    │                 │    │                 │
│ • Clerk Auth    │    │ • JWT Auth      │    │ • HCS Topics    │
│ • Dashboard     │    │ • AI Service    │    │ • Mirror Node   │
│ • Onboarding    │    │ • Topic Service │    │ • Account Mgmt  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **Registration**: User creates account → Hedera account created automatically
2. **Onboarding**: Data saved in user-specific HCS topics
3. **AI Coaching**: System queries blockchain history → Generates personalized insights
4. **Evolution**: New insights and missions continuously stored

## 🚀 **How to Run**

### **1. Prerequisites**
```bash
# Node.js 18+
# Hedera Testnet Account
# OpenRouter API Keys
```

### **2. Setup**
```bash
# Clone and install
git clone <repository-url>
cd hedera-growth

# Backend
cd backend
npm install
cp .env.example .env
# Configure HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, OPENROUTER_API_KEY

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Configure VITE_CLERK_PUBLISHABLE_KEY
```

### **3. Start Servers**
```bash
# Automatic script
./start-dev.sh

# Or manually
cd backend && npm run dev
cd frontend && npm run dev
```

### **4. Access**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🔧 **Hedera Configuration**

### **Create Testnet Account**
1. Visit: https://portal.hedera.com/
2. **Network**: Testnet
3. **Initial Balance**: 2 HBAR

### **Configure .env**
```env
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=3030020100300706052b8104000a04220420...
HEDERA_NETWORK=testnet
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## 📊 **Main Features**

### **🔐 Hybrid Authentication**
- **Clerk**: Frontend authentication
- **JWT**: Backend session management
- **Hedera**: Automatic account creation

### **🤖 Contextual AI**
- **Complete History**: Queries blockchain data
- **Personalized Insights**: Based on real user profile
- **Continuous Evolution**: Learns from each interaction
- **Intelligent Chat**: Uses historical context for personalized responses

### **📈 Intelligent Dashboard**
- **Daily Missions**: AI-generated
- **Visual Progress**: Based on real data
- **Real-time Insights**: Updated from blockchain

### **🎯 Complete Onboarding**
- **Personal Discovery**: Profile and motivations
- **Business Journey**: Company data
- **Secure Storage**: All data on blockchain

### **💬 Intelligent Chat System**
- **Historical Context**: AI uses complete user history from HCS
- **Personalized Responses**: Based on user progress and patterns
- **Real-time Learning**: Chat adapts to user behavior over time
- **Progress Integration**: Considers completed missions and insights

### **🔄 Resilient Data Processing**
- **Never Lose Progress**: Automatically recovers and reconstructs your data from the blockchain
- **Smart Organization**: Intelligently processes and organizes your business information
- **Reliable History**: Maintains complete coaching history even from incomplete blockchain messages
- **Background Magic**: All data processing happens seamlessly without interrupting your experience

## 🧪 **Blockchain Testing**

### **Save Data**
```bash
# User profile
curl -X POST http://localhost:3001/api/auth/profile/test/blockchain/store \
  -H "Content-Type: application/json" \
  -d '{"personal":{"name":"Test User"},"business":{"industry":"Tech"}}'

# AI insights
curl -X POST http://localhost:3001/api/business/insights/generate \
  -H "Content-Type: application/json" \
  -d '{"userProfile":{"personal":{"name":"Test"}},"insightType":"marketing"}'
```

### **Verify on Blockchain**
- **HashScan**: https://hashscan.io/testnet
- **Mirror Node**: https://testnet.mirrornode.hedera.com/



## 🎯 **Hackathon Differentiators**

### **✅ Implemented**
- **HCS Topics**: Immutable data storage
- **AI Integration**: LangChain + OpenRouter
- **Mirror Node**: Historical data query
- **User Management**: Automatic Hedera accounts
- **Real-time Dashboard**: Blockchain data
- **Complete Onboarding**: Profile + Business
- **Intelligent Chat**: Historical context + personalized responses


### **🎯 Future Implementations Roadmap**
1. #### **Phase 1**: 
- **Enhanced Text Formatting**: Improve text display formatting and readability
- **Progress Status Implementation**: Properly implement progress tracking and status
- **Anonymization**: Privacy-preserving data processing
- **UI/UX**: Style improvements, animations, internationalization (i18n) support, responsive layouts, and accessibility enhancements
- **Initial Testing**: Test with first 50 users to gather feedback, validate features and identify improvements

2. #### **Phase 2**: 
- **Advanced Prompt Engineering**: Integrate with advanced paid AI models (GPT-4, Claude, etc.)
- **Payment Integration**: Implement Freemium and Pro subscription plans with Stripe payments
- **AI Evolution**: Implement advanced learning algorithms for behavior analysis and personalized adaptation
- **Beta Launch**: Release beta version to early adopters, gather initial feedback, and optimize core features
- **Real User Testing**: Expand testing to 100+ users, gather comprehensive feedback, analyze usage patterns, and implement improvements based on real-world data


*See `HCS_IA_IMPROVEMENT_ANALYSIS.md` for detailed technical specifications.*


## 📄 **License**

MIT License - see `LICENSE` for details.

---

**🎉 Status**: ✅ **Hackathon Ready** - Complete system working with Hedera HCS! 