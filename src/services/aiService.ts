interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  message: string;
  translation?: string;
}

interface ElevenLabsConversationResponse {
  audio: string;
  text: string;
  conversation_id: string;
}

class AIService {
  private conversationHistory: Map<string, string> = new Map();
  private readonly proxyUrl = 'undefined';
  private readonly accessToken = import.meta.env.VITE_PROXY_SERVER_ACCESS_TOKEN || 'undefined';
  private readonly elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  private readonly agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

  private async makeElevenLabsCall(message: string, conversationId?: string): Promise<ElevenLabsConversationResponse> {
    console.log('Making ElevenLabs call with:', { message, conversationId, agentId: this.agentId });
    
    try {
      const requestBody: any = {
        agent_id: this.agentId,
        text: message
      };

      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      console.log('ElevenLabs request body:', requestBody);

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          url: `https://api.elevenlabs.io/v1/convai/conversation`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.elevenLabsApiKey
          },
          body: requestBody
        })
      });

      console.log('ElevenLabs response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error(`ElevenLabs API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('ElevenLabs response data:', data);

      return {
        audio: data.audio || '',
        text: data.text || data.message || data.response || '',
        conversation_id: data.conversation_id || conversationId || ''
      };
    } catch (error) {
      console.error('ElevenLabs API call failed:', error);
      throw error;
    }
  }

  private getConversationKey(language: string, scenario?: string): string {
    return `${language}-${scenario || 'free'}`;
  }

  private buildSystemPrompt(language: string, scenario?: string): string {
    let prompt = `You are a helpful language learning partner. IMPORTANT: You must respond ONLY in ${language}, never in English or any other language.`;

    if (scenario) {
      const scenarioPrompts: Record<string, string> = {
        'Restaurant Order': `You are a ${language}-speaking waiter in a restaurant. Respond ONLY in ${language}. Greet customers, take orders, make recommendations, and ask about drinks and food preferences.`,
        'Hotel Check-in': `You are a ${language}-speaking hotel receptionist. Respond ONLY in ${language}. Help with check-in, explain amenities, and answer questions about the hotel.`,
        'Shopping': `You are a ${language}-speaking shop assistant. Respond ONLY in ${language}. Help customers find products, explain prices, and suggest items.`,
        'Airport': `You are a ${language}-speaking airport staff member. Respond ONLY in ${language}. Help with check-in, boarding, and airport navigation.`,
        'Doctor Visit': `You are a ${language}-speaking medical professional. Respond ONLY in ${language}. Ask about symptoms and provide basic health advice.`,
        'Job Interview': `You are a ${language}-speaking hiring manager. Respond ONLY in ${language}. Conduct a professional job interview.`
      };

      prompt = scenarioPrompts[scenario] || prompt;
    }

    prompt += ` Keep responses natural, conversational, and appropriate for language learners. Ask follow-up questions to continue the conversation.`;
    
    return prompt;
  }

  async generateResponse(
    userMessage: string,
    language: string,
    scenario?: string
  ): Promise<AIResponse> {
    console.log('Generating response for:', { userMessage, language, scenario });
    
    const conversationKey = this.getConversationKey(language, scenario);
    
    try {
      let conversationId = this.conversationHistory.get(conversationKey);
      
      // Build the message with system context for new conversations
      let messageToSend = userMessage;
      if (!conversationId) {
        const systemPrompt = this.buildSystemPrompt(language, scenario);
        messageToSend = `${systemPrompt}\n\nUser message: ${userMessage}`;
        console.log('New conversation, system prompt:', systemPrompt);
      }

      const elevenLabsResponse = await this.makeElevenLabsCall(messageToSend, conversationId);
      
      if (elevenLabsResponse.conversation_id) {
        this.conversationHistory.set(conversationKey, elevenLabsResponse.conversation_id);
        console.log('Stored conversation ID:', elevenLabsResponse.conversation_id);
      }

      // Simple translation fallback
      const translation = this.getSimpleTranslation(elevenLabsResponse.text, language);

      return {
        message: elevenLabsResponse.text,
        translation
      };
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      
      // Use fallback responses as last resort
      return this.getFallbackResponse(language, scenario);
    }
  }

  private getSimpleTranslation(text: string, language: string): string {
    // Basic translation hints for common phrases
    const translations: Record<string, Record<string, string>> = {
      Spanish: {
        'Hola': 'Hello',
        'Gracias': 'Thank you',
        '¿Cómo está?': 'How are you?',
        'Bienvenido': 'Welcome',
        '¿En qué puedo ayudarle?': 'How can I help you?'
      },
      French: {
        'Bonjour': 'Hello',
        'Merci': 'Thank you',
        'Comment allez-vous?': 'How are you?',
        'Bienvenue': 'Welcome',
        'Comment puis-je vous aider?': 'How can I help you?'
      },
      German: {
        'Hallo': 'Hello',
        'Danke': 'Thank you',
        'Wie geht es Ihnen?': 'How are you?',
        'Willkommen': 'Welcome',
        'Wie kann ich Ihnen helfen?': 'How can I help you?'
      }
    };

    const langTranslations = translations[language];
    if (langTranslations) {
      for (const [foreign, english] of Object.entries(langTranslations)) {
        if (text.includes(foreign)) {
          return `Contains: "${foreign}" = "${english}"`;
        }
      }
    }

    return `Response in ${language} - translation not available`;
  }

  private getFallbackResponse(language: string, scenario?: string): AIResponse {
    console.log('Using fallback response for:', { language, scenario });
    
    const fallbackResponses: Record<string, Array<{ text: string; translation: string }>> = {
      Spanish: [
        { text: "¡Hola! ¿En qué puedo ayudarle hoy?", translation: "Hello! How can I help you today?" },
        { text: "Entiendo. ¿Puede contarme más sobre eso?", translation: "I understand. Can you tell me more about that?" },
        { text: "¡Qué interesante! ¿Qué opina usted?", translation: "How interesting! What do you think?" }
      ],
      French: [
        { text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", translation: "Hello! How can I help you today?" },
        { text: "Je comprends. Pouvez-vous m'en dire plus ?", translation: "I understand. Can you tell me more?" },
        { text: "C'est intéressant ! Qu'en pensez-vous ?", translation: "That's interesting! What do you think?" }
      ],
      German: [
        { text: "Hallo! Wie kann ich Ihnen heute helfen?", translation: "Hello! How can I help you today?" },
        { text: "Ich verstehe. Können Sie mir mehr darüber erzählen?", translation: "I understand. Can you tell me more about that?" },
        { text: "Das ist interessant! Was denken Sie?", translation: "That's interesting! What do you think?" }
      ],
      Italian: [
        { text: "Ciao! Come posso aiutarla oggi?", translation: "Hello! How can I help you today?" },
        { text: "Capisco. Può dirmi di più?", translation: "I understand. Can you tell me more?" },
        { text: "Interessante! Cosa ne pensa?", translation: "Interesting! What do you think?" }
      ],
      Portuguese: [
        { text: "Olá! Como posso ajudá-lo hoje?", translation: "Hello! How can I help you today?" },
        { text: "Entendo. Pode me contar mais sobre isso?", translation: "I understand. Can you tell me more about that?" },
        { text: "Interessante! O que você acha?", translation: "Interesting! What do you think?" }
      ],
      Japanese: [
        { text: "こんにちは！今日はどのようにお手伝いできますか？", translation: "Hello! How can I help you today?" },
        { text: "わかります。もう少し教えていただけますか？", translation: "I understand. Can you tell me more?" },
        { text: "面白いですね！どう思いますか？", translation: "That's interesting! What do you think?" }
      ]
    };

    // Scenario-specific fallbacks
    if (scenario === 'Restaurant Order') {
      const restaurantFallbacks: Record<string, Array<{ text: string; translation: string }>> = {
        Spanish: [
          { text: "¡Bienvenido a nuestro restaurante! ¿Qué le gustaría beber?", translation: "Welcome to our restaurant! What would you like to drink?" },
          { text: "Excelente elección. ¿Desea algún entrante?", translation: "Excellent choice. Would you like any appetizers?" }
        ],
        French: [
          { text: "Bienvenue dans notre restaurant ! Que souhaitez-vous boire ?", translation: "Welcome to our restaurant! What would you like to drink?" },
          { text: "Excellent choix. Désirez-vous une entrée ?", translation: "Excellent choice. Would you like an appetizer?" }
        ],
        German: [
          { text: "Willkommen in unserem Restaurant! Was möchten Sie trinken?", translation: "Welcome to our restaurant! What would you like to drink?" },
          { text: "Ausgezeichnete Wahl. Möchten Sie eine Vorspeise?", translation: "Excellent choice. Would you like an appetizer?" }
        ]
      };

      const restaurantResponses = restaurantFallbacks[language];
      if (restaurantResponses) {
        const randomResponse = restaurantResponses[Math.floor(Math.random() * restaurantResponses.length)];
        return {
          message: randomResponse.text,
          translation: randomResponse.translation
        };
      }
    }

    const responses = fallbackResponses[language] || fallbackResponses.Spanish;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse.text,
      translation: randomResponse.translation
    };
  }

  clearConversation(language: string, scenario?: string): void {
    const conversationKey = this.getConversationKey(language, scenario);
    this.conversationHistory.delete(conversationKey);
    console.log('Cleared conversation for:', conversationKey);
  }
}

export const aiService = new AIService();
