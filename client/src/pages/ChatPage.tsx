// Updated ChatPage.tsx with mobile fixes
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  language: string;
  isVoice?: boolean;
}


const generateStreamingResponse = async (
  id: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  onEnd: () => void
) => {
  try {
    const response = await fetch(`/api/chat_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        message: userMessage,
        id: id || "unknown_user",
      }),
      credentials: "include",
    });

    if (!response.ok || !response.body) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (buffer.includes("\n\n")) {
        const eventEndIndex = buffer.indexOf("\n\n");
        const eventData = buffer.substring(0, eventEndIndex);
        buffer = buffer.substring(eventEndIndex + 2);

        const cleanedData = eventData.replace(/^data: /, "").trim();
        if (cleanedData) onChunk(cleanedData);
      }
    }

    if (buffer.trim()) {
      onChunk(buffer.trim());
    }
  } catch (error) {
    console.error("Streaming failed:", error);
    onChunk(`Sorry, an error occurred. ${(error as Error).message}`);
  } finally {
    onEnd();
  }
};


export const ChatPage: React.FC = () => {
  const { currentLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chat.welcome', { language: currentLanguage.nativeName }),
      sender: 'assistant',
      timestamp: new Date(),
      language: currentLanguage.code
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date(),
      language: currentLanguage.code
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      text: '',
      sender: 'assistant',
      timestamp: new Date(),
      language: currentLanguage.code
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    await generateStreamingResponse(
      user?.id || 'anonymous_user',
      trimmedInput,
      (chunk: string) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, text: msg.text + chunk }
              : msg
          )
        );
      },
      () => {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputText(t('chat.recording.sampleText'));
      }, 3000);
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{t('chat.header.title')}</h1>
              <p className="text-sm text-gray-500">{t('chat.header.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
              {currentLanguage.flag} {currentLanguage.nativeName}
            </span>
            <button
              onClick={toggleSpeaking}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 max-w-[85vw] ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-gray-100 px-1 rounded font-mono" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-gray-800 text-white p-2 rounded overflow-x-auto my-2" {...props} />
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>

                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {message.isVoice && ` • ${t('chat.voiceMessageLabel')}`}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && messages[messages.length - 1]?.sender === 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.input.placeholder', { language: currentLanguage.nativeName })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center justify-center space-x-2 text-red-600"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              <span className="text-sm font-medium">{t('chat.recording.label')}</span>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </motion.div>
          )}
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              {t('chat.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};