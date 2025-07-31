// Test Integration with Backend API
// Para testar, execute: node src/test/testIntegration.js

import { businessCoachingService } from '../services/businessCoachingService.js';
import { hederaAgentService } from '../services/hederaAgentService.js';

// Dados de teste - simula um perfil completo de onboarding
const testUserProfile = {
  personal: {
    name: "Maria Silva",
    age: "26-35",
    location: "São Paulo, Brasil",
    primary_motivation: "Liberdade financeira e impacto social",
    biggest_challenge: "Encontrar meu público ideal e criar conteúdo que ressoe com eles",
    success_definition: "Ter um negócio online lucrativo que me permita trabalhar de qualquer lugar",
    core_values: ["Autenticidade", "Crescimento", "Impacto"],
    work_style: "Criativo e flexível",
    dream_lifestyle: "Trabalhar remotamente, viajar enquanto ajudo pessoas",
    impact_goal: "Ajudar 1000+ pessoas a alcançar seus objetivos de saúde",
    fear: "Investir tempo e dinheiro em algo que não dê certo"
  },
  business: {
    industry: "Saúde e Bem-estar",
    target_audience: {
      age_range: "25-40 anos",
      gender: "Principalmente mulheres",
      income_level: "Classe média",
      education_level: "Ensino superior",
      location: "Grandes centros urbanos",
      pain_points: "Dificuldade para manter rotina saudável, falta de tempo",
      goals_aspirations: "Ter mais energia, autoestima e qualidade de vida"
    },
    competitors: [
      { name: "@nutricionistaX", link: "instagram.com/nutricionistaX" }
    ],
    content_analysis: {
      engaging_aspects: "Histórias pessoais, dicas práticas, antes/depois",
      visual_style: "Cores vibrantes, fotos naturais, vídeos curtos",
      competitive_gaps: "Pouco conteúdo para iniciantes, falta de comunidade"
    },
    main_offer: "Programa de 12 semanas de transformação de hábitos saudáveis",
    pricing_strategy: "R$ 697 à vista ou 12x de R$ 69,90"
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function testBusinessCoachingAPI() {
  console.log('🧪 Testando Business Coaching API...\n');

  try {
    // 1. Testar salvamento de perfil
    console.log('1️⃣ Testando salvamento de perfil...');
    
    // Simular localStorage (já que estamos em Node.js)
    global.localStorage = {
      getItem: (key) => {
        if (key === 'personalOnboardingAnswers') {
          return JSON.stringify(testUserProfile.personal);
        }
        if (key === 'businessOnboardingAnswers') {
          return JSON.stringify({
            industry: testUserProfile.business.industry,
            age_range: testUserProfile.business.target_audience.age_range,
            gender: testUserProfile.business.target_audience.gender,
            income_level: testUserProfile.business.target_audience.income_level,
            education_level: testUserProfile.business.target_audience.education_level,
            location: testUserProfile.business.target_audience.location,
            pain_points: testUserProfile.business.target_audience.pain_points,
            goals_aspirations: testUserProfile.business.target_audience.goals_aspirations,
            competitor_profiles: testUserProfile.business.competitors,
            engaging_content_aspects: testUserProfile.business.content_analysis.engaging_aspects,
            visual_communication_style: testUserProfile.business.content_analysis.visual_style,
            competitive_gaps: testUserProfile.business.content_analysis.competitive_gaps,
            main_offer: testUserProfile.business.main_offer,
            pricing_strategy: testUserProfile.business.pricing_strategy
          });
        }
        return null;
      },
      setItem: () => {},
      removeItem: () => {}
    };

    const saveResult = await businessCoachingService.saveProfile(testUserProfile);
    console.log('✅ Perfil salvo:', saveResult.success);

    // 2. Testar geração de insights de conteúdo
    console.log('\n2️⃣ Testando insights de estratégia de conteúdo...');
    const contentInsights = await businessCoachingService.getContentStrategyInsights(
      'Como criar conteúdo que engaje meu público-alvo?'
    );
    console.log('✅ Insights de conteúdo gerados:', contentInsights.insights.length, 'insights');

    // 3. Testar insights de crescimento de audiência
    console.log('\n3️⃣ Testando insights de crescimento de audiência...');
    const audienceInsights = await businessCoachingService.getAudienceGrowthInsights();
    console.log('✅ Insights de audiência gerados:', audienceInsights.insights.length, 'insights');

    // 4. Testar chat personalizado
    console.log('\n4️⃣ Testando chat com mentor AI...');
    const chatResponse = await businessCoachingService.sendChatMessage(
      'Estou com dificuldade para definir minha proposta de valor única. Pode me ajudar?',
      []
    );
    console.log('✅ Resposta do chat recebida, tamanho:', chatResponse.output.length, 'caracteres');

    // 5. Testar recomendações gerais
    console.log('\n5️⃣ Testando recomendações personalizadas...');
    const recommendations = await businessCoachingService.getRecommendations('monetization');
    console.log('✅ Recomendações geradas:', recommendations.insights.length, 'recomendações');

    console.log('\n🎉 Todos os testes de Business Coaching passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes de Business Coaching:', error.message);
  }
}

async function testHederaAgentAPI() {
  console.log('\n🔗 Testando Hedera Agent API...\n');

  try {
    // 1. Testar health check
    console.log('1️⃣ Testando health check...');
    const health = await hederaAgentService.checkHealth();
    console.log('✅ Health check:', health.status || 'OK');

    // 2. Testar chat básico
    console.log('\n2️⃣ Testando chat básico...');
    const basicChat = await hederaAgentService.sendBasicChatMessage(
      'Hello, how are you?',
      []
    );
    console.log('✅ Chat básico funcionando, resposta:', basicChat.output.substring(0, 100) + '...');

    console.log('\n🎉 Testes básicos do Hedera Agent passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes do Hedera Agent:', error.message);
    console.log('💡 Dica: Verifique se o backend está rodando em localhost:3001');
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes de integração Frontend → Backend\n');
  console.log('📋 Estes testes verificam se os serviços do frontend conseguem se comunicar com a API do backend\n');

  await testBusinessCoachingAPI();
  await testHederaAgentAPI();

  console.log('\n✨ Testes de integração concluídos!');
  console.log('\n📖 Como usar nos componentes:');
  console.log(`
// Exemplo em um componente React:
import { useBusinessCoaching } from './hooks/useBusinessCoaching';

const MyComponent = () => {
  const { 
    insights, 
    loading, 
    generateInsights,
    sendMessage 
  } = useBusinessCoaching();

  const handleGetInsights = async () => {
    await generateInsights('content_strategy');
  };

  return (
    <div>
      <button onClick={handleGetInsights} disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar Insights'}
      </button>
      
      {insights.map(insight => (
        <div key={insight.id}>
          <h3>{insight.title}</h3>
          <p>{insight.content}</p>
        </div>
      ))}
    </div>
  );
};
  `);
}

// Executar testes se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { 
  testBusinessCoachingAPI, 
  testHederaAgentAPI, 
  runAllTests, 
  testUserProfile 
}; 