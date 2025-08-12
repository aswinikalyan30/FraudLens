import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useChat, ChatMessage } from '../contexts/ChatContext';

interface ChatAgentProps {
  applicationId: string;
  userName?: string;
  onOpenCaseFullScreen?: (id: string) => void;
}

// Session management utilities
const SESSION_STORAGE_KEY = 'fraudlens_chat_session';
// const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

interface ChatSession {
  sessionId: string;
  createdAt: number;
}

// const generateSessionId = (): string => {
//   return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// };

// const getOrCreateSession = (): string => {
//   const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  
//   if (stored) {
//     try {
//       const session: ChatSession = JSON.parse(stored);
//       const now = Date.now();
      
//       // Check if session is still valid (within 4 hours)
//       if (now - session.createdAt < SESSION_DURATION) {
//         return session.sessionId;
//       }
//     } catch {
//       // Invalid session data, create new one
//       console.warn('Invalid session data, creating new session');
//     }
//   }
  
//   // Create new session
//   const newSessionId = generateSessionId();
//   const newSession: ChatSession = {
//     sessionId: newSessionId,
//     createdAt: Date.now()
//   };
  
//   localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
//   return newSessionId;
// };

const ChatAgent: React.FC<ChatAgentProps> = ({ applicationId, userName = 'Robert', onOpenCaseFullScreen }) => {
  const { isDark } = useTheme();
  const { 
    queueApplications, 
    processedApplications 
  } = useApplications();
  const { messages, setMessages, isTyping, setIsTyping } = useChat();
  
  const isHomePage = applicationId === 'home';
//   const [sessionId] = useState(() => getOrCreateSession());
  
  // Calculate statistics for the initial message
  const rejectedCount = processedApplications.filter(app => app.status === 'rejected').length;
  const highRiskCount = processedApplications.filter(app => app.riskScore && app.riskScore >= 80).length;
  const moderateRiskCount = processedApplications.filter(app => app.riskScore && app.riskScore >= 50 && app.riskScore < 80).length;
  const lowRiskCount = processedApplications.filter(app => app.riskScore && app.riskScore < 50).length;
  const processedCount = processedApplications.length;
  const queuedCount = queueApplications.length;
  
  const initialMessageText = isHomePage 
    ? `Hi ${userName}, Here's what you have to look at today.\nRejected Applications - ${rejectedCount}\nHigh Risk - ${highRiskCount}\nModerate Risk - ${moderateRiskCount}\nLow Risk - ${lowRiskCount}\nProcessed - ${processedCount}\nQueued - ${queuedCount}`
    : 'Hello! I\'m your AI assistant. I can help explain why this application was flagged, provide additional context, or assist with document requests. What would you like to know?';
  
  useEffect(() => {
    if (messages.length === 0 && isHomePage) {
      const sessionInfo = localStorage.getItem(SESSION_STORAGE_KEY);
      let sessionMessage = '';
      
      try {
        if (sessionInfo) {
          const session: ChatSession = JSON.parse(sessionInfo);
          const now = Date.now();
          const isNewSession = now - session.createdAt < 60000; // If created within last minute, it's new
          
          if (isNewSession) {
            sessionMessage = ' (New session started)';
          } else {
            const hoursAgo = Math.floor((now - session.createdAt) / (1000 * 60 * 60));
            if (hoursAgo > 0) {
              sessionMessage = ` (Session resumed - ${hoursAgo}h ago)`;
            }
          }
        }
      } catch {
        // Ignore session info parsing errors
      }
      
      setMessages([
        {
          id: '1',
          type: 'agent',
          message: initialMessageText + sessionMessage,
          timestamp: new Date()
        }
      ]);
    } else if (!isHomePage) {
      // For case view, we can decide if we want to clear chat or show a specific message
      // For now, let's just show a case-specific initial message if there are no messages
      const caseMessageExists = messages.some(m => m.message.includes('flagged'));
      if (!caseMessageExists) {
        const initialMessage = {
          id: 'case-intro',
          type: 'agent' as const,
          message: 'Hello! I\'m your AI assistant. I can help explain why this application was flagged, provide additional context, or assist with document requests. What would you like to know?',
          timestamp: new Date()
        };
        // Add to existing messages without clearing them
        setMessages(prev => [...prev, initialMessage]);
      }
    }
  }, [isHomePage, messages.length, setMessages, initialMessageText]);

  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'error'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to parse application list from API response
  const parseApplicationList = (responseText: string): Array<{name: string, type: string}> => {
    try {
      // Extract lines that match the pattern "Name : type"
      const lines = responseText.split('\n');
      return lines
        .filter(line => line.includes(' : '))
        .map(line => {
          const [name, type] = line.split(' : ').map(part => part.trim());
          return { name, type };
        });
    } catch (error) {
      console.error('Error parsing application list:', error);
      return [];
    }
  };

  const sendMessageToAPI = async (message: string): Promise<string> => {
    try {
      setConnectionStatus('online');
      const response = await fetch('https://4xituwvy3i.execute-api.us-east-1.amazonaws.com/dev/conversation_agent', {
        method: 'POST',
        body: JSON.stringify({
          session_id: '123',
          message: `Query the DB and ${message}, provide the output in the following format: Name : Application Type`,
        }),
      });

      if (!response.ok) {
        setConnectionStatus('error');
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      setConnectionStatus('online');
      
      // For application listings, we'll maintain the raw response to parse into chips
      const responseText = data.response || data.body || data.message || 
        'I apologize, but I\'m having trouble processing your request right now.';
      
      // Check if the response is a JSON string that contains application details
      try {
        if (typeof responseText === 'string' && responseText.startsWith('{"response":')) {
          const parsedJson = JSON.parse(responseText);
          if (parsedJson && parsedJson.response) {
            return parsedJson.response;
          }
        }
      } catch {
        console.log('Not a JSON response');
      }
      
      return responseText;
      
    } catch (error) {
      console.error('Chat API error:', error);
      setConnectionStatus('offline');
      
      // Fallback to local responses on API failure
      return getFallbackResponse(message);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const homeResponses = {
      'give me the high risk and rejected application details': '{"response": "## **HIGH RISK AND REJECTED APPLICATION DETAILS**\\n\\nJanice Johnson : admissions \\nBrad Kelly : finaid \\nBrad Kelly : admissions \\nDaniel Lin : admissions \\nDaniel Lin : finaid \\nSanjay Patel : admissions \\nEric Zene : admissions\\n"}',
      'high risk': '{"response": "## **HIGH RISK AND REJECTED APPLICATION DETAILS**\\n\\nJanice Johnson : admissions \\nBrad Kelly : finaid \\nDaniel Lin : finaid \\nSanjay Patel : admissions\\n"}',
      'rejected': '{"response": "## **REJECTED APPLICATION DETAILS**\\n\\nBrad Kelly : admissions \\nDaniel Lin : admissions \\nEric Zene : admissions\\n"}',
      'how does risk scoring work': 'Our fraud risk scoring system analyzes multiple factors: document authenticity (30%), behavioral patterns (25%), identity verification (25%), and application consistency (20%). Scores above 80 are auto-flagged for review, while scores 60-80 receive targeted verification checks.',
      'system navigation': 'The main navigation sections are: Home (dashboard overview), Queue (pending applications), Processed (completed reviews), and Settings. You can also use the quick filters at the top to sort by risk level, or search by applicant name or ID in the search bar.',
      'fraud detection': 'Look for inconsistent application details, unusually quick form completion times, and patterns across multiple applications. Compare suspicious applications side by side using the "Compare" tool in the review panel. Always verify documentation through official channels.',
      'statistics': 'I can help analyze application patterns and provide insights. What specific statistics would you like to know about?',
      'default': 'I can help with understanding risk factors, navigating the system, or providing insights about fraud detection patterns. What specific information are you looking for today?'
    };
    
    const caseResponses = {
      'why was this flagged': 'This application requires review due to multiple risk indicators. I can help analyze the specific factors that contributed to the risk assessment.',
      'request document': 'I can help you request additional documents. Based on typical risk factors, common requests include: government-issued ID, proof of enrollment verification, and updated financial documentation. Would you like me to help prepare a document request?',
      'risk score': 'The risk score is calculated based on weighted factors including document verification, behavioral analysis, and consistency checks across the application.',
      'similar cases': 'I can help identify patterns and similar cases that might provide context for this application.',
      'default': 'I can help explain risk factors, assist with document requests, provide case analysis, or answer questions about the review process. What specific aspect would you like to explore?'
    };
    
    const responses = isHomePage ? homeResponses : caseResponses;
    const lowerMessage = message.toLowerCase();
    let response = responses.default;

    Object.keys(responses).forEach(key => {
      if (lowerMessage.includes(key)) {
        response = responses[key as keyof typeof responses];
      }
    });

    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the API
      const aiResponse = await sendMessageToAPI(messageToSend);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback message on error
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
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

  return (
    <div className={`h-full flex flex-col ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-3 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-900 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-sm font-medium">Sera</h2>
          <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' 
                ? 'bg-green-500' 
                : connectionStatus === 'offline' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`} title={connectionStatus === 'online' ? 'Online' : connectionStatus === 'offline' ? 'Offline (Local Mode)' : 'Connection Error'}>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className={`p-2 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-1">
          {(isHomePage ? [
            'Give me the high risk and rejected application details',
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
              onClick={async () => {
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
                
                try {
                  // Call the API
                  const aiResponse = await sendMessageToAPI(question);
                  
                  const agentMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'agent' as const,
                    message: aiResponse,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, agentMessage]);
                } catch (error) {
                  console.error('Failed to get AI response for quick action:', error);
                  
                  // Fallback to local responses on error
                  const fallbackResponse = getFallbackResponse(question);
                  const agentMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'agent' as const,
                    message: fallbackResponse,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, agentMessage]);
                } finally {
                  setIsTyping(false);
                }
              }}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border shadow-sm ${
                isDark
                  ? 'bg-gray-700 hover:bg-blue-700 text-gray-200 border-gray-600'
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-700 border-gray-300'
              }`}
              aria-label={question}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-2.5 h-2.5 text-white" />
                ) : (
                  <Bot className="w-2.5 h-2.5 text-white" />
                )}
              </div>
              <div className={`px-2.5 py-1.5 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {message.type === 'agent' && message.message.includes(' : ') ? (
                  <div className="space-y-2">
                    {message.message.includes('**HIGH RISK AND REJECTED') && (
                      <p className="text-xs font-medium mb-2">HIGH RISK AND REJECTED APPLICATION DETAILS:</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {parseApplicationList(message.message).map((app, index) => (
                        <button 
                          key={index}
                          onClick={() => {
                            // Find the student ID from the application name
                            const student = [...queueApplications, ...processedApplications].find(
                              s => s.name.includes(app.name.split(' ')[0])
                            );
                            
                            if (student && onOpenCaseFullScreen) {
                              onOpenCaseFullScreen(student.studentId);
                            } else {
                              console.warn('Could not find student ID for', app.name);
                            }
                          }}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                            app.type === 'admissions'
                              ? isDark ? 'bg-purple-900/30 border-purple-600/30 text-purple-300 hover:bg-purple-800/40' 
                                      : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                              : isDark ? 'bg-blue-900/30 border-blue-600/30 text-blue-300 hover:bg-blue-800/40'
                                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {app.name} ({app.type === 'admissions' ? 'Admissions' : 'Financial Aid'})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed whitespace-pre-line">{message.message}</p>
                )}
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
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-2.5 h-2.5 text-white" />
              </div>
              <div className={`px-2.5 py-1.5 rounded-lg ${
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
      <div className={`p-3 border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isTyping ? "AI is thinking..." : "Ask about this case..."}
            rows={1}
            disabled={isTyping}
            className={`flex-1 px-2 py-1.5 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;
