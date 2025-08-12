import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Clock, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const ApplicationQueue: React.FC = () => {
  const { queueApplications, startBulkFraudDetection, isBulkProcessing, bulkProcessingStatus, applicationsLoading, error } = useApplications();
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Priority state
  const [priorityMap, setPriorityMap] = useState<Record<string, 'Normal' | 'Urgent'>>({});
  const { addNotification } = useNotifications();
  // Select all/none logic
  const allSelectableIds = queueApplications.filter(app => !app.aiProcessing).map(app => app.id);
  const isAllSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedIds.includes(id));
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  // Keyboard shortcuts
  const handleStartBulkFraudDetectionSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    addNotification({
      type: 'new-case',
      title: 'Bulk Fraud Detection Started',
      message: `Fraud detection initiated for ${selectedIds.length} selected applications.`,
    });
    // For demo: just call the original bulk function (real impl would pass selectedIds)
    startBulkFraudDetection();
    setSelectedIds([]);
  }, [selectedIds, addNotification, startBulkFraudDetection]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      setSelectedIds(isAllSelected ? [] : allSelectableIds);
    } else if (e.key === 'Escape') {
      setSelectedIds([]);
    } else if (e.key === 'Enter' && selectedIds.length > 0 && !isBulkProcessing) {
      handleStartBulkFraudDetectionSelected();
    }
  }, [isAllSelected, allSelectableIds, selectedIds, isBulkProcessing, handleStartBulkFraudDetectionSelected]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Estimated processing time (assume 10s per application)
  const estimatedTimeSec = selectedIds.length * 10;

  // Priority change handler
  const handlePriorityChange = (id: string, value: 'Normal' | 'Urgent') => {
    setPriorityMap(prev => ({ ...prev, [id]: value }));
  };

  // Select all/none handler
  const handleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : allSelectableIds);
  };

  // Individual selection handler
  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Bulk process only selected (moved to useCallback above)
  const { isDark } = useTheme();

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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleStartBulkFraudDetection = () => {
    // Add toast notification
    addNotification({
      type: 'new-case',
      title: 'Bulk Fraud Detection Started',
      message: `Fraud detection initiated for ${queueApplications.length} applications. Processed cases will appear below.`,
    });
    
    // Start the bulk fraud detection process
    startBulkFraudDetection();
  };

  const queuedCount = queueApplications.filter(app => !app.aiProcessing).length;
  const processingCount = queueApplications.filter(app => app.aiProcessing).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Loading State */}
      {applicationsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading applications...
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
          {/* Header */}
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Applications in Queue ({queueApplications.length})
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor and manage application processing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center
            ${isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-300 bg-blue-50 text-blue-700'}`}>
            <Clock className="h-3 w-3 mr-1" />
            {queuedCount} queued
          </span>
          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center
            ${isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
            {processingCount} processing
          </span>
        </div>
      </div>


      {/* Control Panel */}
      <div className={`border rounded-lg overflow-hidden p-6
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        tabIndex={0}
        aria-label="Queue Controls"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Clock className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Queue Controls</h2>
        </div>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage batch processing of applications
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={el => { if (el) el.indeterminate = isIndeterminate; }}
              onChange={handleSelectAll}
              className={`rounded h-4 w-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
            />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>({selectedIds.length} selected)</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <button
              onClick={handleStartBulkFraudDetectionSelected}
              disabled={selectedIds.length === 0 || isBulkProcessing}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border
                ${isDark 
                  ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              <Play className="h-4 w-4 mr-2" />
              <span>Process Selected</span>
            </button>
            <button
              onClick={handleStartBulkFraudDetection}
              disabled={isBulkProcessing || queueApplications.every(app => app.aiProcessing)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${isBulkProcessing
                  ? isDark
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-100 text-gray-500'
                  : isDark
                  ? 'bg-gradient-to-r from-[#7100EB] to-[#7100EB] hover:from-[#6000c8] hover:to-[#6000c8] text-white'
                  : 'bg-gradient-to-r from-[#7100EB] to-[#7100EB] hover:from-[#6000c8] hover:to-[#6000c8] text-white'
              }`}
            >
              {isBulkProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing All...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  <span>Process All</span>
                </>
              )}
            </button>
            {selectedIds.length > 0 && (
              <span className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Est. time: {estimatedTimeSec}s</span>
            )}
          </div>
        </div>
        <div className="text-xs mt-2 text-gray-400">
          <span>Shortcuts: Ctrl/Cmd+A = select all, Esc = clear, Enter = process selected</span>
        </div>
      </div>
      
      {/* Bulk Processing Status */}
      {isBulkProcessing && bulkProcessingStatus.processed > 0 && (
        <div className={`p-4 border rounded-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-gray-300' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Brain className={`w-5 h-5 animate-pulse ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className="font-medium">Fraud Detection in Progress</span>
            </div>
            <span className="text-sm">{bulkProcessingStatus.processed} of {bulkProcessingStatus.total} processed</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#7100EB] to-[#95F4A0] transition-all duration-500"
              style={{ width: `${(bulkProcessingStatus.processed / bulkProcessingStatus.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className={`border rounded-lg overflow-hidden
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Applications in Queue</h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time processing status and progress
          </p>
          
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll}
                    className={`rounded ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
                  />
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Applicant ID</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Program</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time Received</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y animate-fade-in">
              {queueApplications.map((application, index) => (
                <tr
                  key={application.id}
                  className={`transition-colors animate-fade-in
                    ${isDark ? 'hover:bg-gray-700 divide-gray-700' : 'hover:bg-gray-50 divide-gray-200'}
                    ${application.aiProcessing ? `${isDark ? 'bg-blue-900/20' : 'bg-blue-50/50'}` : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(application.id)}
                      onChange={() => handleSelect(application.id)}
                      className={`rounded ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                      disabled={application.aiProcessing}
                      aria-label={selectedIds.includes(application.id) ? 'Deselect' : 'Select'}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{application.studentId}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{application.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(application.stage)}`}>{application.stage.replace('-', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formatTimestamp(application.timestamp)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    {application.aiProcessing ? (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{application.processingStage || 'Processing...'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${50}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center space-x-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{application.status === 'submitted' ? 'Submitted' : application.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={priorityMap[application.id] || 'Normal'}
                      onChange={e => handlePriorityChange(application.id, e.target.value as 'Normal' | 'Urgent')}
                      className={`rounded px-2 py-1 text-xs border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      disabled={application.aiProcessing}
                      aria-label="Priority"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Cards for smaller screens */}
      <div className="lg:hidden space-y-4 mt-4">
        {queueApplications.length > 0 && queueApplications.map((application, index) => (
          <div
            key={application.id}
            className={`border rounded-lg p-4 transition-all animate-fade-in ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200 shadow-sm'
            } ${application.aiProcessing ? `ring-2 ring-blue-500/50` : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {application.studentId}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(application.stage)}`}>
                {application.stage.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {application.name}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {application.email}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {formatTimestamp(application.timestamp)}
              </span>
              
              {application.aiProcessing && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className={isDark ? 'text-blue-300' : 'text-blue-700'}>Processing</span>
                </div>
              )}
            </div>

            {/* AI Processing Status for Mobile */}
            {application.aiProcessing && (
              <div className={`mt-3 px-3 py-2 rounded-md border text-xs ${
                isDark 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <div className="flex items-center space-x-1 mb-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Analysis</span>
                </div>
                <p>{application.processingStage}</p>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: '50%' }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {queueApplications.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className={`h-12 w-12 mx-auto mb-4 opacity-50 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No applications in queue</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>All applications have been processed</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ApplicationQueue;