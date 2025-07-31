# Frontend Integration Guide

Este guia mostra como integrar o backend de business coaching com os componentes existentes do frontend.

## 📋 Mapeamento de Dados

### PersonalOnboarding → UserProfile.personal

```javascript
// Como transformar os dados do PersonalOnboarding para o formato da API

const personalAnswers = JSON.parse(localStorage.getItem('personalOnboardingAnswers'));

const personalProfile = {
  name: personalAnswers.name,
  age: personalAnswers.age,
  location: personalAnswers.location,
  primary_motivation: personalAnswers.primary_motivation,
  biggest_challenge: personalAnswers.biggest_challenge,
  success_definition: personalAnswers.success_definition,
  core_values: personalAnswers.core_values, // já é array
  work_style: personalAnswers.work_style,
  dream_lifestyle: personalAnswers.dream_lifestyle,
  impact_goal: personalAnswers.impact_goal,
  fear: personalAnswers.fear
};
```

### BusinessOnboarding → UserProfile.business

```javascript
// Como transformar os dados do BusinessOnboarding para o formato da API

const businessAnswers = JSON.parse(localStorage.getItem('businessOnboardingAnswers'));

const businessProfile = {
  industry: businessAnswers.industry,
  target_audience: {
    age_range: businessAnswers.age_range,
    gender: businessAnswers.gender,
    income_level: businessAnswers.income_level,
    education_level: businessAnswers.education_level,
    location: businessAnswers.location,
    pain_points: businessAnswers.pain_points,
    goals_aspirations: businessAnswers.goals_aspirations
  },
  competitors: businessAnswers.competitor_profiles || [],
  content_analysis: {
    engaging_aspects: businessAnswers.engaging_content_aspects,
    visual_style: businessAnswers.visual_communication_style,
    competitive_gaps: businessAnswers.competitive_gaps
  },
  main_offer: businessAnswers.main_offer,
  pricing_strategy: businessAnswers.pricing_strategy
};
```

## 🔗 Integrações por Componente

### AIInsights.jsx - Insights Personalizados

```javascript
// Substitua os insights mockados por dados reais da API

import { useState, useEffect } from 'react';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonalizedInsights();
  }, []);

  const fetchPersonalizedInsights = async () => {
    try {
      // Buscar perfil do usuário do localStorage
      const userProfile = getUserProfile();
      
      if (!userProfile) {
        console.log('User profile not found');
        return;
      }

      const response = await fetch('/api/business/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userProfile,
          category: 'content_strategy' // ou dinâmico baseado no contexto
        })
      });

      const data = await response.json();
      
      // Transformar insights para o formato esperado pelo componente
      const formattedInsights = data.insights.map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        content: insight.content,
        priority: insight.priority,
        category: insight.category,
        action: insight.action,
        impact: insight.impact,
        confidence: insight.confidence
      }));

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = () => {
    try {
      const personal = JSON.parse(localStorage.getItem('personalOnboardingAnswers'));
      const business = JSON.parse(localStorage.getItem('businessOnboardingAnswers'));
      
      if (!personal || !business) return null;

      return {
        personal: {
          name: personal.name,
          age: personal.age,
          location: personal.location,
          primary_motivation: personal.primary_motivation,
          biggest_challenge: personal.biggest_challenge,
          success_definition: personal.success_definition,
          core_values: personal.core_values,
          work_style: personal.work_style,
          dream_lifestyle: personal.dream_lifestyle,
          impact_goal: personal.impact_goal,
          fear: personal.fear
        },
        business: {
          industry: business.industry,
          target_audience: {
            age_range: business.age_range,
            gender: business.gender,
            income_level: business.income_level,
            education_level: business.education_level,
            location: business.location,
            pain_points: business.pain_points,
            goals_aspirations: business.goals_aspirations
          },
          competitors: business.competitor_profiles || [],
          content_analysis: {
            engaging_aspects: business.engaging_content_aspects,
            visual_style: business.visual_communication_style,
            competitive_gaps: business.competitive_gaps
          },
          main_offer: business.main_offer,
          pricing_strategy: business.pricing_strategy
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error building user profile:', error);
      return null;
    }
  };

  // Resto do componente permanece igual...
};
```

### AIMentor.jsx - Chat Personalizado

```javascript
// Integrar com o chat contextualizado

const AIMentor = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message) => {
    setIsLoading(true);
    
    try {
      const userProfile = getUserProfile(); // mesma função acima
      
      const response = await fetch('/api/business/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          userProfile: userProfile,
          chatHistory: messages.map(msg => ({
            type: msg.sender === 'user' ? 'human' : 'ai',
            content: msg.text
          }))
        })
      });

      const data = await response.json();
      
      // Adicionar resposta aos messages
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.output,
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resto do componente...
};
```

### Dashboard.jsx - Múltiplos Insights

```javascript
// Adicionar diferentes tipos de insights no dashboard

const Dashboard = () => {
  const [contentInsights, setContentInsights] = useState([]);
  const [audienceInsights, setAudienceInsights] = useState([]);
  const [monetizationInsights, setMonetizationInsights] = useState([]);

  useEffect(() => {
    fetchAllInsights();
  }, []);

  const fetchAllInsights = async () => {
    const userProfile = getUserProfile();
    if (!userProfile) return;

    try {
      // Buscar diferentes tipos de insights
      const insightTypes = ['content_strategy', 'audience_growth', 'monetization'];
      
      const promises = insightTypes.map(type =>
        fetch('/api/business/insights/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile,
            insightType: type
          })
        }).then(res => res.json())
      );

      const [content, audience, monetization] = await Promise.all(promises);
      
      setContentInsights(content.insights);
      setAudienceInsights(audience.insights);
      setMonetizationInsights(monetization.insights);

    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  // Resto do componente...
};
```

## 🔄 Fluxo de Integração Completo

### 1. Onboarding Flow
```javascript
// PersonalOnboarding.jsx - ao completar
const handleComplete = async () => {
  // Salvar dados pessoais
  localStorage.setItem('personalOnboardingAnswers', JSON.stringify(answers));
  
  // Se business onboarding também estiver completo, salvar perfil completo na API
  const businessData = localStorage.getItem('businessOnboardingAnswers');
  if (businessData) {
    await saveCompleteProfile();
  }
  
  // Navegar para próximo passo
  onComplete(answers);
};

// BusinessOnboarding.jsx - ao completar
const handleComplete = async () => {
  // Salvar dados de negócio
  localStorage.setItem('businessOnboardingAnswers', JSON.stringify(answers));
  
  // Salvar perfil completo na API
  await saveCompleteProfile();
  
  // Navegar para dashboard
  navigate('/dashboard');
};

const saveCompleteProfile = async () => {
  try {
    const userProfile = getUserProfile();
    
    await fetch('/api/business/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile)
    });
    
    console.log('Profile saved successfully');
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};
```

### 2. Utility Functions (criar arquivo utils/api.js)

```javascript
// utils/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const getUserProfile = () => {
  try {
    const personal = JSON.parse(localStorage.getItem('personalOnboardingAnswers'));
    const business = JSON.parse(localStorage.getItem('businessOnboardingAnswers'));
    
    if (!personal || !business) return null;

    return {
      personal: {
        name: personal.name,
        age: personal.age,
        location: personal.location,
        primary_motivation: personal.primary_motivation,
        biggest_challenge: personal.biggest_challenge,
        success_definition: personal.success_definition,
        core_values: personal.core_values,
        work_style: personal.work_style,
        dream_lifestyle: personal.dream_lifestyle,
        impact_goal: personal.impact_goal,
        fear: personal.fear
      },
      business: {
        industry: business.industry,
        target_audience: {
          age_range: business.age_range,
          gender: business.gender,
          income_level: business.income_level,
          education_level: business.education_level,
          location: business.location,
          pain_points: business.pain_points,
          goals_aspirations: business.goals_aspirations
        },
        competitors: business.competitor_profiles || [],
        content_analysis: {
          engaging_aspects: business.engaging_content_aspects,
          visual_style: business.visual_communication_style,
          competitive_gaps: business.competitive_gaps
        },
        main_offer: business.main_offer,
        pricing_strategy: business.pricing_strategy
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error building user profile:', error);
    return null;
  }
};

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

## 📱 Exemplo de Uso Prático

```javascript
// Exemplo de como usar no componente
import { getUserProfile, apiCall } from '../utils/api';

const BusinessComponent = () => {
  const handleGetInsights = async (type = 'content_strategy') => {
    const userProfile = getUserProfile();
    
    if (!userProfile) {
      alert('Por favor, complete seu perfil primeiro!');
      return;
    }

    try {
      const insights = await apiCall('/api/business/insights/generate', {
        method: 'POST',
        body: JSON.stringify({
          userProfile,
          insightType: type
        })
      });

      console.log('Insights recebidos:', insights);
      // Usar os insights no componente...
      
    } catch (error) {
      console.error('Erro ao buscar insights:', error);
    }
  };

  // Resto do componente...
};
```

## 🎯 Próximos Passos

1. **Implementar as mudanças nos componentes** seguindo os exemplos acima
2. **Testar a integração** com dados reais de onboarding
3. **Adicionar loading states** para melhorar UX
4. **Implementar error handling** para casos de falha na API
5. **Adicionar cache local** para insights já buscados
6. **Criar sistema de refresh** para atualizar insights periodicamente

O backend já está preparado para receber esses dados e fornecer insights personalizados baseados no perfil completo do usuário! 