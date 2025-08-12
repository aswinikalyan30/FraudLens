import React, { useState, useEffect, useMemo } from 'react';
import {AlertTriangle, Search, Filter, Sliders, Save, Trash, Star, X } from 'lucide-react';
import { useApplications, Application } from '../contexts/ApplicationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import CaseReview from './CaseReview';
import Breadcrumbs from './Breadcrumbs';

interface ProcessedApplicationsProps {
  onReviewApplication?: (applicationId: string) => void;
}

interface FilterState {
  search: string;
  riskScore: [number, number];
  statuses: string[];
  stages: string[];
  dateRange: [Date | null, Date | null];
}

interface SavedFilter {
  id: string;
  name: string;
  filter: FilterState;
  isPinned?: boolean;
}

const defaultFilterState: FilterState = {
  search: '',
  riskScore: [0, 100],
  statuses: [],
  stages: [],
  dateRange: [null, null]
};

const ProcessedApplications: React.FC<ProcessedApplicationsProps> = ({ onReviewApplication }) => {
  const { processedApplications, applicationsLoading, error } = useApplications();
  const { isDark } = useTheme();
  const { savePageState, getPageState } = useNavigation();
  const [selectedCase, setSelectedCase] = useState<Application | null>(null);
  
  // Initialize state from navigation context or defaults
  const savedState = getPageState('processed') as {
    filters?: FilterState;
    showFilterPanel?: boolean;
    savedFilters?: SavedFilter[];
  } | undefined;
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>(
    savedState?.filters || defaultFilterState
  );
  const [showFilterPanel, setShowFilterPanel] = useState(
    savedState?.showFilterPanel || false
  );
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    if (savedState?.savedFilters) return savedState.savedFilters;
    
    const stored = localStorage.getItem('fraudLens_savedFilters');
    return stored ? JSON.parse(stored) : [
      {
        id: 'high-risk',
        name: 'High Risk (80+)',
        filter: { ...defaultFilterState, riskScore: [80, 100] },
        isPinned: true
      },
      {
        id: 'rejected',
        name: 'Rejected Applications',
        filter: { ...defaultFilterState, statuses: ['rejected'] },
        isPinned: true
      }
    ];
  });
  const [filterName, setFilterName] = useState('');

  // Save state when it changes
  useEffect(() => {
    savePageState('processed', {
      filters,
      showFilterPanel,
      savedFilters
    });
  }, [filters, showFilterPanel, savedFilters, savePageState]);

  // Returns a colored dot for status
  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'escalated':
        return 'bg-yellow-500';
      case 'processed':
        return 'bg-blue-500';
      case 'in_review':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const StatusDot: React.FC<{ status: string }> = ({ status }) => (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${getStatusDotColor(status)}`}
      aria-label={status}
    />
  );

  // No longer used for dot/text, but keep for possible background/border if needed
  // const getStatusColor = ...

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'admission':
        return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700';
      case 'financial-aid':
        return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-700';
    }
  };

  const handleViewCase = (application: Application) => {
    if (onReviewApplication) {
      onReviewApplication(application.studentId);
      return;
    }
    setSelectedCase(application);
  };

  const closeDrawer = () => {
    setSelectedCase(null);
  };

  // Returns a string like 'X hours ago', and the full timestamp for tooltip
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffHours < 1) {
      if (diffMinutes < 1) return 'just now';
      return `${diffMinutes} min ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  // Save filters to local storage
  useEffect(() => {
    localStorage.setItem('fraudLens_savedFilters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Filter applications based on criteria
  const filteredApplications = useMemo(() => {
    return processedApplications.filter(app => {
      // Full-text search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          app.name.toLowerCase().includes(searchLower) ||
          app.studentId.toLowerCase().includes(searchLower) ||
          app.email?.toLowerCase().includes(searchLower) ||
          app.stage.toLowerCase().includes(searchLower) ||
          app.status.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Risk score range
      if (app.riskScore !== undefined && 
         (app.riskScore < filters.riskScore[0] || app.riskScore > filters.riskScore[1])) {
        return false;
      }
      
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) {
        return false;
      }
      
      // Stage filter
      if (filters.stages.length > 0 && !filters.stages.includes(app.stage)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange[0] || filters.dateRange[1]) {
        const appDate = new Date(app.timestamp);
        
        if (filters.dateRange[0] && appDate < filters.dateRange[0]) {
          return false;
        }
        
        if (filters.dateRange[1]) {
          // Add one day to include the end date
          const endDate = new Date(filters.dateRange[1]);
          endDate.setDate(endDate.getDate() + 1);
          
          if (appDate > endDate) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [processedApplications, filters]);
  
  // Get unique stages and statuses for filter options
  const availableStages = useMemo(() => {
    return Array.from(new Set(processedApplications.map(app => app.stage)));
  }, [processedApplications]);
  
  const availableStatuses = useMemo(() => {
    return Array.from(new Set(processedApplications.map(app => app.status)));
  }, [processedApplications]);
  
  // Handle filter save
  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName.trim(),
      filter: {...filters},
    };
    
    setSavedFilters(prev => [...prev, newFilter]);
    setFilterName('');
  };
  
  // Handle filter delete
  const handleDeleteFilter = (id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
  };
  
  // Apply saved filter
  const handleApplyFilter = (filter: FilterState) => {
    setFilters(filter);
    setShowFilterPanel(false);
  };
  
  // Toggle filter pin status
  const handleTogglePin = (id: string) => {
    setSavedFilters(prev => prev.map(f => 
      f.id === id ? { ...f, isPinned: !f.isPinned } : f
    ));
  };

  // Handle risk slider change
  const handleRiskRangeChange = (event: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const value = parseInt(event.target.value);
    setFilters(prev => {
      const newRange = [...prev.riskScore] as [number, number];
      newRange[index] = value;
      
      // Ensure min <= max
      if (index === 0 && value > newRange[1]) {
        newRange[1] = value;
      } else if (index === 1 && value < newRange[0]) {
        newRange[0] = value;
      }
      
      return { ...prev, riskScore: newRange };
    });
  };
  
  // Format date for inputs
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-4" />
      
      {/* Loading State */}
      {applicationsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading processed applications...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !applicationsLoading && (
        <div className={`p-4 border rounded-lg ${
          isDark ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error loading applications:</span>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!applicationsLoading && !error && (
        <>
          {/* Header with Search & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Processed Applications ({filteredApplications.length})
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Applications that have completed AI fraud detection
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search applications..."
              className={`w-full px-4 py-2 pl-10 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
              }`}
            />
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            {filters.search && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center justify-center p-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            } ${showFilterPanel || Object.values(filters).some(v => {
              if (Array.isArray(v) && v.length === 2) {
                // For risk score or date range
                if (v[0] !== defaultFilterState.riskScore[0] || 
                    v[1] !== defaultFilterState.riskScore[1]) {
                  return true;
                }
                if (v[0] !== null || v[1] !== null) {
                  return true;
                }
              }
              
              if (Array.isArray(v) && v.length > 0) return true;
              if (typeof v === 'string' && v) return true;
              
              return false;
            }) ? 'border-blue-500 text-blue-500' : ''}`}
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Saved Filters Pills */}
      {savedFilters.filter(f => f.isPinned).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedFilters
            .filter(f => f.isPinned)
            .map(filter => (
              <button
                key={filter.id}
                onClick={() => handleApplyFilter(filter.filter)}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  JSON.stringify(filter.filter) === JSON.stringify(filters)
                    ? isDark 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="w-3 h-3" fill="currentColor" />
                {filter.name}
              </button>
            ))
          }
          
          <button
            onClick={() => setFilters(defaultFilterState)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}
      
      {/* Filter Panel */}
      {showFilterPanel && (
        <div className={`rounded-lg border p-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Risk Score Filter */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Risk Score Range</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{filters.riskScore[0]}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{filters.riskScore[1]}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.riskScore[0]}
                    onChange={(e) => handleRiskRangeChange(e, 0)}
                    className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.riskScore[1]}
                    onChange={(e) => handleRiskRangeChange(e, 1)}
                    className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</h3>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      statuses: prev.statuses.includes(status)
                        ? prev.statuses.filter(s => s !== status)
                        : [...prev.statuses, status]
                    }))}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      filters.statuses.includes(status)
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Stage Filter */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Stage</h3>
              <div className="flex flex-wrap gap-2">
                {availableStages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      stages: prev.stages.includes(stage)
                        ? prev.stages.filter(s => s !== stage)
                        : [...prev.stages, stage]
                    }))}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      filters.stages.includes(stage)
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {stage.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Date Range */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date Range</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={formatDateForInput(filters.dateRange[0])}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: [e.target.value ? new Date(e.target.value) : null, prev.dateRange[1]]
                    }))}
                    className={`w-full px-2 py-1 rounded-lg border text-xs ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>to</span>
                  <input
                    type="date"
                    value={formatDateForInput(filters.dateRange[1])}
                    onChange={(e) => setFilters(prev => ({
                      ...prev, 
                      dateRange: [prev.dateRange[0], e.target.value ? new Date(e.target.value) : null]
                    }))}
                    className={`w-full px-2 py-1 rounded-lg border text-xs ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Save Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter name..."
                className={`px-2 py-1 rounded-lg border text-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs disabled:opacity-50 ${
                  isDark 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                }`}
              >
                <Save className="w-3 h-3" /> Save
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters(defaultFilterState)}
                className={`px-3 py-1 rounded text-xs ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className={`px-3 py-1 rounded text-xs ${
                  isDark 
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                }`}
              >
                Close
              </button>
            </div>
          </div>
          
          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Saved Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className={`flex items-center justify-between p-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePin(filter.id)}
                        className={`text-xs ${filter.isPinned ? 'text-yellow-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <Star className="w-4 h-4" fill={filter.isPinned ? 'currentColor' : 'none'} />
                      </button>
                      <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{filter.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleApplyFilter(filter.filter)}
                        className={`p-1 rounded text-xs ${
                          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
                        className={`p-1 rounded text-xs ${
                          isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'
                        }`}
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className={`rounded-lg border overflow-hidden ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Processed
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDark 
                ? 'bg-gray-800 divide-gray-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {filteredApplications.map((application) => (
                <tr 
                  key={application.id}
                  onClick={() => onReviewApplication && onReviewApplication(application.studentId)}
                  className={`cursor -pointer transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {application.name}
                        </div>
                        <div className={`text-xs font-mono ${isDark ? 'text-gray-100' : 'text-gray-400'}`}>
                          {application.studentId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`truncate text-base text-left text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}
                      title={application.programName || ''}
                    >
                      {application.programName || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${getRiskColor(application.riskScore || 0)}`}>
                      {application.riskScore || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusDot status={application.status} />
                      <span className="text-xs font-medium">
                        {application.status.replace(/(^|\s|-)\S/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span title={new Date(application.timestamp).toLocaleString()}>
                      {formatTimestamp(application.timestamp)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredApplications.map((application) => (
          <div
            key={application.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleViewCase(application)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {application.name}
                  </h3>
                  <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {application.studentId}
                  </p>
                </div>
              </div>
              <div className={`text-xl font-bold ${getRiskColor(application.riskScore || 0)}`}>
                {application.riskScore || 0}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(application.stage)}`}>
                {application.stage.replace('-', ' ')}
              </span>
              <div className="flex items-center">
                <StatusDot status={application.status} />
                <span className="text-xs font-medium text-black dark:text-white">
                  {application.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                title={new Date(application.timestamp).toLocaleString()}
              >
                {formatTimestamp(application.timestamp)}
              </span>
              <div className="flex space-x-2">
                {onReviewApplication && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewApplication(application.studentId);
                    }}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      isDark 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    → Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {processedApplications.length === 0 && (
        <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No processed applications</h3>
          <p className="text-sm">Applications will appear here after AI fraud detection</p>
        </div>
      )}

      {/* No Matches State */}
      {processedApplications.length > 0 && filteredApplications.length === 0 && (
        <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No matching applications</h3>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => setFilters(defaultFilterState)}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
              isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Timeline Modal - Removed for now */}
      
      {/* Case Review Drawer */}
      {selectedCase && !onReviewApplication && (
        <CaseReview
          case={selectedCase}
          onClose={closeDrawer}
          mode="drawer"
        />
      )}
        </>
      )}
    </div>
  );
};

export default ProcessedApplications;