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

1. **Implementar A transaction that creates a new topic recognized by the Hedera network. The newly generated topic can be referenced by its topicId. The topicId is used to identify a unique topic to submit messages to. You can obtain the new topic ID by requesting the receipt of the transaction. All messages within a topic are sequenced with respect to one another and are provided a unique sequence number.

Note

With the Consensus Node Release v0.60, you can set an auto renew account ID without the requirement of setting an admin key on the topic.

Private topic
You can also create a private topic where only authorized parties can submit messages to that topic. To create a private topic you would need to set the submitKey property of the transaction. The submitKey value is then shared with the authorized parties and is required to successfully submit messages to the private topic.

Topic Properties
Field
Description
Admin Key

Access control for updateTopic/deleteTopic. If no adminKey is specified, anyone can increase the topic's expirationTime with updateTopic, but they cannot use deleteTopic. However, if an adminKey is specified, both updateTopic and deleteTopic can be used.

Submit Key

Access control for submitMessage. No access control will be performed specified, allowing all message submissions.

Topic Memo

Store the new topic with a short publicly visible memo. (100 bytes)

Auto Renew Account

At the topic's expirationTime, the optional account can be used to extend the lifetime up to a maximum of the autoRenewPeriod or duration/amount that all funds on the account can extend (whichever is the smaller).

Currently, rent is not enforced for topics so no auto-renew payments will be made.

Note: If the developer does not explicitly set autoRenewAccount, the SDK will automatically default to using the transaction fee payer account ID for the auto renew account. This is beneficial in the event an admin key is not set.

Auto Renew Period

The initial lifetime of the topic and the amount of time to attempt to extend the topic's lifetime by automatically at the topic's expirationTime. Currently, rent is not enforced for topics so auto-renew payments will not be made.

NOTE: The minimum period of time is approximately 30 days (2592000 seconds) and the maximum period of time is approximately 92 days (8000001 seconds). Any other value outside of this range will return the following error: AUTORENEW_DURATION_NOT_IN_RANGE.

Fee Schedule Key

(Optional) A key that controls updates and deletions of topic fees. Must be set at creation; cannot be added later via updateTopic.

Fee Exempt Keys

(Optional) A list of keys that, if used to sign a message submission, allow the sender to bypass fees. Can be updated later via updateTopic.

Custom Fees

(Optional) A fee structure applied to message submissions for revenue generation. Can be updated later via updateTopic, but must be signed by the Fee Schedule Key.
Defines a fixed fee required for each message submission to the topic. This fee can be set in HBAR or HTS fungible tokens and applies when messages are submitted.

Transaction Signing Requirements:

If an Admin Key is specified, the Admin Key must sign the transaction.

If no Admin Key is specified, the topic is immutable.

If an Auto Renew Account is specified, that account must also sign this transaction.

If a Fee Schedule Key is specified, the Fee Schedule Key must sign the transaction.

If a Fee Exempt Key List is specified, it contains a list of public keys that are exempt from paying fees when submitting messages to the topic. These keys do not need to sign the transaction.

Transaction Fees

Each transaction incurs a standard Hedera network fee based on network resource usage.

If a custom fee is set for a topic, users submitting messages must pay this fee in HBAR or HTS tokens.

The Fee Schedule Key allows authorized users to update fee structures. If set, it must sign transactions modifying fees.

Fee exemptions can be granted using the Fee Exempt Key List.

Use the Hedera Fee Estimator to estimate standard network fees.s** para armazenamento real na blockchain
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