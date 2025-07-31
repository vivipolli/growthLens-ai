// Exemplo de como testar o Dashboard com missões geradas por IA
// Este arquivo demonstra como o perfil do usuário influencia as missões

import { businessCoachingService } from '../services/businessCoachingService.js';
import { saveUserProfile } from '../utils/userProfile.js';

// Exemplo de perfil completo de usuário
const exampleUserProfile = {
  personal: {
    name: "Maria Silva",
    age: "26-35",
    location: "São Paulo, Brasil",
    primary_motivation: "Liberdade financeira e flexibilidade",
    biggest_challenge: "Encontrar clientes ideais consistentemente",
    success_definition: "Ter um negócio digital lucrativo que gere 10k/mês",
    core_values: ["Autenticidade", "Crescimento", "Impacto"],
    work_style: "Criativa e organizada",
    dream_lifestyle: "Trabalho remoto com viagens",
    impact_goal: "Ajudar 1000+ pessoas a transformar suas vidas",
    fear: "Conteúdo não ressoar com audiência"
  },
  business: {
    industry: "Coaching e Desenvolvimento Pessoal",
    target_audience: {
      age_range: "25-40 anos",
      gender: "Principalmente mulheres",
      income_level: "Classe média-alta",
      education_level: "Ensino superior",
      location: "Grandes centros urbanos",
      pain_points: "Falta de direção e autoconfiança",
      goals_aspirations: "Crescimento pessoal e profissional"
    },
    competitors: [
      { name: "@liderancafeminina", link: "instagram.com/liderancafeminina" },
      { name: "@mulheresempreendedoras", link: "instagram.com/mulheresempreendedoras" }
    ],
    content_analysis: {
      engaging_aspects: "Stories pessoais, dicas práticas, lives",
      visual_style: "Cores suaves, fontes elegantes, fotos lifestyle",
      competitive_gaps: "Falta conteúdo para iniciantes, pouco foco em mindset"
    },
    main_offer: "Programa de Transformação Pessoal de 12 semanas",
    pricing_strategy: "Premium com opções de parcelamento"
  }
};

// Função para testar geração de missões dinâmicas
export const testAIMissionGeneration = async () => {
  console.log('🚀 Testando geração de missões com IA...');
  
  try {
    // 1. Salvar perfil do usuário
    console.log('📝 Salvando perfil do usuário...');
    saveUserProfile(exampleUserProfile);
    
    // 2. Gerar missões diárias personalizadas
    console.log('🎯 Gerando missões diárias personalizadas...');
    const missions = await businessCoachingService.generateDailyMissions();
    console.log('✅ Missões geradas:', missions);
    
    // 3. Gerar metas semanais
    console.log('📈 Gerando metas semanais...');
    const goals = await businessCoachingService.generateWeeklyGoals();
    console.log('✅ Metas geradas:', goals);
    
    // 4. Gerar insights personalizados
    console.log('💡 Gerando insights personalizados...');
    const insights = await businessCoachingService.generatePersonalizedInsights();
    console.log('✅ Insights gerados:', insights);
    
    return {
      missions,
      goals,
      insights,
      userProfile: exampleUserProfile
    };
    
  } catch (error) {
    console.error('❌ Erro ao testar geração de IA:', error);
    throw error;
  }
};

// Exemplo de como as missões mudam baseado no perfil
export const compareProfilesMissions = async () => {
  console.log('🔄 Comparando missões para diferentes perfis...');
  
  // Perfil 1: Coach iniciante
  const beginnerProfile = {
    ...exampleUserProfile,
    personal: {
      ...exampleUserProfile.personal,
      name: "João Iniciante",
      biggest_challenge: "Não sei por onde começar meu negócio digital",
      success_definition: "Conseguir meus primeiros 1000 seguidores"
    },
    business: {
      ...exampleUserProfile.business,
      industry: "Fitness e Bem-estar",
      main_offer: "Ainda definindo minha oferta principal"
    }
  };
  
  // Perfil 2: Empreendedora avançada
  const advancedProfile = {
    ...exampleUserProfile,
    personal: {
      ...exampleUserProfile.personal,
      name: "Ana Experiente",
      biggest_challenge: "Escalar meu negócio para o próximo nível",
      success_definition: "Automatizar processos e aumentar ticket médio"
    },
    business: {
      ...exampleUserProfile.business,
      industry: "Marketing Digital",
      main_offer: "Curso completo de marketing digital + mentoria"
    }
  };
  
  try {
    // Testar com perfil iniciante
    console.log('👶 Testando perfil iniciante...');
    saveUserProfile(beginnerProfile);
    const beginnerMissions = await businessCoachingService.generateDailyMissions();
    
    // Aguardar um pouco entre requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Testar com perfil avançado
    console.log('👩‍💼 Testando perfil avançado...');
    saveUserProfile(advancedProfile);
    const advancedMissions = await businessCoachingService.generateDailyMissions();
    
    console.log('📊 Comparação de missões:');
    console.log('Iniciante:', beginnerMissions);
    console.log('Avançado:', advancedMissions);
    
    return {
      beginner: beginnerMissions,
      advanced: advancedMissions
    };
    
  } catch (error) {
    console.error('❌ Erro na comparação:', error);
    throw error;
  }
};

// Função para demonstrar integração completa
export const demonstrateFullIntegration = async () => {
  console.log('🎪 Demonstração completa da integração Dashboard + IA');
  
  try {
    // 1. Configurar perfil
    saveUserProfile(exampleUserProfile);
    
    // 2. Simular fluxo completo do Dashboard
    console.log('🏠 Simulando entrada no Dashboard...');
    
    // 3. Gerar conteúdo dinâmico
    const results = await Promise.allSettled([
      businessCoachingService.generateDailyMissions(),
      businessCoachingService.generateWeeklyGoals(), 
      businessCoachingService.generatePersonalizedInsights()
    ]);
    
    console.log('📋 Resultados da integração:');
    results.forEach((result, index) => {
      const types = ['Missões', 'Metas', 'Insights'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${types[index]}:`, result.value);
      } else {
        console.log(`❌ ${types[index]} falharam:`, result.reason);
      }
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
    throw error;
  }
};

// Como usar no browser console:
console.log(`
🎯 COMO TESTAR A INTEGRAÇÃO IA + DASHBOARD:

1. Abra o console do browser (F12)
2. Execute um dos comandos:

// Teste básico
import('./examples/testDashboardWithAI.js').then(m => m.testAIMissionGeneration());

// Comparar diferentes perfis  
import('./examples/testDashboardWithAI.js').then(m => m.compareProfilesMissions());

// Demonstração completa
import('./examples/testDashboardWithAI.js').then(m => m.demonstrateFullIntegration());

3. Vá para o Dashboard e veja as missões personalizadas!

🚀 FUNCIONALIDADES INTEGRADAS:
- ✅ Missões diárias baseadas no perfil do usuário
- ✅ Metas semanais alinhadas com objetivos pessoais  
- ✅ Insights personalizados para o negócio
- ✅ Cache local (missões são salvas por 24h)
- ✅ Fallback para missões padrão se IA falhar
- ✅ Interface atualizada em tempo real
- ✅ Indicadores de carregamento e erro
`);

export default {
  testAIMissionGeneration,
  compareProfilesMissions,
  demonstrateFullIntegration,
  exampleUserProfile
}; 