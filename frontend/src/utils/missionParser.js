/**
 * Utility functions for parsing and formatting mission descriptions
 */

/**
 * Parses a mission description from AI format to a more user-friendly display
 * @param {string} description - Raw description from AI
 * @returns {object} Parsed mission data with structured sections
 */
export const parseMissionDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return {
      explanation: '',
      actionSteps: [],
      importance: '',
      expectedImpact: '',
      timeline: '',
      confidenceLevel: null,
      originalText: description || ''
    }
  }

  // Initialize result object
  const result = {
    explanation: '',
    actionSteps: [],
    importance: '',
    expectedImpact: '',
    timeline: '',
    confidenceLevel: null,
    originalText: description
  }

  try {
    // Clean text and extract sections using regex patterns
    let cleanText = description.replace(/\*\*/g, '').trim()
    
    // Extract explanation
    const explanationMatch = cleanText.match(/- Explanation:\s*([^-]+?)(?=\s*- |$)/i)
    if (explanationMatch) {
      result.explanation = explanationMatch[1].trim()
    }
    
    // Extract action steps
    const actionMatch = cleanText.match(/- Action Steps:\s*((?:- [^-]+?)*?)(?=\s*- [A-Z]|$)/i)
    if (actionMatch) {
      const stepText = actionMatch[1].trim()
      const steps = stepText
        .split(/- /)
        .filter(step => step.trim())
        .map(step => step.trim().replace(/\.$/, ''))
      result.actionSteps = steps
    }
    
    // Extract importance
    const importanceMatch = cleanText.match(/- Why It's Important:\s*([^-]+?)(?=\s*- |$)/i)
    if (importanceMatch) {
      result.importance = importanceMatch[1].trim()
    }
    
    // Extract expected impact
    const impactMatch = cleanText.match(/- Expected Impact:\s*([^-]+?)(?=\s*- |$)/i)
    if (impactMatch) {
      result.expectedImpact = impactMatch[1].trim()
    }
    
    // Extract timeline
    const timelineMatch = cleanText.match(/- Timeline:\s*([^-]+?)(?=\s*- |$)/i)
    if (timelineMatch) {
      result.timeline = timelineMatch[1].trim()
    }
    
    // Extract confidence level
    const confidenceMatch = cleanText.match(/- Confidence Level:\s*(\d+)/i)
    if (confidenceMatch) {
      result.confidenceLevel = parseInt(confidenceMatch[1])
    }

    return result
  } catch (error) {
    console.error('Error parsing mission description:', error)
    return {
      explanation: description,
      actionSteps: [],
      importance: '',
      expectedImpact: '',
      timeline: '',
      confidenceLevel: null,
      originalText: description
    }
  }
}

/**
 * Formats confidence level as a percentage with color coding
 * @param {number} confidence - Confidence level (0-100)
 * @returns {object} Color class and formatted text
 */
export const formatConfidenceLevel = (confidence) => {
  if (!confidence || confidence < 0 || confidence > 100) {
    return { color: 'text-gray-500', text: 'Unknown', bgColor: 'bg-gray-100' }
  }

  if (confidence >= 90) {
    return { color: 'text-green-700', text: `${confidence}% Confidence`, bgColor: 'bg-green-100' }
  } else if (confidence >= 70) {
    return { color: 'text-yellow-700', text: `${confidence}% Confidence`, bgColor: 'bg-yellow-100' }
  } else {
    return { color: 'text-red-700', text: `${confidence}% Confidence`, bgColor: 'bg-red-100' }
  }
}

/**
 * Extracts the main action from action steps for quick preview
 * @param {string[]} actionSteps - Array of action steps
 * @returns {string} Main action summary
 */
export const getMainAction = (actionSteps) => {
  if (!actionSteps || actionSteps.length === 0) return ''
  
  // Return first action step as main action
  return actionSteps[0]
}