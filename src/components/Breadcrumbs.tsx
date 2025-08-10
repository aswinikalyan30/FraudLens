import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';

interface BreadcrumbsProps {
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = '' }) => {
  const { state, navigateTo, goBack } = useNavigation();
  const { isDark } = useTheme();

  if (state.breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Back Button */}
      {state.previousSection && (
        <button
          onClick={goBack}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}
      
      {/* Breadcrumb Trail */}
      <nav className="flex items-center space-x-1" aria-label="Breadcrumb">
        {state.breadcrumbs.map((crumb, index) => (
          <div key={crumb.section} className="flex items-center space-x-1">
            {index > 0 && (
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            )}
            <button
              onClick={() => navigateTo(crumb.section)}
              className={`text-sm transition-colors ${
                index === state.breadcrumbs.length - 1
                  ? isDark
                    ? 'text-white font-medium'
                    : 'text-gray-900 font-medium'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-current={index === state.breadcrumbs.length - 1 ? 'page' : undefined}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumbs;
