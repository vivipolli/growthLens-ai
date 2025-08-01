# 🚀 Hedera Growth Platform

Uma plataforma de coaching empresarial com IA integrada à blockchain Hedera para armazenamento imutável de dados.

## ✨ Funcionalidades

- 🔐 **Autenticação com Clerk**
- 🤖 **IA Generativa** (OpenRouter/Mistral)
- ⛓️ **Blockchain Hedera** para dados imutáveis
- 📊 **Dashboard Personalizado**
- 🎯 **Missões Diárias** geradas por IA
- 📈 **Insights de Negócio**
- 🔄 **Onboarding Completo**

## 🛠️ Tecnologias

### Frontend
- **React 18** + Vite
- **Clerk** (Autenticação)
- **Tailwind CSS** (Estilização)
- **React Router** (Navegação)

### Backend
- **Node.js** + Express
- **TypeScript**
- **Hedera SDK** (Blockchain)
- **LangChain** (IA)
- **OpenRouter** (Modelos IA)

### Blockchain
- **Hedera Consensus Service (HCS)**
- **Mirror Node API**
- **Tópicos para dados imutáveis**

## 🚀 Início Rápido

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd hedera-growth
```

### 2. Instale as Dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure as Variáveis de Ambiente

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edite `backend/.env`:
```env
HEDERA_ACCOUNT_ID=0.0.5904577
HEDERA_PRIVATE_KEY=3030020100300706052b8104000a04220420c724367867456a2b93ca53ec34e50650de938bb83e9f2b714213a8de5bd25dce
HEDERA_NETWORK=testnet

OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free

PORT=3001
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edite `frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key
VITE_API_URL=http://localhost:3001
```

### 4. Inicie os Servidores

#### Opção A: Script Automático
```bash
./start-dev.sh
```

#### Opção B: Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Acesse a Aplicação
- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:3001/api/agent/health

## 🔑 Configuração Hedera

### Criar Conta Testnet
1. Acesse: https://portal.hedera.com/
2. Clique em "Create Account"
3. Configure:
   - **Network:** Testnet
   - **Account Type:** Individual
   - **Initial Balance:** 2 HBAR

### Obter Credenciais
Após criar a conta, você receberá:
- **Account ID** (ex: `0.0.1234567`)
- **Private Key** (formato DER)

### Atualizar .env
```env
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=3030020100300706052b8104000a04220420...
```

## 🧪 Testes

### Testar Blockchain
```bash
# Salvar perfil
curl -X POST http://localhost:3001/api/business/profile/save \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","profileData":{"name":"Test User"}}'

# Salvar dados de negócio
curl -X POST http://localhost:3001/api/business/business/save \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","businessData":{"company":"Test Corp"}}'

# Salvar missão concluída
curl -X POST http://localhost:3001/api/business/mission/save \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","missionData":{"missionId":"1","completed":true}}'
```

### Verificar na Blockchain
- Acesse: https://hashscan.io/testnet
- Cole o Transaction ID retornado

## 📁 Estrutura do Projeto

```
hedera-growth/
├── frontend/                 # React App
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # Serviços Frontend
│   │   └── utils/          # Utilitários
│   └── public/
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/    # Controladores API
│   │   ├── services/       # Serviços Backend
│   │   ├── routes/         # Rotas API
│   │   └── config/         # Configurações
│   └── scripts/            # Scripts Utilitários
└── docs/                    # Documentação
```

## 🔧 Scripts Úteis

### Gerar Chave Hedera
```bash
cd backend
node scripts/generate-hedera-key.js
```

### Criar Conta Hedera
```bash
cd backend
node scripts/create-hedera-account.js
```

### Iniciar Ambiente de Desenvolvimento
```bash
./start-dev.sh
```

## 🐛 Solução de Problemas

### Erro de Conexão
```bash
# Verificar se servidores estão rodando
curl http://localhost:3001/api/agent/health
curl http://localhost:5173
```

### Erro de Chave Privada
```bash
# Gerar nova chave
cd backend
node scripts/generate-hedera-key.js
```

### Limpar Cache
```bash
# Frontend
cd frontend
rm -rf node_modules/.vite
npm run dev

# Backend
cd backend
rm -rf dist
npm run dev
```

## 📊 Monitoramento

### Logs do Backend
```bash
tail -f backend/logs/*.log
```

### Status da Blockchain
- **HashScan:** https://hashscan.io/testnet
- **Mirror Node:** https://testnet.mirrornode.hedera.com/

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues:** GitHub Issues
- **Documentação:** `/docs`
- **Hedera Docs:** https://docs.hedera.com/ 