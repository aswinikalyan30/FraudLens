import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'high-risk' | 'escalation' | 'new-case';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  caseId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { apiClient } = await import('../api/client');
      const initial = await apiClient.get('/notifications', () => ([{
        id: '1', type: 'high-risk' as const, title: 'High Risk Case Detected', message: 'Student ST-2024-089 flagged with 95% risk score', timestamp: new Date().toISOString(), read: false, caseId: 'ST-2024-089'
      },{
        id: '2', type: 'escalation' as const, title: 'Case Escalation Recommended', message: 'AI recommends escalating case ST-2024-127', timestamp: new Date(Date.now()-300000).toISOString(), read: false, caseId: 'ST-2024-127'
      }]) as Notification[]);
      setNotifications(initial);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const refresh = useCallback(async () => { await loadNotifications(); }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const types: Array<'high-risk' | 'escalation' | 'new-case'> = ['high-risk', 'escalation', 'new-case'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const studentId = `ST-2024-${Math.floor(Math.random() * 999) + 100}`;
      
      const messages = {
        'high-risk': `Student ${studentId} flagged with ${Math.floor(Math.random() * 20) + 80}% risk score`,
        'escalation': `AI recommends escalating case ${studentId}`,
        'new-case': `New fraud case detected for ${studentId}`
      };

      addNotification({
        type: randomType,
        title: randomType === 'high-risk' ? 'High Risk Case Detected' : 
               randomType === 'escalation' ? 'Case Escalation Recommended' : 'New Case Alert',
        message: messages[randomType],
        caseId: studentId
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      loading,
      error,
      refresh
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};