import React from 'react';
import { Brain, Search } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const ApplicationQueue: React.FC = () => {
  const { queueApplications, startBulkFraudDetection, isBulkProcessing, bulkProcessingStatus } = useApplications();
  const { isDark } = useTheme();
  const { addNotification } = useNotifications();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'admission':
        return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700';
      case 'financial-aid':
        return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700';
      case 'enrollment':
        return isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700';
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

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header with Bulk Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Applications in Queue ({queueApplications.length})
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Process all applications with AI fraud detection
          </p>
        </div>
        
        {/* Action Buttons */}
        {queueApplications.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={handleStartBulkFraudDetection}
              disabled={isBulkProcessing || queueApplications.every(app => app.aiProcessing)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isBulkProcessing
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
                  <Search className="w-4 h-4" />
                  <span>Process All</span>
                </>
              )}
            </button>
            
            <button
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <span>Process Selected</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Bulk Processing Status */}
      {isBulkProcessing && bulkProcessingStatus.processed > 0 && (
        <div className={`p-4 border rounded-lg ${
          isDark 
            ? 'bg-gray-700/10 border-gray-700/30 text-gray-300' 
            : 'bg-gray-100 border-gray-300 text-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Brain className={`w-5 h-5 neural-pulse ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
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

      {/* Application Table */}
      <div className={`border rounded-lg overflow-hidden ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Applicant ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Program
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time Received
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark 
              ? 'bg-gray-800 divide-gray-700' 
              : 'bg-white divide-gray-200'
          }`}>
            {queueApplications.map((application) => (
              <tr 
                key={application.id}
                className={`transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } ${application.aiProcessing ? `${isDark ? 'bg-purple-900/20' : 'bg-purple-50/50'}` : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={application.avatar} 
                      alt={application.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {application.studentId}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {application.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(application.stage)}`}>
                    {application.stage.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {formatTimestamp(application.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  {application.aiProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                        {application.processingStage || 'Processing...'}
                      </span>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}>
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Table becomes Cards on smaller screens */}
      <div className="lg:hidden space-y-4 mt-4">
        {queueApplications.length > 0 && queueApplications.map((application) => (
          <div
            key={application.id}
            className={`border rounded-lg p-4 transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200 shadow-sm'
            } ${application.aiProcessing ? `ring-2 ring-purple-500/50` : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {application.studentId}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(application.stage)}`}>
                {application.stage.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={application.avatar} 
                alt={application.name}
                className="w-8 h-8 rounded-full object-cover"
              />
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
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className={isDark ? 'text-purple-300' : 'text-purple-700'}>Processing</span>
                </div>
              )}
            </div>

            {/* AI Processing Status for Mobile */}
            {application.aiProcessing && (
              <div className={`mt-3 px-3 py-2 rounded-md border text-xs ${
                isDark 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                  : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                <div className="flex items-center space-x-1 mb-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Analysis</span>
                </div>
                <p>{application.processingStage}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {queueApplications.length === 0 && (
        <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No applications in queue</h3>
          <p className="text-sm">All applications have been processed</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationQueue;