import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  icon: typeof LucideIcon;
}

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange, tabs }) => {
  const { isDark } = useTheme();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all min-w-0 flex-1 ${
                isActive
                  ? isDark
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-purple-600 bg-purple-50'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
              {isActive && (
                <div className={`w-1 h-1 rounded-full ${
                  isDark ? 'bg-purple-400' : 'bg-purple-600'
                }`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;