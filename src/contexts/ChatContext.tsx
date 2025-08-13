import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  message: string;
  timestamp: Date;
}

interface ChatContextType {
  chats: { [key: string]: ChatMessage[] };
  addMessage: (chatId: string, message: ChatMessage) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  isTyping: { [key: string]: boolean };
  setIsTyping: (chatId: string, isTyping: boolean) => void;
  clearChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<{ [key: string]: ChatMessage[] }>({});
  const [isTyping, setIsTypingState] = useState<{ [key: string]: boolean }>({});

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats(prevChats => ({
      ...prevChats,
      [chatId]: [...(prevChats[chatId] || []), message]
    }));
  }, []);

  const setMessages = useCallback((chatId: string, messages: ChatMessage[]) => {
    setChats(prevChats => ({
      ...prevChats,
      [chatId]: messages
    }));
  }, []);

  const clearChat = useCallback((chatId: string) => {
    setChats(prevChats => {
      const newChats = { ...prevChats };
      delete newChats[chatId];
      return newChats;
    });
  }, []);

  const setIsTyping = useCallback((chatId: string, typing: boolean) => {
    setIsTypingState(prev => ({ ...prev, [chatId]: typing }));
  }, []);

  return (
    <ChatContext.Provider value={{ chats, addMessage, setMessages, isTyping, setIsTyping, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
