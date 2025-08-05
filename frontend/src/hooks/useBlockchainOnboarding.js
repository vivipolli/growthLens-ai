import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { businessCoachingService } from '../services/businessCoachingService.js';
import { useNavigate } from 'react-router-dom';

export const useBlockchainOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [blockchainData, setBlockchainData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Refs para controlar rate limiting e cache
  const lastRequestTime = useRef(0);
  const dataCache = useRef(new Map());
  const requestInProgress = useRef(false);
  
  // Rate limiting: mínimo 2 segundos entre requests
  const MIN_REQUEST_INTERVAL = 2000;

  // Função para reconstruir dados de negócio completos dos chunks
  const reconstructBusinessData = useCallback((allMessages) => {
    if (!allMessages || !Array.isArray(allMessages)) return null;

    // Filtrar chunks de business_data com totalChunks = 4
    const businessChunks = allMessages
      .filter(msg => 
        msg.parsed && 
        msg.parsed.type === 'business_data' && 
        msg.parsed.totalChunks === 4 &&
        msg.parsed.chunkIndex !== undefined
      )
      .map(msg => msg.parsed);

    console.log(`🔧 Found ${businessChunks.length} business data chunks`);

    if (businessChunks.length < 4) return null;

    // Verificar se temos todos os chunks (0, 1, 2, 3)
    const indices = new Set(businessChunks.map(chunk => chunk.chunkIndex));
    const hasCompleteSet = [0, 1, 2, 3].every(i => indices.has(i));

    if (!hasCompleteSet) {
      console.log(`⚠️ Incomplete chunk set. Found indices: [${Array.from(indices).sort().join(', ')}]`);
      return null;
    }

    // Obter o chunk mais recente para cada índice
    const latestChunks = {};
    businessChunks.forEach(chunk => {
      const existing = latestChunks[chunk.chunkIndex];
      if (!existing || new Date(chunk.timestamp) > new Date(existing.timestamp)) {
        latestChunks[chunk.chunkIndex] = chunk;
      }
    });

    // Combinar todos os dados
    const reconstructed = {};
    [0, 1, 2, 3].forEach(index => {
      const chunk = latestChunks[index];
      if (chunk && chunk.data) {
        Object.assign(reconstructed, chunk.data);
      }
    });

    console.log(`✅ Reconstructed business data with ${Object.keys(reconstructed).length} fields`);
    return reconstructed;
  }, []);

  // Função para mapear dados blockchain para formato dos formulários
  const mapBlockchainDataToForms = useCallback((userData) => {
    if (!userData) return { personalData: null, businessData: null, isComplete: false };

    const personalData = userData.userProfile ? {
      name: userData.userProfile.name || '',
      age: userData.userProfile.age || userData.userProfile.age_range || '',
      location: userData.userProfile.location || '',
      primary_motivation: userData.userProfile.primary_motivation || '',
      biggest_challenge: userData.userProfile.biggest_challenge || '',
      success_definition: userData.userProfile.success_definition || '',
      core_values: userData.userProfile.core_values || [],
      work_style: userData.userProfile.work_style || '',
      dream_lifestyle: userData.userProfile.dream_lifestyle || '',
      impact_goal: userData.userProfile.impact_goal || '',
      fear: userData.userProfile.fear || ''
    } : null;

    // Tentar reconstruir dados de negócio dos chunks
    let businessData = userData.businessData || {};
    
    // Se temos allMessages, tentar reconstruir dados completos
    if (userData.allMessages) {
      const reconstructedData = reconstructBusinessData(userData.allMessages);
      if (reconstructedData && Object.keys(reconstructedData).length > Object.keys(businessData).length) {
        console.log('🔄 Using reconstructed business data from chunks');
        businessData = reconstructedData;
      }
    }

    const mappedBusinessData = Object.keys(businessData).length > 0 ? {
      industry: businessData.industry || '',
      age_range: businessData.age_range || '',
      gender: businessData.gender || '',
      income_level: businessData.income_level || '',
      education_level: businessData.education_level || '',
      location: businessData.location || '',
      target_audience: businessData.target_audience || '',
      pain_points: businessData.pain_points || '',
      goals_aspirations: businessData.goals_aspirations || '',
      competitive_gaps: businessData.competitive_gaps || '',
      competitor_profiles: businessData.competitor_profiles || [],
      engaging_content_aspects: businessData.engaging_content_aspects || '',
      visual_communication_style: businessData.visual_communication_style || '',
      main_offer: businessData.main_offer || '',
      pricing_strategy: businessData.pricing_strategy || '',
      unique_benefits: businessData.unique_benefits || '',
      has_visual_identity: businessData.has_visual_identity || '',
      has_content_templates: businessData.has_content_templates || '',
      has_website: businessData.has_website || '',
      visual_identity_notes: businessData.visual_identity_notes || ''
    } : null;

    // Verificar se os dados estão completos (pelo menos campos básicos)
    const personalComplete = personalData && personalData.name && personalData.location && personalData.primary_motivation;
    const businessComplete = mappedBusinessData && mappedBusinessData.industry && mappedBusinessData.target_audience;
    const isComplete = personalComplete && businessComplete;

    console.log('📊 Blockchain data mapping:', {
      personalComplete,
      businessComplete,
      isComplete,
      personalFields: personalData ? Object.keys(personalData).filter(k => personalData[k]).length : 0,
      businessFields: mappedBusinessData ? Object.keys(mappedBusinessData).filter(k => mappedBusinessData[k]).length : 0
    });

    return {
      personalData,
      businessData: mappedBusinessData,
      isComplete,
      rawData: userData
    };
  }, [reconstructBusinessData]);

  // Função para carregar dados do blockchain com rate limiting e cache
  const loadBlockchainData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return null;

    // Verificar se há request em progresso
    if (requestInProgress.current && !forceRefresh) {
      console.log('⏳ Request already in progress, skipping...');
      return blockchainData;
    }

    // Verificar cache (válido por 30 segundos)
    const cacheKey = user.id;
    const cachedData = dataCache.current.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && !forceRefresh && (now - cachedData.timestamp < 30000)) {
      console.log('📋 Using cached blockchain data');
      setBlockchainData(cachedData.data);
      return cachedData.data;
    }

    // Verificar rate limiting
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && !forceRefresh) {
      console.log(`⏰ Rate limiting: waiting ${MIN_REQUEST_INTERVAL - timeSinceLastRequest}ms`);
      
      // Retornar dados em cache se disponíveis
      if (cachedData) {
        setBlockchainData(cachedData.data);
        return cachedData.data;
      }
      
      return null;
    }

    requestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading blockchain data for user:', user.id);
      lastRequestTime.current = now;
      
      const response = await businessCoachingService.getUserDataFromBlockchain(user.id);
      
      if (response && response.success && response.data) {
        console.log('✅ Blockchain data loaded successfully');
        const mappedData = mapBlockchainDataToForms(response.data);
        
        // Salvar em cache
        dataCache.current.set(cacheKey, {
          data: mappedData,
          timestamp: now
        });
        
        setBlockchainData(mappedData);
        return mappedData;
      } else {
        console.log('ℹ️ No blockchain data found for user');
        return null;
      }
    } catch (err) {
      console.error('❌ Error loading blockchain data:', err);
      
      // Se erro de rate limiting, tentar usar cache
      if (err.message.includes('Too many requests') && cachedData) {
        console.log('🔄 Using cached data due to rate limiting');
        setBlockchainData(cachedData.data);
        return cachedData.data;
      }
      
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [user?.id, mapBlockchainDataToForms, blockchainData]);

  // Função para preencher formulários com dados blockchain
  const fillFormsWithBlockchainData = useCallback(async () => {
    const data = await loadBlockchainData();
    
    if (!data) return false;

    // Salvar dados nos localStorage dos respectivos formulários
    if (data.personalData) {
      localStorage.setItem('personalOnboardingAnswers', JSON.stringify(data.personalData));
      console.log('💾 Personal data saved to localStorage');
    }

    if (data.businessData) {
      localStorage.setItem('businessOnboardingAnswers', JSON.stringify(data.businessData));
      console.log('💾 Business data saved to localStorage');
    }

    return true;
  }, [loadBlockchainData]);

  // Função para verificar e redirecionar se dados estão completos
  const checkAndRedirectIfComplete = useCallback(async () => {
    try {
      const data = await loadBlockchainData();
      
      if (data && data.isComplete) {
        console.log('🎉 User has complete blockchain data, redirecting to home');
        
        // Salvar dados nos formulários
        await fillFormsWithBlockchainData();
        
        // Aguardar um pouco para garantir que os dados foram salvos
        setTimeout(() => {
          navigate('/');
        }, 500);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking blockchain completion:', error);
      return false;
    }
  }, [loadBlockchainData, fillFormsWithBlockchainData, navigate]);

  // Função para preencher formulário específico
  const fillSpecificForm = useCallback(async (formType) => {
    try {
      const data = await loadBlockchainData();
      
      if (!data) return null;

      if (formType === 'personal' && data.personalData) {
        localStorage.setItem('personalOnboardingAnswers', JSON.stringify(data.personalData));
        return data.personalData;
      }

      if (formType === 'business' && data.businessData) {
        localStorage.setItem('businessOnboardingAnswers', JSON.stringify(data.businessData));
        return data.businessData;
      }

      return null;
    } catch (error) {
      console.error('❌ Error filling specific form:', error);
      return null;
    }
  }, [loadBlockchainData]);

  // Carregamento automático apenas na primeira visita ou localStorage vazio
  useEffect(() => {
    const checkAndLoadInitialData = async () => {
      if (!user?.id) return;

      // Verificar se já tem dados no localStorage
      const personalData = localStorage.getItem('personalOnboardingAnswers');
      const businessData = localStorage.getItem('businessOnboardingAnswers');
      
      // Se não tem dados locais, tentar carregar do blockchain
      if (!personalData || !businessData) {
        console.log('🔄 No local data found, attempting to load from blockchain...');
        
        try {
          const blockchainData = await loadBlockchainData();
          
          if (blockchainData) {
            // Preencher automaticamente os dados que estão disponíveis
            if (blockchainData.personalData && !personalData) {
              localStorage.setItem('personalOnboardingAnswers', JSON.stringify(blockchainData.personalData));
              console.log('✅ Personal data loaded from blockchain on first visit');
            }
            
            if (blockchainData.businessData && !businessData) {
              localStorage.setItem('businessOnboardingAnswers', JSON.stringify(blockchainData.businessData));
              console.log('✅ Business data loaded from blockchain on first visit');
            }
          }
        } catch (error) {
          console.log('ℹ️ Could not load blockchain data on first visit:', error.message);
        }
      } else {
        console.log('📋 Local data found, skipping blockchain load');
      }
    };

    // Aguardar um pouco para evitar multiple requests simultâneas
    const timer = setTimeout(checkAndLoadInitialData, 1000);
    
    return () => clearTimeout(timer);
  }, [user?.id, loadBlockchainData]);

  return {
    loading,
    blockchainData,
    error,
    loadBlockchainData,
    fillFormsWithBlockchainData,
    checkAndRedirectIfComplete,
    fillSpecificForm,
    reconstructBusinessData
  };
};