import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Volume2, RotateCcw, MessageCircle, Lightbulb, Globe } from 'lucide-react';
import { Language } from '../types';
import { languages } from '../data/languages';
import { TextHighlighter } from './TextHighlighter';
import { VoiceControls } from './VoiceControls';
import { Avatar } from './Avatar';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getLanguageCode } from '../utils/languageMapping';
import { aiService } from '../services/aiService';

interface FreeConversationModeProps {
  language: Language;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  translation?: string;
}

export const FreeConversationMode: React.FC<FreeConversationModeProps> = ({ language: initialLanguage, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speechLang = getLanguageCode(selectedLanguage.code);
  const speechRecognition = useSpeechRecognition(speechLang);
  const speechSynthesis = useSpeechSynthesis();

  const isVoiceEnabled = voiceInputEnabled || voiceOutputEnabled;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start with an AI greeting when language changes
    initializeConversation();
  }, [selectedLanguage]);

  // Handle speech recognition transcript
  useEffect(() => {
    if (speechRecognition.transcript && voiceInputEnabled) {
      setInputText(speechRecognition.transcript);
    }
  }, [speechRecognition.transcript, voiceInputEnabled]);

  const initializeConversation = async () => {
    setMessages([]);
    
    try {
      const greeting = await aiService.generateResponse(
        `Start a friendly conversation in ${selectedLanguage.name}. Introduce yourself as a conversation partner and ask what the user would like to talk about.`,
        selectedLanguage.name
      );
      
      addMessage(greeting.message, false, greeting.translation);
    } catch (error) {
      // Fallback greeting
      const fallbackGreeting = getFallbackGreeting();
      addMessage(fallbackGreeting.text, false, fallbackGreeting.translation);
    }
  };

  const getFallbackGreeting = () => {
    const greetings: Record<string, { text: string; translation: string }> = {
      es: { 
        text: "¡Hola! Soy tu compañero de conversación en español. ¿De qué te gustaría hablar hoy?", 
        translation: "Hello! I'm your Spanish conversation partner. What would you like to talk about today?" 
      },
      fr: { 
        text: "Bonjour ! Je suis votre partenaire de conversation en français. De quoi aimeriez-vous parler aujourd'hui ?", 
        translation: "Hello! I'm your French conversation partner. What would you like to talk about today?" 
      },
      de: { 
        text: "Hallo! Ich bin Ihr Gesprächspartner auf Deutsch. Worüber möchten Sie heute sprechen?", 
        translation: "Hello! I'm your German conversation partner. What would you like to talk about today?" 
      },
      it: { 
        text: "Ciao! Sono il tuo partner di conversazione in italiano. Di cosa vorresti parlare oggi?", 
        translation: "Hello! I'm your Italian conversation partner. What would you like to talk about today?" 
      },
      pt: { 
        text: "Olá! Sou seu parceiro de conversa em português. Sobre o que gostaria de falar hoje?", 
        translation: "Hello! I'm your Portuguese conversation partner. What would you like to talk about today?" 
      },
      ja: { 
        text: "こんにちは！日本語の会話パートナーです。今日は何についてお話ししたいですか？", 
        translation: "Hello! I'm your Japanese conversation partner. What would you like to talk about today?" 
      }
    };
    
    return greetings[selectedLanguage.code] || { 
      text: "Hello! I'm your conversation partner. What would you like to talk about today?", 
      translation: "Hello! I'm your conversation partner. What would you like to talk about today?" 
    };
  };

  const addMessage = (text: string, isUser: boolean, translation?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      translation
    };
    setMessages(prev => [...prev, newMessage]);

    // Speak AI messages if voice output is enabled
    if (!isUser && voiceOutputEnabled && speechSynthesis.isSupported) {
      setTimeout(() => {
        speechSynthesis.speak(text, speechLang);
      }, 500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, true);
    setInputText('');
    speechRecognition.resetTranscript();
    setIsTyping(true);

    try {
      const aiResponse = await aiService.generateResponse(
        userMessage,
        selectedLanguage.name
      );
      
      addMessage(aiResponse.message, false, aiResponse.translation);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      // Show error message
      addMessage(
        "I'm sorry, I'm having trouble responding right now. Please try again.",
        false,
        "I'm sorry, I'm having trouble responding right now. Please try again."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    aiService.clearConversation(selectedLanguage.name);
    initializeConversation();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-medium text-gray-900">Free Conversation</h1>
              <p className="text-sm text-gray-500">{selectedLanguage.flag} {selectedLanguage.name} Practice</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={selectedLanguage.code}
                onChange={(e) => {
                  const newLang = languages.find(l => l.code === e.target.value) || selectedLanguage;
                  setSelectedLanguage(newLang);
                }}
                className="appearance-none bg-gray-100 text-gray-700 px-4 py-2 pr-8 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors focus:outline-none"
              >
                {languages.slice(1).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <VoiceControls
              isListening={speechRecognition.isListening}
              isSpeaking={speechSynthesis.isSpeaking}
              voiceInputEnabled={voiceInputEnabled}
              voiceOutputEnabled={voiceOutputEnabled}
              onToggleVoiceInput={() => setVoiceInputEnabled(!voiceInputEnabled)}
              onToggleVoiceOutput={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              onStartListening={speechRecognition.startListening}
              onStopListening={speechRecognition.stopListening}
              onStopSpeaking={speechSynthesis.stop}
              isSupported={speechRecognition.isSupported && speechSynthesis.isSupported}
            />
            
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                showTranslations 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              {showTranslations ? 'Hide' : 'Show'} Translations
            </button>
            <button
              onClick={resetConversation}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Section - Only shows when voice is enabled */}
      {isVoiceEnabled && (
        <div className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-4xl mx-auto px-6">
            <Avatar
              isListening={speechRecognition.isListening}
              isSpeaking={speechSynthesis.isSpeaking}
              voiceEnabled={isVoiceEnabled}
              className="mb-4"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {message.isUser ? (
                    <p className="font-light">{message.text}</p>
                  ) : (
                    <>
                      <TextHighlighter
                        text={message.text}
                        language={selectedLanguage}
                        context="Free Conversation"
                        className="font-light text-gray-900"
                      />
                      {showTranslations && message.translation && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 italic">
                            {message.translation}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={`text-xs ${message.isUser ? 'text-gray-300' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!message.isUser && (
                      <button 
                        onClick={() => speechSynthesis.speak(message.text, speechLang)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-6 py-4 bg-white border border-gray-200 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message in ${selectedLanguage.name}...`}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400 transition-colors resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {voiceInputEnabled && speechRecognition.isListening && (
                <div className="absolute top-2 right-2 flex items-center text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-xs">Listening...</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
