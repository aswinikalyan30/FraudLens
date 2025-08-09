import React, { useState } from 'react';
import { Eye, History, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useApplications, Application } from '../contexts/ApplicationContext';
import { useTheme } from '../contexts/ThemeContext';
import CaseReview from './CaseReview';

interface ProcessedApplicationsProps {
  onReviewApplication?: (applicationId: string) => void;
}

const ProcessedApplications: React.FC<ProcessedApplicationsProps> = ({ onReviewApplication }) => {
  const { processedApplications } = useApplications();
  const { isDark } = useTheme();
  const [selectedCase, setSelectedCase] = useState<Application | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
      case 'escalated':
        return isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

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
      case 'enrollment':
        return isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-700';
    }
  };

  const handleViewCase = (application: Application) => {
    setSelectedCase(application);
  };

  const closeDrawer = () => {
    setSelectedCase(null);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Processed Applications ({processedApplications.length})
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Applications that have completed AI fraud detection
          </p>
        </div>
      </div>

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
                  Stage
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDark 
                ? 'bg-gray-800 divide-gray-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {processedApplications.map((application) => (
                <tr 
                  key={application.id}
                  className={`cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleViewCase(application)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={application.avatar} 
                        alt={application.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {application.name}
                        </div>
                        <div className={`text-xs font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          {application.studentId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(application.stage)}`}>
                      {application.stage.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${getRiskColor(application.riskScore || 0)}`}>
                      {application.riskScore || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(application.status)}`}>
                        {application.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(application.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Timeline functionality removed for now
                          console.log('Timeline for:', application.studentId);
                          handleViewCase(application);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-md transition-colors ${
                          isDark 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                        title="View Timeline"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCase(application);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          isDark 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {onReviewApplication && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReviewApplication(application.id);
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            isDark 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          → Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {processedApplications.map((application) => (
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
                <img 
                  src={application.avatar} 
                  alt={application.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {application.name}
                  </h3>
                  <p className={`text-xs font-mono ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
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
              <div className="flex items-center space-x-1">
                {getStatusIcon(application.status)}
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(application.status)}`}>
                  {application.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatTimestamp(application.timestamp)}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Timeline functionality removed for now
                    console.log('Timeline for:', application.studentId);
                  }}
                  className={`px-2 py-1 text-sm font-medium rounded-md transition-colors ${
                    isDark 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCase(application);
                  }}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    isDark 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  View
                </button>
                {onReviewApplication && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewApplication(application.id);
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

      {/* Timeline Modal - Removed for now */}
      
      {/* Case Review Drawer */}
      {selectedCase && (
        <CaseReview
          case={selectedCase}
          onClose={closeDrawer}
          mode="drawer"
        />
      )}
    </div>
  );
};

export default ProcessedApplications;