import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Volume2, MessageCircle, Lightbulb, Mic, X } from 'lucide-react';
import { Scenario, Language } from '../types';
import { TextHighlighter } from './TextHighlighter';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getLanguageCode } from '../utils/languageMapping';

interface ConversationModeProps {
  scenario: Scenario;
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

export const ConversationMode: React.FC<ConversationModeProps> = ({ scenario, language, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showTranslations, setShowTranslations] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speechLang = getLanguageCode(language.code);
  const speechRecognition = useSpeechRecognition(speechLang);
  const speechSynthesis = useSpeechSynthesis();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with a welcome message
    addMessage(
      getWelcomeMessage(),
      false,
      "Welcome! This conversation mode is ready for external API integration. You can practice typing and using voice features."
    );
  }, []);

  // Handle speech recognition transcript
  useEffect(() => {
    if (speechRecognition.transcript && voiceInputEnabled) {
      setInputText(speechRecognition.transcript);
    }
  }, [speechRecognition.transcript, voiceInputEnabled]);

  const getWelcomeMessage = () => {
    const welcomeMessages: Record<string, string> = {
      es: "¡Bienvenido! Este modo está listo para integración con API externa.",
      fr: "Bienvenue ! Ce mode est prêt pour l'intégration d'API externe.",
      de: "Willkommen! Dieser Modus ist bereit für externe API-Integration.",
      it: "Benvenuto! Questa modalità è pronta per l'integrazione API esterna.",
      pt: "Bem-vindo! Este modo está pronto para integração de API externa.",
      ja: "いらっしゃいませ！このモードは外部API統合の準備ができています。",
      ko: "환영합니다! 이 모드는 외부 API 통합을 위해 준비되었습니다.",
      zh: "欢迎！此模式已准备好进行外部API集成。",
      ru: "Добро пожаловать! Этот режим готов для интеграции внешнего API.",
      ar: "مرحباً! هذا الوضع جاهز لتكامل API الخارجي."
    };
    
    return welcomeMessages[language.code] || "Welcome! This conversation mode is ready for external API integration.";
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

    // Simulate a response - replace this with your API integration
    setTimeout(() => {
      const echoResponse = `Echo: ${userMessage}`;
      addMessage(echoResponse, false, `This is an echo response. Replace with your API integration.`);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    setVoiceInputEnabled(!voiceInputEnabled);
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    }
  };

  const toggleListening = () => {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    } else {
      speechRecognition.startListening();
    }
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
              <h1 className="text-xl font-medium text-gray-900">{scenario.title}</h1>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500">{language.flag} {language.name} Practice</p>
                <div className="flex items-center text-xs text-blue-500">
                  <div className="w-2 h-2 rounded-full mr-1 bg-blue-500"></div>
                  Ready for API Integration
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                voiceOutputEnabled 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Voice Output {voiceOutputEnabled ? 'On' : 'Off'}
            </button>
            
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                showTranslations 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Lightbulb className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{showTranslations ? 'Hide' : 'Show'} Translations</span>
            </button>
          </div>
        </div>
      </div>

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
                        language={language}
                        context={scenario.title}
                        className="font-light text-gray-900"
                      />
                      {showTranslations && message.translation && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm italic text-gray-600">
                            {message.translation}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={`text-xs ${
                      message.isUser ? 'text-gray-300' : 'text-gray-400'
                    }`}>
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
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input with Voice Controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message in ${language.name}...`}
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
            
            {/* Voice Input Toggle */}
            <button
              onClick={toggleVoiceInput}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                voiceInputEnabled
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={voiceInputEnabled ? 'Disable voice input' : 'Enable voice input'}
            >
              {voiceInputEnabled ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Recording Button - Only show when voice input is enabled */}
            {voiceInputEnabled && speechRecognition.isSupported && (
              <button
                onClick={toggleListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  speechRecognition.isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title={speechRecognition.isListening ? 'Stop recording' : 'Start recording'}
              >
                {speechRecognition.isListening ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                    <Mic className="w-5 h-5" />
                  </div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
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
