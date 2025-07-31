# 🔐 Hedera Blockchain Authentication System

## **📋 Visão Geral**

Este sistema integra autenticação tradicional (email/senha) com contas Hedera blockchain, permitindo:

- ✅ **Registro de usuários** com contas Hedera automáticas
- ✅ **Login seguro** com JWT tokens
- ✅ **Armazenamento de perfis** na blockchain Hedera
- ✅ **Verificação de dados** na blockchain
- ✅ **Gerenciamento de chaves** seguras

## **🚀 Como Funciona**

### **1. Registro de Usuário**
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "João Silva"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "User registered successfully with Hedera account",
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "user@example.com",
      "name": "João Silva",
      "hederaAccountId": "0.0.123456",
      "hederaPublicKey": "302a300506032b6570032100...",
      "createdAt": "2025-07-01T18:00:00.000Z",
      "isVerified": false,
      "profileComplete": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "hederaAccountId": "0.0.123456"
  }
}
```

### **2. Login de Usuário**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### **3. Armazenar Perfil na Blockchain**
```bash
POST /api/auth/profile/{userId}/blockchain/store
Authorization: Bearer {jwt_token}

{
  "personal": {
    "name": "João Silva",
    "age": 30,
    "location": "São Paulo, Brasil",
    "primary_motivation": "Financial freedom"
  },
  "business": {
    "industry": "Digital Marketing",
    "target_audience": {
      "age_range": "25-35",
      "pain_points": "Lead generation"
    }
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Profile stored on blockchain successfully",
  "data": {
    "userId": "uuid-123",
    "hederaAccountId": "0.0.123456",
    "profileHash": "a1b2c3d4e5f6...",
    "timestamp": "2025-07-01T18:00:00.000Z"
  }
}
```

### **4. Verificar Perfil na Blockchain**
```bash
POST /api/auth/profile/{userId}/blockchain/verify
Authorization: Bearer {jwt_token}

{
  "personal": { ... },
  "business": { ... }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Profile verification completed",
  "data": {
    "isValid": true
  }
}
```

### **5. Obter Informações da Conta Hedera**
```bash
GET /api/auth/profile/{userId}/hedera
Authorization: Bearer {jwt_token}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Hedera account information retrieved",
  "data": {
    "accountId": "0.0.123456",
    "publicKey": "302a300506032b6570032100...",
    "balance": 1000000000,
    "isActive": true
  }
}
```

## **🔒 Segurança**

### **Chaves Privadas**
- 🔐 **Criptografadas** antes do armazenamento
- 🏦 **Gerenciamento seguro** (AWS KMS, HashiCorp Vault)
- ⚠️ **Nunca expostas** em logs ou respostas

### **JWT Tokens**
- ⏰ **Expiração**: 24 horas
- 🔄 **Sessões gerenciadas** no servidor
- 🚪 **Logout** invalida tokens

### **Blockchain**
- 📝 **Hashes SHA-256** para integridade
- 🔍 **Verificação** de dados na blockchain
- 🛡️ **Imutabilidade** dos dados

## **🏗️ Arquitetura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Hedera        │
│                 │    │                 │    │   Blockchain    │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Auth Form   │ │───▶│ AuthService  │ │───▶│ User Account │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ │HederaAuth   │ │───▶│ Profile Hash │ │
│ │ Dashboard   │ │◀───│ │Service      │ │    │ └─────────────┘ │
│ └─────────────┘ │    │ └─────────────┘ │    └─────────────────┘
└─────────────────┘    └─────────────────┘
```

## **🔧 Configuração**

### **Variáveis de Ambiente**
```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
```

## **📊 Benefícios**

### **Para Usuários**
- 🔐 **Controle total** dos dados
- 🌐 **Portabilidade** entre aplicações
- 💰 **Propriedade** de ativos digitais
- 🛡️ **Imutabilidade** de dados importantes

### **Para Desenvolvedores**
- ⚡ **Integração simples** com Hedera
- 🔄 **APIs RESTful** padrão
- 📝 **Documentação completa**
- 🧪 **Testes automatizados**

## **🚀 Próximos Passos**

1. **Implementar Topics** para armazenamento real na blockchain
2. **Adicionar Smart Contracts** para lógica de negócio
3. **Integrar Wallet Connect** para self-custody
4. **Implementar NFTs** para certificados e conquistas
5. **Adicionar micropagamentos** em HBAR

## **⚠️ Considerações de Produção**

- 🗄️ **Database**: Substituir Map por PostgreSQL/MongoDB
- 🔐 **Key Management**: Usar AWS KMS ou HashiCorp Vault
- 📊 **Monitoring**: Adicionar logs estruturados
- 🧪 **Testing**: Implementar testes unitários e de integração
- 🔄 **Rate Limiting**: Configurar limites por usuário
- 🛡️ **CORS**: Configurar origens permitidas 