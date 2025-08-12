import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ChatProvider } from './contexts/ChatContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <NotificationProvider>
      <ApplicationProvider>
        <NavigationProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </NavigationProvider>
      </ApplicationProvider>
    </NotificationProvider>
  </ThemeProvider>
);
