import React, { createContext, useContext, useState, useCallback } from 'react';

export type NavigationSection = 'home' | 'queue' | 'processed' | 'settings';

interface NavigationState {
  currentSection: NavigationSection;
  previousSection: NavigationSection | null;
  breadcrumbs: { label: string; section: NavigationSection }[];
  pageStates: Record<string, unknown>;
}

interface NavigationContextType {
  state: NavigationState;
  navigateTo: (section: NavigationSection, label?: string) => void;
  goBack: () => void;
  savePageState: (section: NavigationSection, state: unknown) => void;
  getPageState: (section: NavigationSection) => unknown;
  clearPageState: (section: NavigationSection) => void;
  updateBreadcrumbs: (crumbs: { label: string; section: NavigationSection }[]) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const initialState: NavigationState = {
  currentSection: 'home',
  previousSection: null,
  breadcrumbs: [{ label: 'Dashboard', section: 'home' }],
  pageStates: {}
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>(initialState);

  const navigateTo = useCallback((section: NavigationSection, label?: string) => {
    setState(prev => {
      const sectionLabels: Record<NavigationSection, string> = {
        home: 'Dashboard',
        queue: 'Application Queue',
        processed: 'Processed Applications',
        settings: 'Settings'
      };

      const newLabel = label || sectionLabels[section];
      const newBreadcrumbs = [...prev.breadcrumbs];
      
      // Check if this section is already in breadcrumbs
      const existingIndex = newBreadcrumbs.findIndex(crumb => crumb.section === section);
      
      if (existingIndex >= 0) {
        // Remove everything after the existing section (user went back)
        newBreadcrumbs.splice(existingIndex + 1);
      } else {
        // Add new section to breadcrumbs
        newBreadcrumbs.push({ label: newLabel, section });
      }

      return {
        ...prev,
        currentSection: section,
        previousSection: prev.currentSection,
        breadcrumbs: newBreadcrumbs
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.previousSection) {
        const newBreadcrumbs = [...prev.breadcrumbs];
        newBreadcrumbs.pop(); // Remove current section
        
        return {
          ...prev,
          currentSection: prev.previousSection,
          previousSection: null, // Reset previous
          breadcrumbs: newBreadcrumbs
        };
      }
      return prev;
    });
  }, []);

  const savePageState = useCallback((section: NavigationSection, pageState: unknown) => {
    setState(prev => ({
      ...prev,
      pageStates: {
        ...prev.pageStates,
        [section]: pageState
      }
    }));
  }, []);

  const getPageState = useCallback((section: NavigationSection) => {
    return state.pageStates[section];
  }, [state.pageStates]);

  const clearPageState = useCallback((section: NavigationSection) => {
    setState(prev => {
      const newPageStates = { ...prev.pageStates };
      delete newPageStates[section];
      return {
        ...prev,
        pageStates: newPageStates
      };
    });
  }, []);

  const updateBreadcrumbs = useCallback((crumbs: { label: string; section: NavigationSection }[]) => {
    setState(prev => ({
      ...prev,
      breadcrumbs: crumbs
    }));
  }, []);

  const value: NavigationContextType = {
    state,
    navigateTo,
    goBack,
    savePageState,
    getPageState,
    clearPageState,
    updateBreadcrumbs
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook for using navigation context
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
