import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { NavigationProvider } from './contexts/NavigationContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <NotificationProvider>
      <ApplicationProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </ApplicationProvider>
    </NotificationProvider>
  </ThemeProvider>
);
