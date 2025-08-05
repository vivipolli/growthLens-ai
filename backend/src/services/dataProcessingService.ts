export interface ProcessedMessage {
  chunk_info: any;
  consensus_timestamp: string;
  message: string;
  payer_account_id: string;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  topic_id: string;
  reconstructed: boolean;
  decoded: string;
  parsed: any;
}

export class DataProcessingService {
  
  processAllMessagesForOutput(reconstructedMessages: any[]): ProcessedMessage[] {
    const processedMessages: ProcessedMessage[] = [];
    const seenMessages = new Set<string>();
    
    for (const msg of reconstructedMessages) {
      let content = msg.message;
      
      if (msg.decoded) {
        content = msg.decoded;
      } else {
        if (typeof content === 'string' && content.match(/^[A-Za-z0-9+/=]+$/) && content.length > 20) {
          try {
            const decoded = Buffer.from(content, 'base64').toString('utf-8');
            if (decoded.startsWith('{') || decoded.startsWith('[')) {
              content = decoded;
            }
          } catch (decodeError) {
            // Continue with original content
          }
        }
      }
      
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        continue;
      }
      
      const messageKey = `${parsed.type}_${parsed.timestamp}_${JSON.stringify(parsed.data).substring(0, 100)}`;
      
      if (seenMessages.has(messageKey)) {
        continue;
      }
      seenMessages.add(messageKey);
      
      const cleanMessage: ProcessedMessage = {
        chunk_info: msg.chunk_info || null,
        consensus_timestamp: msg.consensus_timestamp,
        message: content,
        payer_account_id: msg.payer_account_id,
        running_hash: msg.running_hash,
        running_hash_version: msg.running_hash_version,
        sequence_number: msg.sequence_number,
        topic_id: msg.topic_id,
        reconstructed: msg.reconstructed || false,
        decoded: content,
        parsed: parsed
      };
      
      processedMessages.push(cleanMessage);
    }
    
    processedMessages.sort((a, b) => {
      const timeA = new Date(a.consensus_timestamp).getTime();
      const timeB = new Date(b.consensus_timestamp).getTime();
      return timeB - timeA;
    });
    
    return processedMessages;
  }

  reconstructFragmentedMessages(messages: any[]): any[] {
    const chunkedJsonMessages: any[] = [];
    const fragmentedRawMessages: any[] = [];
    const singleMessages: any[] = [];
    
    for (const message of messages) {
      let messageContent = message.message;
      
      if (messageContent && typeof messageContent === 'string') {
        if (messageContent.match(/^[A-Za-z0-9+/=]+$/) && messageContent.length > 20) {
          try {
            const decoded = Buffer.from(messageContent, 'base64').toString('utf-8');
            if (decoded.startsWith('{') || decoded.startsWith('[')) {
              messageContent = decoded;
              message.decoded = decoded;
            }
          } catch (decodeError) {
            // Continue with original message
          }
        }
      }
      
      try {
        const parsed = JSON.parse(messageContent);
        if (parsed.chunkIndex !== undefined && parsed.totalChunks !== undefined) {
          chunkedJsonMessages.push({
            ...message,
            message: messageContent,
            parsedContent: parsed
          });
          continue;
        }
      } catch (parseError) {
        // Not a valid JSON, might be fragmented
      }
      
      if (message.chunk_info && message.chunk_info.total > 1) {
        fragmentedRawMessages.push({
          ...message,
          message: messageContent
        });
      } else {
        singleMessages.push({
          ...message,
          message: messageContent
        });
      }
    }
    
    const reconstructedMessages: any[] = [];
    reconstructedMessages.push(...singleMessages);
    
    if (chunkedJsonMessages.length > 0) {
      const chunkGroups = new Map<string, any[]>();
      
      for (const message of chunkedJsonMessages) {
        const parsed = message.parsedContent;
        const groupKey = `${parsed.timestamp}_${parsed.totalChunks}_${parsed.type}`;
        
        if (!chunkGroups.has(groupKey)) {
          chunkGroups.set(groupKey, []);
        }
        chunkGroups.get(groupKey)!.push(message);
      }
      
      for (const [groupKey, chunks] of chunkGroups) {
        chunks.sort((a, b) => a.parsedContent.chunkIndex - b.parsedContent.chunkIndex);
        
        for (const chunk of chunks) {
          reconstructedMessages.push({
            ...chunk,
            reconstructed: false
          });
        }
      }
    }
    
    if (fragmentedRawMessages.length > 0) {
      const messageGroups = new Map<string, any[]>();
      
      for (const message of fragmentedRawMessages) {
        const chunkInfo = message.chunk_info;
        const groupKey = `${chunkInfo.initial_transaction_id.transaction_valid_start}_${chunkInfo.total}`;
        
        if (!messageGroups.has(groupKey)) {
          messageGroups.set(groupKey, []);
        }
        messageGroups.get(groupKey)!.push(message);
      }
      
      for (const [groupKey, groupMessages] of messageGroups) {
        const sortedMessages = groupMessages.sort((a, b) => {
          const chunkA = a.chunk_info?.number || 0;
          const chunkB = b.chunk_info?.number || 0;
          return chunkA - chunkB;
        });
        
        let fullMessage = '';
        for (const message of sortedMessages) {
          fullMessage += message.message;
        }
        
        const reconstructedMessage = {
          ...groupMessages[0],
          message: fullMessage,
          reconstructed: true
        };
        
        reconstructedMessages.push(reconstructedMessage);
      }
    }
    
    return reconstructedMessages;
  }

  extractInsightsFromFragmentedMessage(messageContent: string): any[] {
    const insights: any[] = [];
    
    const insightMatches = messageContent.match(/\{[^}]*"id"\s*:\s*"[^"]+"[^}]*\}/g);
    
    if (insightMatches) {
      for (const match of insightMatches) {
        try {
          let completedJson = match;
          
          if (!completedJson.endsWith('}')) {
            const remainingContent = messageContent.substring(messageContent.indexOf(match) + match.length);
            const closingBraceIndex = remainingContent.indexOf('}');
            if (closingBraceIndex !== -1) {
              completedJson += remainingContent.substring(0, closingBraceIndex + 1);
            }
          }
          
          const insight = JSON.parse(completedJson);
          if (insight.id && insight.title) {
            insights.push(insight);
          }
        } catch (parseError) {
          // Continue to next match
        }
      }
    }
    
    if (insights.length === 0) {
      const idMatches = messageContent.match(/"id"\s*:\s*"([^"]+)"/g);
      const titleMatches = messageContent.match(/"title"\s*:\s*"([^"]+)"/g);
      const typeMatches = messageContent.match(/"type"\s*:\s*"([^"]+)"/g);
      const categoryMatches = messageContent.match(/"category"\s*:\s*"([^"]+)"/g);
      const priorityMatches = messageContent.match(/"priority"\s*:\s*"([^"]+)"/g);
      
      if (idMatches && titleMatches) {
        const maxInsights = Math.min(idMatches.length, titleMatches.length);
        
        for (let i = 0; i < maxInsights; i++) {
          const idMatch = idMatches[i].match(/"id"\s*:\s*"([^"]+)"/);
          const titleMatch = titleMatches[i].match(/"title"\s*:\s*"([^"]+)"/);
          const typeMatch = typeMatches?.[i]?.match(/"type"\s*:\s*"([^"]+)"/);
          const categoryMatch = categoryMatches?.[i]?.match(/"category"\s*:\s*"([^"]+)"/);
          const priorityMatch = priorityMatches?.[i]?.match(/"priority"\s*:\s*"([^"]+)"/);
          
          if (idMatch && titleMatch) {
            const insight = {
              id: idMatch[1],
              title: titleMatch[1],
              type: typeMatch ? typeMatch[1] : 'strategy',
              category: categoryMatch ? categoryMatch[1] : 'general',
              priority: priorityMatch ? priorityMatch[1] : 'medium',
              description: `Extracted from truncated message - ${titleMatch[1]}`,
              timestamp: new Date().toISOString()
            };
            
            insights.push(insight);
          }
        }
      }
    }
    
    if (insights.length === 0) {
      const commonTitles = [
        'Optimize', 'Create', 'Analyze', 'Build', 'Develop', 'Implement', 
        'Improve', 'Enhance', 'Focus', 'Start', 'Define', 'Set up'
      ];
      
      for (const title of commonTitles) {
        const titleRegex = new RegExp(`"title"\\s*:\\s*"([^"]*${title}[^"]*)"`, 'g');
        const matches = messageContent.match(titleRegex);
        
        if (matches) {
          for (const match of matches) {
            const titleMatch = match.match(/"title"\s*:\s*"([^"]+)"/);
            if (titleMatch) {
              const insight = {
                id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: titleMatch[1],
                type: 'strategy',
                category: 'general',
                priority: 'medium',
                description: `Extracted from truncated message - ${titleMatch[1]}`,
                timestamp: new Date().toISOString()
              };
              
              insights.push(insight);
            }
          }
        }
      }
    }
    
    return insights;
  }

  reconstructTruncatedJSON(messageContent: string): any | null {
    try {
      return JSON.parse(messageContent);
    } catch (error) {
      // Continue with reconstruction
    }
    
    if (messageContent.startsWith('{') && !messageContent.endsWith('}')) {
      const lastCommaIndex = messageContent.lastIndexOf(',');
      const lastQuoteIndex = messageContent.lastIndexOf('"');
      
      if (lastCommaIndex > lastQuoteIndex) {
        const truncatedAt = lastCommaIndex;
        const partialJson = messageContent.substring(0, truncatedAt) + '}';
        
        try {
          const parsed = JSON.parse(partialJson);
          return parsed;
        } catch (error) {
          // Continue with other methods
        }
      }
    }
    
    const jsonMatches = messageContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(match);
          if (parsed.type && parsed.data) {
            return parsed;
          }
        } catch (error) {
          // Continue to next match
        }
      }
    }
    
    return null;
  }

  extractUserDataFromTruncatedMessage(messageContent: string, dataType: 'user_profile' | 'business_data'): any | null {
    try {
      const dataMatch = messageContent.match(/"data"\s*:\s*\{([^}]*)/);
      if (dataMatch) {
        const dataContent = dataMatch[1];
        const extractedData: any = {};
        
        if (dataType === 'user_profile') {
          const patterns = [
            { key: 'name', pattern: /"name"\s*:\s*"([^"]+)"/ },
            { key: 'age', pattern: /"age"\s*:\s*(\d+)/ },
            { key: 'location', pattern: /"location"\s*:\s*"([^"]+)"/ },
            { key: 'primary_motivation', pattern: /"primary_motivation"\s*:\s*"([^"]+)"/ },
            { key: 'industry', pattern: /"industry"\s*:\s*"([^"]+)"/ },
            { key: 'age_range', pattern: /"age_range"\s*:\s*"([^"]+)"/ },
            { key: 'gender', pattern: /"gender"\s*:\s*"([^"]+)"/ },
            { key: 'income_level', pattern: /"income_level"\s*:\s*"([^"]+)"/ },
            { key: 'clerkId', pattern: /"clerkId"\s*:\s*"([^"]+)"/ },
            { key: 'has_visual_identity', pattern: /"has_visual_identity"\s*:\s*"([^"]+)"/ },
            { key: 'has_content_templates', pattern: /"has_content_templates"\s*:\s*"([^"]+)"/ },
            { key: 'has_brand_guidelines', pattern: /"has_brand_guidelines"\s*:\s*"([^"]+)"/ },
            { key: 'has_website', pattern: /"has_website"\s*:\s*"([^"]+)"/ },
            { key: 'has_social_media', pattern: /"has_social_media"\s*:\s*"([^"]+)"/ },
            { key: 'has_email_marketing', pattern: /"has_email_marketing"\s*:\s*"([^"]+)"/ },
            { key: 'has_paid_ads', pattern: /"has_paid_ads"\s*:\s*"([^"]+)"/ },
            { key: 'has_analytics', pattern: /"has_analytics"\s*:\s*"([^"]+)"/ },
            { key: 'has_crm', pattern: /"has_crm"\s*:\s*"([^"]+)"/ },
            { key: 'has_automation', pattern: /"has_automation"\s*:\s*"([^"]+)"/ },
            { key: 'has_collaboration_tools', pattern: /"has_collaboration_tools"\s*:\s*"([^"]+)"/ },
            { key: 'has_project_management', pattern: /"has_project_management"\s*:\s*"([^"]+)"/ },
            { key: 'has_financial_tools', pattern: /"has_financial_tools"\s*:\s*"([^"]+)"/ },
            { key: 'has_legal_support', pattern: /"has_legal_support"\s*:\s*"([^"]+)"/ },
            { key: 'has_mentorship', pattern: /"has_mentorship"\s*:\s*"([^"]+)"/ },
            { key: 'has_networking', pattern: /"has_networking"\s*:\s*"([^"]+)"/ },
            { key: 'has_skill_development', pattern: /"has_skill_development"\s*:\s*"([^"]+)"/ },
            { key: 'has_time_management', pattern: /"has_time_management"\s*:\s*"([^"]+)"/ },
            { key: 'has_stress_management', pattern: /"has_stress_management"\s*:\s*"([^"]+)"/ },
            { key: 'has_work_life_balance', pattern: /"has_work_life_balance"\s*:\s*"([^"]+)"/ }
          ];
          
          for (const { key, pattern } of patterns) {
            const match = dataContent.match(pattern);
            if (match) {
              if (key === 'age') {
                extractedData[key] = parseInt(match[1]);
              } else {
                extractedData[key] = match[1];
              }
            }
          }
          
          return Object.keys(extractedData).length > 0 ? extractedData : null;
        }
        
        if (dataType === 'business_data') {
          const patterns = [
            { key: 'industry', pattern: /"industry"\s*:\s*"([^"]+)"/ },
            { key: 'age_range', pattern: /"age_range"\s*:\s*"([^"]+)"/ },
            { key: 'gender', pattern: /"gender"\s*:\s*"([^"]+)"/ },
            { key: 'income_level', pattern: /"income_level"\s*:\s*"([^"]+)"/ },
            { key: 'business_name', pattern: /"business_name"\s*:\s*"([^"]+)"/ },
            { key: 'business_description', pattern: /"business_description"\s*:\s*"([^"]+)"/ },
            { key: 'target_audience', pattern: /"target_audience"\s*:\s*"([^"]+)"/ },
            { key: 'competitive_gaps', pattern: /"competitive_gaps"\s*:\s*"([^"]+)"/ },
            { key: 'clerkId', pattern: /"clerkId"\s*:\s*"([^"]+)"/ },
            { key: 'competitor_profiles', pattern: /"competitor_profiles"\s*:\s*\[([^\]]+)\]/ },
            { key: 'social_media_platforms', pattern: /"social_media_platforms"\s*:\s*\[([^\]]+)\]/ },
            { key: 'content_types', pattern: /"content_types"\s*:\s*\[([^\]]+)\]/ },
            { key: 'marketing_channels', pattern: /"marketing_channels"\s*:\s*\[([^\]]+)\]/ },
            { key: 'business_goals', pattern: /"business_goals"\s*:\s*\[([^\]]+)\]/ },
            { key: 'challenges', pattern: /"challenges"\s*:\s*\[([^\]]+)\]/ },
            { key: 'strengths', pattern: /"strengths"\s*:\s*\[([^\]]+)\]/ },
            { key: 'weaknesses', pattern: /"weaknesses"\s*:\s*\[([^\]]+)\]/ },
            { key: 'opportunities', pattern: /"opportunities"\s*:\s*\[([^\]]+)\]/ },
            { key: 'threats', pattern: /"threats"\s*:\s*\[([^\]]+)\]/ }
          ];
          
          for (const { key, pattern } of patterns) {
            const match = dataContent.match(pattern);
            if (match) {
              if (key.includes('_profiles') || key.includes('_platforms') || key.includes('_types') || 
                  key.includes('_channels') || key.includes('_goals') || key.includes('_challenges') ||
                  key.includes('_strengths') || key.includes('_weaknesses') || key.includes('_opportunities') ||
                  key.includes('_threats')) {
                try {
                  extractedData[key] = JSON.parse(`[${match[1]}]`);
                } catch {
                  extractedData[key] = match[1];
                }
              } else {
                extractedData[key] = match[1];
              }
            }
          }
          
          return Object.keys(extractedData).length > 0 ? extractedData : null;
        }
      }
    } catch (error) {
      // Ignore extraction errors
    }
    
    return null;
  }

  combineUserDataFromMultipleMessages(messages: any[], dataType: 'user_profile' | 'business_data'): any | null {
    const combinedData: any = {};
    let foundAnyData = false;
    
    const sortedMessages = messages.sort((a, b) => {
      const timestampA = parseFloat(a.consensus_timestamp || '0');
      const timestampB = parseFloat(b.consensus_timestamp || '0');
      return timestampB - timestampA;
    });
    
    for (const message of sortedMessages) {
      try {
        let messageContent = message.message;
        
        if (messageContent && typeof messageContent === 'string') {
          if (messageContent.match(/^[A-Za-z0-9+/=]+$/) && messageContent.length > 20) {
            try {
              const decoded = Buffer.from(messageContent, 'base64').toString('utf-8');
              if (decoded.startsWith('{') || decoded.startsWith('[')) {
                messageContent = decoded;
              }
            } catch (decodeError) {
              // Continue with original message
            }
          }
        }
        
        const typeMatch = messageContent.match(/"type"\s*:\s*"([^"]+)"/); 
        if (typeMatch && typeMatch[1] === dataType) {
          try {
            const parsedMessage = JSON.parse(messageContent);
            if (parsedMessage.data) {
              Object.assign(combinedData, parsedMessage.data);
              foundAnyData = true;
              continue;
            }
          } catch (parseError) {
            // Continue with partial extraction
          }
          
          const extractedData = this.extractUserDataFromTruncatedMessage(messageContent, dataType);
          if (extractedData) {
            Object.assign(combinedData, extractedData);
            foundAnyData = true;
          }
          
          const additionalData = this.extractDataFromRawContent(messageContent, dataType);
          if (additionalData) {
            Object.assign(combinedData, additionalData);
          }
        }
      } catch (error) {
        // Ignore processing errors
      }
    }
    
    if (foundAnyData) {
      return combinedData;
    }
    
    return null;
  }

  extractDataFromRawContent(messageContent: string, dataType: 'user_profile' | 'business_data'): any | null {
    const extractedData: any = {};
    
    try {
      const patterns = dataType === 'user_profile' ? [
        { key: 'name', pattern: /"name"\s*:\s*"([^"]+)"/ },
        { key: 'primary_motivation', pattern: /"primary_motivation"\s*:\s*"([^"]+)"/ },
        { key: 'has_visual_identity', pattern: /"has_visual_identity"\s*:\s*"([^"]+)"/ },
        { key: 'has_content_templates', pattern: /"has_content_templates"\s*:\s*"([^"]+)"/ },
        { key: 'has_brand_guidelines', pattern: /"has_brand_guidelines"\s*:\s*"([^"]+)"/ },
        { key: 'has_website', pattern: /"has_website"\s*:\s*"([^"]+)"/ },
        { key: 'has_social_media', pattern: /"has_social_media"\s*:\s*"([^"]+)"/ },
        { key: 'has_email_marketing', pattern: /"has_email_marketing"\s*:\s*"([^"]+)"/ },
        { key: 'has_paid_ads', pattern: /"has_paid_ads"\s*:\s*"([^"]+)"/ },
        { key: 'has_analytics', pattern: /"has_analytics"\s*:\s*"([^"]+)"/ },
        { key: 'has_crm', pattern: /"has_crm"\s*:\s*"([^"]+)"/ },
        { key: 'has_automation', pattern: /"has_automation"\s*:\s*"([^"]+)"/ },
        { key: 'has_collaboration_tools', pattern: /"has_collaboration_tools"\s*:\s*"([^"]+)"/ },
        { key: 'has_project_management', pattern: /"has_project_management"\s*:\s*"([^"]+)"/ },
        { key: 'has_financial_tools', pattern: /"has_financial_tools"\s*:\s*"([^"]+)"/ },
        { key: 'has_legal_support', pattern: /"has_legal_support"\s*:\s*"([^"]+)"/ },
        { key: 'has_mentorship', pattern: /"has_mentorship"\s*:\s*"([^"]+)"/ },
        { key: 'has_networking', pattern: /"has_networking"\s*:\s*"([^"]+)"/ },
        { key: 'has_skill_development', pattern: /"has_skill_development"\s*:\s*"([^"]+)"/ },
        { key: 'has_time_management', pattern: /"has_time_management"\s*:\s*"([^"]+)"/ },
        { key: 'has_stress_management', pattern: /"has_stress_management"\s*:\s*"([^"]+)"/ },
        { key: 'has_work_life_balance', pattern: /"has_work_life_balance"\s*:\s*"([^"]+)"/ }
      ] : [
        { key: 'business_name', pattern: /"business_name"\s*:\s*"([^"]+)"/ },
        { key: 'business_description', pattern: /"business_description"\s*:\s*"([^"]+)"/ },
        { key: 'target_audience', pattern: /"target_audience"\s*:\s*"([^"]+)"/ },
        { key: 'competitive_gaps', pattern: /"competitive_gaps"\s*:\s*"([^"]+)"/ },
        { key: 'competitor_profiles', pattern: /"competitor_profiles"\s*:\s*\[([^\]]+)\]/ },
        { key: 'social_media_platforms', pattern: /"social_media_platforms"\s*:\s*\[([^\]]+)\]/ },
        { key: 'content_types', pattern: /"content_types"\s*:\s*\[([^\]]+)\]/ },
        { key: 'marketing_channels', pattern: /"marketing_channels"\s*:\s*\[([^\]]+)\]/ },
        { key: 'business_goals', pattern: /"business_goals"\s*:\s*\[([^\]]+)\]/ },
        { key: 'challenges', pattern: /"challenges"\s*:\s*\[([^\]]+)\]/ },
        { key: 'strengths', pattern: /"strengths"\s*:\s*\[([^\]]+)\]/ },
        { key: 'weaknesses', pattern: /"weaknesses"\s*:\s*\[([^\]]+)\]/ },
        { key: 'opportunities', pattern: /"opportunities"\s*:\s*\[([^\]]+)\]/ },
        { key: 'threats', pattern: /"threats"\s*:\s*\[([^\]]+)\]/ }
      ];
      
      for (const { key, pattern } of patterns) {
        const match = messageContent.match(pattern);
        if (match) {
          if (key.includes('_profiles') || key.includes('_platforms') || key.includes('_types') || 
              key.includes('_channels') || key.includes('_goals') || key.includes('_challenges') ||
              key.includes('_strengths') || key.includes('_weaknesses') || key.includes('_opportunities') ||
              key.includes('_threats')) {
            try {
              extractedData[key] = JSON.parse(`[${match[1]}]`);
            } catch {
              extractedData[key] = match[1];
            }
          } else {
            extractedData[key] = match[1];
          }
        }
      }
      
      if (Object.keys(extractedData).length > 0) {
        return extractedData;
      }
    } catch (error) {
      // Ignore extraction errors
    }
    
    return null;
  }

  convertLegacyUserProfileToComplete(legacyProfile: any): any {
    const completeProfile = {
      personal: {
        name: legacyProfile.name,
        age: legacyProfile.age || legacyProfile.age_range,
        location: legacyProfile.location,
        primary_motivation: legacyProfile.primary_motivation,
        biggest_challenge: legacyProfile.biggest_challenge,
        success_definition: legacyProfile.success_definition,
        core_values: legacyProfile.core_values,
        work_style: legacyProfile.work_style,
        dream_lifestyle: legacyProfile.dream_lifestyle,
        impact_goal: legacyProfile.impact_goal,
        fear: legacyProfile.fear
      },
      business: {
        industry: legacyProfile.industry,
        target_audience: {
          age_range: legacyProfile.age_range,
          gender: legacyProfile.gender,
          income_level: legacyProfile.income_level,
          education_level: legacyProfile.education_level,
          location: legacyProfile.location,
          pain_points: legacyProfile.pain_points,
          goals_aspirations: legacyProfile.goals_aspirations
        },
        competitors: legacyProfile.competitors,
        content_analysis: {
          engaging_aspects: legacyProfile.engaging_aspects,
          visual_style: legacyProfile.visual_style,
          competitive_gaps: legacyProfile.competitive_gaps
        },
        main_offer: legacyProfile.main_offer,
        pricing_strategy: legacyProfile.pricing_strategy
      },
      created_at: legacyProfile.created_at,
      updated_at: legacyProfile.updated_at
    };
    
    const cleanProfile = this.removeNullValues(completeProfile);
    return cleanProfile;
  }

  convertLegacyBusinessDataToComplete(legacyBusinessData: any): any {
    const completeBusinessData = {
      industry: legacyBusinessData.industry,
      age_range: legacyBusinessData.age_range,
      gender: legacyBusinessData.gender,
      income_level: legacyBusinessData.income_level,
      business_name: legacyBusinessData.business_name,
      business_description: legacyBusinessData.business_description,
      target_audience: {
        age_range: legacyBusinessData.age_range,
        gender: legacyBusinessData.gender,
        income_level: legacyBusinessData.income_level,
        education_level: legacyBusinessData.education_level,
        location: legacyBusinessData.location,
        pain_points: legacyBusinessData.pain_points,
        goals_aspirations: legacyBusinessData.goals_aspirations
      },
      competitive_gaps: legacyBusinessData.competitive_gaps,
      competitor_profiles: legacyBusinessData.competitor_profiles,
      social_media_platforms: legacyBusinessData.social_media_platforms,
      content_types: legacyBusinessData.content_types,
      marketing_channels: legacyBusinessData.marketing_channels,
      business_goals: legacyBusinessData.business_goals,
      challenges: legacyBusinessData.challenges,
      strengths: legacyBusinessData.strengths,
      weaknesses: legacyBusinessData.weaknesses,
      opportunities: legacyBusinessData.opportunities,
      threats: legacyBusinessData.threats
    };
    
    const cleanBusinessData = this.removeNullValues(completeBusinessData);
    return cleanBusinessData;
  }

  removeNullValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    
    if (Array.isArray(obj)) {
      return obj.filter(item => item !== null && item !== undefined).map(item => this.removeNullValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.removeNullValues(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
    
    return obj;
  }

  splitDataIntoChunks(data: any, dataType: 'user_profile' | 'business_data'): any[] {
    const maxChunkSize = 800;
    const dataString = JSON.stringify(data);
    
    if (dataString.length <= maxChunkSize) {
      return [data];
    }
    
    const chunks: any[] = [];
    
    if (dataType === 'user_profile') {
      if (data.personal) {
        chunks.push({ personal: data.personal });
      }
      if (data.business) {
        const businessChunks = this.splitObjectIntoChunks(data.business, 'business');
        businessChunks.forEach(chunk => {
          chunks.push({ business: chunk });
        });
      }
    } else if (dataType === 'business_data') {
      const businessChunks = this.splitObjectIntoChunks(data, 'business_data');
      chunks.push(...businessChunks);
    }
    
    return chunks;
  }

  splitObjectIntoChunks(obj: any, prefix: string): any[] {
    const chunks: any[] = [];
    const keys = Object.keys(obj);
    
    const totalSize = JSON.stringify(obj).length;
    const estimatedChunks = Math.ceil(totalSize / 800);
    const maxKeysPerChunk = Math.max(1, Math.ceil(keys.length / estimatedChunks));
    
    for (let i = 0; i < keys.length; i += maxKeysPerChunk) {
      const chunkKeys = keys.slice(i, i + maxKeysPerChunk);
      const chunk: any = {};
      
      chunkKeys.forEach(key => {
        chunk[key] = obj[key];
      });
      
      const chunkSize = JSON.stringify(chunk).length;
      if (chunkSize > 800) {
        const subChunks = this.splitObjectIntoChunks(chunk, `${prefix}_sub`);
        chunks.push(...subChunks);
      } else {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  reconstructChunkedData(messages: any[], dataType: 'user_profile' | 'business_data'): any | null {
    const relevantMessages = messages.filter(msg => {
      try {
        const parsed = JSON.parse(msg.message);
        return parsed.type === dataType;
      } catch {
        return false;
      }
    });
    
    if (relevantMessages.length === 0) {
      return null;
    }
    
    const chunkedMessages = relevantMessages.filter(msg => {
      try {
        const parsed = JSON.parse(msg.message);
        return parsed.chunkIndex !== undefined;
      } catch {
        return false;
      }
    });
    
    const nonChunkedMessages = relevantMessages.filter(msg => {
      try {
        const parsed = JSON.parse(msg.message);
        return parsed.chunkIndex === undefined;
      } catch {
        return false;
      }
    });
    
    if (chunkedMessages.length > 0) {
      chunkedMessages.sort((a, b) => {
        try {
          const parsedA = JSON.parse(a.message);
          const parsedB = JSON.parse(b.message);
          return (parsedA.chunkIndex || 0) - (parsedB.chunkIndex || 0);
        } catch {
          return 0;
        }
      });
      
      const reconstructedData: any = {};
      
      chunkedMessages.forEach(msg => {
        try {
          const parsed = JSON.parse(msg.message);
          if (parsed.data) {
            Object.assign(reconstructedData, parsed.data);
          }
        } catch (error) {
          // Ignore parsing errors
        }
      });
      
      return Object.keys(reconstructedData).length > 0 ? reconstructedData : null;
    }
    
    if (nonChunkedMessages.length > 0) {
      const messagesWithCompleteness = nonChunkedMessages.map(msg => {
        try {
          const parsed = JSON.parse(msg.message);
          const data = parsed.data || {};
          const fieldCount = Object.keys(data).length;
          const hasComplexFields = data.competitor_profiles || data.pain_points || data.goals_aspirations;
          
          return {
            message: msg,
            parsed,
            fieldCount,
            hasComplexFields: !!hasComplexFields,
            timestamp: new Date(parsed.timestamp).getTime()
          };
        } catch {
          return { message: msg, fieldCount: 0, hasComplexFields: false, timestamp: 0 };
        }
      });
      
      messagesWithCompleteness.sort((a, b) => {
        if (a.hasComplexFields && !b.hasComplexFields) return -1;
        if (!a.hasComplexFields && b.hasComplexFields) return 1;
        if (a.fieldCount !== b.fieldCount) return b.fieldCount - a.fieldCount;
        return b.timestamp - a.timestamp;
      });
      
      const bestMessage = messagesWithCompleteness[0];
      try {
        return bestMessage.parsed.data || null;
      } catch (error) {
        return null;
      }
    }
    
    return null;
  }
}