import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  rightAdornment?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children,
  className = '',
  rightAdornment
}) => {
  const { isDark } = useTheme();
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left group`}
        aria-expanded={open}
      >
        <span className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {title}
        </span>
        <div className="flex items-center gap-3">
          {rightAdornment}
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
