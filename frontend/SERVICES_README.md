# Frontend Services Integration Guide

Este guide explica como usar os serviços criados para integrar o frontend com a REST API do backend.

## 📁 Estrutura dos Serviços

```
src/
├── services/           # Serviços de API
│   ├── businessCoachingService.js
│   ├── hederaAgentService.js
│   └── index.js
├── hooks/             # Hooks customizados
│   ├── useBusinessCoaching.js
│   ├── useHederaAgent.js
│   ├── useUserProfile.js
│   └── index.js
├── utils/             # Funções utilitárias
│   ├── api.js
│   ├── userProfile.js
│   ├── constants.js
│   └── index.js
└── examples/          # Exemplos de uso
    └── ServiceUsageExamples.jsx
```

## 🚀 Quick Start

### 1. Configuração da API

Crie um arquivo `.env` no frontend com:

```env
VITE_API_URL=http://localhost:3001
```

### 2. Importando e Usando os Serviços

```javascript
// Importação simples dos hooks
import { useBusinessCoaching, useUserProfile } from './hooks';

// Ou importação específica
import { useBusinessCoaching } from './hooks/useBusinessCoaching';
```

## 🎯 Principais Hooks

### useBusinessCoaching

Hook principal para funcionalidades de business coaching.

```javascript
import { useBusinessCoaching } from './hooks/useBusinessCoaching';

const MyComponent = () => {
  const {
    loading,
    error,
    insights,
    profileComplete,
    generateInsights,
    sendMessage,
    getRecommendations
  } = useBusinessCoaching();

  // Gerar insights específicos
  const handleContentStrategy = async () => {
    await generateInsights('content_strategy', 'Como melhorar engajamento?');
  };

  // Chat com mentor AI
  const handleSendMessage = async () => {
    await sendMessage('Preciso de ajuda com marketing digital');
  };

  return (
    <div>
      {!profileComplete && (
        <p>Complete seu perfil primeiro!</p>
      )}
      
      <button onClick={handleContentStrategy} disabled={loading}>
        Gerar Insights de Conteúdo
      </button>
      
      {error && <div>Erro: {error}</div>}
      
      {insights.map(insight => (
        <div key={insight.id}>
          <h3>{insight.title}</h3>
          <p>{insight.content}</p>
        </div>
      ))}
    </div>
  );
};
```

### useUserProfile

Hook para gerenciar perfis de usuário.

```javascript
import { useUserProfile } from './hooks/useUserProfile';

const ProfileComponent = () => {
  const {
    profile,
    profileComplete,
    savePersonal,
    saveBusiness,
    saveCompleteProfile
  } = useUserProfile();

  const handleSavePersonal = (data) => {
    savePersonal(data);
  };

  const handleCompletedOnboarding = async () => {
    // Salvar perfil completo na API
    await saveCompleteProfile();
  };

  return (
    <div>
      <p>Status: {profileComplete ? 'Completo' : 'Incompleto'}</p>
      {profile && (
        <div>
          <p>Nome: {profile.personal.name}</p>
          <p>Indústria: {profile.business.industry}</p>
        </div>
      )}
    </div>
  );
};
```

### useHederaAgent

Hook para funcionalidades do Hedera Agent.

```javascript
import { useHederaAgent } from './hooks/useHederaAgent';

const HederaComponent = () => {
  const {
    loading,
    agentStatus,
    checkHealth,
    getAccountBalance,
    sendMessage
  } = useHederaAgent();

  return (
    <div>
      <p>Status do Agent: {agentStatus}</p>
      <button onClick={checkHealth}>Verificar Saúde</button>
      <button onClick={() => getAccountBalance('0.0.123456')}>
        Ver Saldo
      </button>
    </div>
  );
};
```

## 🔧 Usando Serviços Diretamente

Se preferir usar os serviços diretamente sem hooks:

```javascript
import { businessCoachingService } from './services/businessCoachingService';
import { getUserProfile } from './utils/userProfile';

const MyComponent = () => {
  const handleGetInsights = async () => {
    try {
      const insights = await businessCoachingService.getContentStrategyInsights(
        'Como criar conteúdo viral?'
      );
      console.log(insights);
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const checkProfile = () => {
    const profile = getUserProfile();
    if (profile) {
      console.log('Perfil encontrado:', profile);
    }
  };

  return (
    <div>
      <button onClick={handleGetInsights}>Buscar Insights</button>
      <button onClick={checkProfile}>Verificar Perfil</button>
    </div>
  );
};
```

## 🔗 Integrando com Componentes Existentes

### PersonalOnboarding

```javascript
import { useUserProfile } from './hooks/useUserProfile';

const PersonalOnboarding = () => {
  const { savePersonal, saveCompleteProfile } = useUserProfile();
  
  const handleComplete = async (answers) => {
    // Salvar dados pessoais
    savePersonal(answers);
    
    // Se business onboarding também completo, salvar na API
    const businessData = localStorage.getItem('businessOnboardingAnswers');
    if (businessData) {
      await saveCompleteProfile();
    }
  };

  // ... resto do componente
};
```

### AIInsights

```javascript
import { useBusinessCoaching } from './hooks/useBusinessCoaching';
import { INSIGHT_TYPES } from './utils/constants';

const AIInsights = () => {
  const { 
    insights, 
    loading, 
    error, 
    generateInsights,
    profileComplete 
  } = useBusinessCoaching();

  useEffect(() => {
    if (profileComplete) {
      // Buscar insights automáticos no carregamento
      generateInsights(INSIGHT_TYPES.CONTENT_STRATEGY);
    }
  }, [profileComplete]);

  if (!profileComplete) {
    return <div>Complete seu onboarding primeiro!</div>;
  }

  return (
    <div>
      {loading && <div>Carregando insights...</div>}
      {error && <div>Erro: {error}</div>}
      
      {insights.map(insight => (
        <div key={insight.id} className="insight-card">
          <h3>{insight.title}</h3>
          <p>{insight.content}</p>
          <span className={`priority-${insight.priority}`}>
            {insight.priority}
          </span>
        </div>
      ))}
    </div>
  );
};
```

### AIMentor (Chat)

```javascript
import { useBusinessCoaching } from './hooks/useBusinessCoaching';

const AIMentor = () => {
  const { 
    chatHistory, 
    sendMessage, 
    loading, 
    profileComplete 
  } = useBusinessCoaching();
  
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      await sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div>
      <div className="chat-history">
        {chatHistory.map(msg => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <p>{msg.content}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSend}>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Pergunte ao seu mentor AI..."
          disabled={loading || !profileComplete}
        />
        <button type="submit" disabled={loading || !inputMessage.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};
```

## 📊 Tipos de Insights Disponíveis

```javascript
import { INSIGHT_TYPES } from './utils/constants';

// Tipos disponíveis:
INSIGHT_TYPES.CONTENT_STRATEGY      // Estratégia de conteúdo
INSIGHT_TYPES.AUDIENCE_GROWTH       // Crescimento de audiência  
INSIGHT_TYPES.MONETIZATION          // Monetização
INSIGHT_TYPES.COMPETITIVE_ANALYSIS  // Análise competitiva
INSIGHT_TYPES.GOAL_PLANNING         // Planejamento de metas
```

## 🔒 Tratamento de Erros

Todos os hooks incluem tratamento de erro:

```javascript
const { error, clearError } = useBusinessCoaching();

// Limpar erro manualmente
const handleRetry = () => {
  clearError();
  // tentar novamente...
};

// Exibir erro na UI
{error && (
  <div className="error-message">
    <p>{error}</p>
    <button onClick={handleRetry}>Tentar Novamente</button>
  </div>
)}
```

## 🚦 Estados de Loading

```javascript
const { loading } = useBusinessCoaching();

return (
  <div>
    <button disabled={loading}>
      {loading ? 'Carregando...' : 'Gerar Insights'}
    </button>
    
    {loading && <div className="spinner">Carregando...</div>}
  </div>
);
```

## 🎨 Exemplos Completos

Veja `src/examples/ServiceUsageExamples.jsx` para exemplos completos de como usar cada hook e serviço.

## 🔄 Fluxo de Dados

1. **Onboarding** → `localStorage` → `userProfile.js`
2. **Profile Complete** → API via `businessCoachingService.saveProfile()`
3. **Insights Request** → API via `businessCoachingService.generateInsights()`
4. **Chat Messages** → API via `businessCoachingService.sendChatMessage()`

## 💡 Dicas

1. **Sempre verificar `profileComplete`** antes de fazer requests
2. **Usar hooks para gerenciar estado automaticamente**
3. **Tratar erros graciosamente** 
4. **Implementar loading states** para melhor UX
5. **Limpar erros quando necessário**

## 🎯 Próximos Passos

1. Integrar os hooks nos componentes existentes
2. Testar com dados reais do onboarding
3. Implementar cache para insights
4. Adicionar offline support
5. Criar testes unitários

Os serviços estão prontos para uso! Basta importar e usar nos seus componentes. 🚀 