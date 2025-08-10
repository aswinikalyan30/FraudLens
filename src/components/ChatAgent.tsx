import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  message: string;
  timestamp: Date;
}

interface ChatAgentProps {
  applicationId: string;
}

const ChatAgent: React.FC<ChatAgentProps> = ({ applicationId }) => {
  const { isDark } = useTheme();
  const isHomePage = applicationId === 'home';
  
  const initialMessage = isHomePage 
    ? 'Hello! I\'m your AI assistant. I can help with fraud detection insights, system navigation, and answer questions about the application process. How can I help you today?'
    : 'Hello! I\'m your AI assistant. I can help explain why this application was flagged, provide additional context, or assist with document requests. What would you like to know?';
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      message: initialMessage,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const homeResponses = {
        'how does risk scoring work': 'Our fraud risk scoring system analyzes multiple factors: document authenticity (30%), behavioral patterns (25%), identity verification (25%), and application consistency (20%). Scores above 80 are auto-flagged for review, while scores 60-80 receive targeted verification checks.',
        'system navigation': 'The main navigation sections are: Home (dashboard overview), Queue (pending applications), Processed (completed reviews), and Settings. You can also use the quick filters at the top to sort by risk level, or search by applicant name or ID in the search bar.',
        'fraud detection': 'Look for inconsistent application details, unusually quick form completion times, and patterns across multiple applications. Compare suspicious applications side by side using the "Compare" tool in the review panel. Always verify documentation through official channels.',
        'statistics': 'Currently there are 12 applications in total: 10 in the pending queue and 2 processed. The average risk score is 38, and the approval rate is 50%. Today, 2 applications have been processed, with 1 escalation reported.',
        'default': 'I can help with understanding risk factors, navigating the system, or providing insights about fraud detection patterns. What specific information are you looking for today?'
      };
      
      const caseResponses = {
        'why was this flagged': 'This application was flagged due to multiple risk indicators: essay similarity (96% match with known fraudulent content), recently created email account (5 days old), and rapid submission pattern (completed in under 2 minutes).',
        'request document': 'I can help you request additional documents. Based on the risk factors, I recommend requesting: government-issued ID, proof of enrollment verification, and updated financial documentation. Would you like me to prepare the email template?',
        'risk score': 'The risk score of 95 is calculated based on weighted factors: Essay similarity (40 points), Email age verification (25 points), Rapid submission pattern (20 points), and behavioral analysis (10 points).',
        'similar cases': 'I found 3 similar cases in the past 6 months with comparable patterns. 2 were confirmed fraud, 1 was a false positive after document verification.',
        'default': 'I can help explain the risk factors, assist with document requests, provide similar case analysis, or answer questions about the fraud detection process. What specific aspect would you like to explore?'
      };
      
      // Select appropriate responses based on context
      const responses = isHomePage ? homeResponses : caseResponses;

      const lowerMessage = inputMessage.toLowerCase();
      let response = responses.default;

      Object.keys(responses).forEach(key => {
        if (lowerMessage.includes(key)) {
          response = responses[key as keyof typeof responses];
        }
      });

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`h-full flex flex-col ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Assistant
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className={`p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Quick Actions:
        </p>
        <div className="flex flex-wrap gap-2">
          {(isHomePage ? [
            'How does risk scoring work?',
            'Show application statistics',
            'Tips for fraud detection',
            'System navigation help'
          ] : [
            'Why was this flagged?',
            'Request documents',
            'Show similar cases',
            'Explain risk score'
          ]).map((question, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputMessage('');
                // Send immediately
                const userMessage = {
                  id: Date.now().toString(),
                  type: 'user' as const,
                  message: question,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, userMessage]);
                setIsTyping(true);
                // Simulate AI response
                setTimeout(() => {
                  const homeResponses = {
                    'how does risk scoring work': 'Our fraud risk scoring system analyzes multiple factors: document authenticity (30%), behavioral patterns (25%), identity verification (25%), and application consistency (20%). Scores above 80 are auto-flagged for review, while scores 60-80 receive targeted verification checks.',
                    'system navigation help': 'The main navigation sections are: Home (dashboard overview), Queue (pending applications), Processed (completed reviews), and Settings. You can also use the quick filters at the top to sort by risk level, or search by applicant name or ID in the search bar.',
                    'tips for fraud detection': 'Look for inconsistent application details, unusually quick form completion times, and patterns across multiple applications. Compare suspicious applications side by side using the "Compare" tool in the review panel. Always verify documentation through official channels.',
                    'application statistics': 'Currently there are 12 applications in total: 10 in the pending queue and 2 processed. The average risk score is 38, and the approval rate is 50%. Today, 2 applications have been processed, with 1 escalation reported.',
                    'default': 'I can help with understanding risk factors, navigating the system, or providing insights about fraud detection patterns. What specific information are you looking for today?'
                  };
                  
                  const caseResponses = {
                    'why was this flagged': 'This application was flagged due to multiple risk indicators: essay similarity (96% match with known fraudulent content), recently created email account (5 days old), and rapid submission pattern (completed in under 2 minutes).',
                    'request document': 'I can help you request additional documents. Based on the risk factors, I recommend requesting: government-issued ID, proof of enrollment verification, and updated financial documentation. Would you like me to prepare the email template?',
                    'risk score': 'The risk score of 95 is calculated based on weighted factors: Essay similarity (40 points), Email age verification (25 points), Rapid submission pattern (20 points), and behavioral analysis (10 points).',
                    'similar cases': 'I found 3 similar cases in the past 6 months with comparable patterns. 2 were confirmed fraud, 1 was a false positive after document verification.',
                    'default': 'I can help explain the risk factors, assist with document requests, provide similar case analysis, or answer questions about the fraud detection process. What specific aspect would you like to explore?'
                  };
                  
                  // Select appropriate responses based on context
                  const responses = isHomePage ? homeResponses : caseResponses;
                  
                  const lowerMessage = question.toLowerCase();
                  let response = responses.default;
                  Object.keys(responses).forEach(key => {
                    if (lowerMessage.includes(key)) {
                      response = responses[key as keyof typeof responses];
                    }
                  });
                  const agentMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'agent' as const,
                    message: response,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, agentMessage]);
                  setIsTyping(false);
                }, 1500);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border shadow-sm ${
                isDark
                  ? 'bg-gray-700 hover:bg-purple-700 text-purple-200 border-gray-600'
                  : 'bg-gray-100 hover:bg-purple-100 text-purple-700 border-gray-300'
              }`}
              aria-label={question}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-purple-600' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-3 h-3 text-white" />
                ) : (
                  <Bot className="w-3 h-3 text-white" />
                )}
              </div>
              <div className={`px-3 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 opacity-70`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className={`px-3 py-2 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="thinking-dots flex space-x-1">
                  <div className={`dot w-1 h-1 rounded-full animate-pulse ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                  <div className={`dot w-1 h-1 rounded-full animate-pulse ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`} style={{animationDelay: '0.2s'}}></div>
                  <div className={`dot w-1 h-1 rounded-full animate-pulse ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`} style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this case..."
            rows={2}
            className={`flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;
