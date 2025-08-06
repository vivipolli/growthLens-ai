/**
 * Chat Message Parser
 * Handles parsing and formatting of AI responses from the backend
 */

export class ChatParser {
    /**
     * Parse AI response and extract structured content
     * @param {string} aiResponse - Raw AI response from backend
     * @returns {Object} Parsed response with sections
     */
    static parseAIResponse(aiResponse) {
        if (!aiResponse) return { text: '', sections: [] };

        const sections = [];
        let currentSection = { type: 'text', content: '', title: '' };
        const lines = aiResponse.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;

            // Check for headers (### or ##)
            if (line.startsWith('### ')) {
                // Save previous section if exists
                if (currentSection.content.trim()) {
                    sections.push({ ...currentSection });
                }
                
                // Start new section
                currentSection = {
                    type: 'section',
                    title: line.replace('### ', ''),
                    content: '',
                    level: 3
                };
            } else if (line.startsWith('## ')) {
                // Save previous section if exists
                if (currentSection.content.trim()) {
                    sections.push({ ...currentSection });
                }
                
                // Start new section
                currentSection = {
                    type: 'section',
                    title: line.replace('## ', ''),
                    content: '',
                    level: 2
                };
            } else if (line.startsWith('**') && line.endsWith('**')) {
                // Bold text - might be a subsection
                if (currentSection.type === 'text') {
                    currentSection.content += `<strong>${line.slice(2, -2)}</strong>\n`;
                } else {
                    currentSection.content += line + '\n';
                }
            } else if (line.match(/^\d+\.\s/)) {
                // Numbered list item
                if (currentSection.type === 'text') {
                    currentSection.content += line + '\n';
                } else {
                    currentSection.content += line + '\n';
                }
            } else if (line.startsWith('- ')) {
                // Bullet list item
                if (currentSection.type === 'text') {
                    currentSection.content += line + '\n';
                } else {
                    currentSection.content += line + '\n';
                }
            } else {
                // Regular text
                currentSection.content += line + '\n';
            }
        }

        // Add the last section
        if (currentSection.content.trim()) {
            sections.push({ ...currentSection });
        }

        return {
            text: aiResponse,
            sections: sections
        };
    }

    /**
     * Format message for display
     * @param {string} message - Raw message
     * @returns {string} Formatted message with HTML
     */
    static formatMessage(message) {
        if (!message) return '';

        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Extract actionable items from AI response
     * @param {string} aiResponse - Raw AI response
     * @returns {Array} Array of actionable items
     */
    static extractActionableItems(aiResponse) {
        if (!aiResponse) return [];

        const items = [];
        const lines = aiResponse.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            
            // Look for mission patterns
            if (trimmed.match(/^-\s*\*\*Mission\s+\d+\*\*:/)) {
                const mission = trimmed.replace(/^-\s*\*\*Mission\s+\d+\*\*:\s*/, '');
                items.push({ type: 'mission', content: mission });
            }
            // Look for numbered steps
            else if (trimmed.match(/^\d+\.\s/)) {
                const step = trimmed.replace(/^\d+\.\s/, '');
                items.push({ type: 'step', content: step });
            }
            // Look for bullet points
            else if (trimmed.match(/^-\s/)) {
                const item = trimmed.replace(/^-\s/, '');
                items.push({ type: 'item', content: item });
            }
        }

        return items;
    }

    /**
     * Check if response contains specific content types
     * @param {string} aiResponse - Raw AI response
     * @returns {Object} Content type flags
     */
    static getContentTypes(aiResponse) {
        if (!aiResponse) return {};

        const lowerResponse = aiResponse.toLowerCase();
        
        return {
            hasMissions: lowerResponse.includes('mission'),
            hasSteps: lowerResponse.includes('step') || /\d+\./.test(aiResponse),
            hasTips: lowerResponse.includes('tip') || lowerResponse.includes('advice'),
            hasInsights: lowerResponse.includes('insight'),
            hasNextSteps: lowerResponse.includes('next step'),
            hasCode: lowerResponse.includes('```') || lowerResponse.includes('`'),
            hasLinks: /https?:\/\/[^\s]+/.test(aiResponse)
        };
    }
}

export default ChatParser; 