import React, { useState } from 'react';
import { Users, CheckCircle, Shield, TrendingUp } from 'lucide-react';
  // Returns a colored dot for status (same as ProcessedApplications)
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

  const StatusDot = ({ status }: { status: string }) => (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${getStatusDotColor(status)}`}
      aria-label={status}
    />
  );
import { useTheme } from '../contexts/ThemeContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useNotifications } from '../contexts/NotificationContext';
import UserProfile from './UserProfile';

interface HomeContentProps {
  onNavigateToProcessed: () => void;
  onOpenCaseFullScreen: (id: string) => void;
}

const HomeContent: React.FC<HomeContentProps> = ({ onNavigateToProcessed, onOpenCaseFullScreen }) => {
  const { queueApplications, processedApplications, applicationsLoading, error, refresh } = useApplications();
  const { addNotification } = useNotifications();
  const { isDark } = useTheme();
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // Helper function to calculate time elapsed
  const getTimeElapsed = (updatedAt: string | undefined) => {
    if (!updatedAt) return 'Unknown';
    
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Calculate KPI values with trend indicators
  const totalApplications = queueApplications.length + processedApplications.length;
  const processedToday = processedApplications.filter(app => {
    const today = new Date().toDateString();
    return new Date(app.timestamp).toDateString() === today;
  }).length;
  // removed unused processedYesterday
  // removed unused processingTrend and processingChange
  const avgRiskScore = processedApplications.length > 0 
    ? Math.round(processedApplications.reduce((sum, app) => sum + (app.riskScore || 0), 0) / processedApplications.length)
    : 0;
  const approvalRate = processedApplications.length > 0
    ? Math.round((processedApplications.filter(app => app.status === 'approved').length / processedApplications.length) * 100)
    : 0;
  
  // Calculate ROI metrics
  const roiMetrics = {
    fraudPrevented: 4850,
    operationalCost: 1250,
    roi: 2
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'red', bgClass: isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200' };
    if (score >= 50) return { level: 'Medium', color: 'yellow', bgClass: isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200' };
    else return { level: 'Low', color: 'green', bgClass: isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200' };
  };
  const riskLevel = getRiskLevel(avgRiskScore);

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleBulkProcess = async (applicationsToProcess?: string[]) => {
    const appsToProcess = applicationsToProcess || selectedApplications;
    
    if (appsToProcess.length === 0) {
      addNotification({
        title: 'No Selection',
        message: 'Please select applications to process',
        type: 'new-case'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get the studentIds (application_ids) for the selected applications
      const selectedStudentIds = appsToProcess.map(id => {
        const app = queueApplications.find(app => app.id === id);
        return app?.studentId;
      }).filter(Boolean);

      // Clear selections immediately
      setSelectedApplications([]);
      
      // Show processing notification immediately
      addNotification({
        title: 'Processing Started',
        message: `Processing ${appsToProcess.length} application${appsToProcess.length > 1 ? 's' : ''}`,
        type: 'new-case'
      });

      // Fire and forget API calls - don't wait for response
      if (appsToProcess.length === 1) {
        // Single application processing endpoint
        fetch('https://4xituwvy3i.execute-api.us-east-1.amazonaws.com/dev/admission_agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            application_id: selectedStudentIds[0]
          })
        }).catch(error => {
          console.error('Single application processing error:', error);
        });
      } else {
        // Multiple applications processing endpoint
        fetch('https://4xituwvy3i.execute-api.us-east-1.amazonaws.com/dev/process_users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            users: selectedStudentIds
          })
        }).catch(error => {
          console.error('Bulk processing error:', error);
        });
      }

      // Only refresh application data to get updated status from API
      // Do not trigger local simulation until API responds
      await refresh();
      
    } catch (error) {
      console.error('Processing error:', error);
      addNotification({
        title: 'Processing Error',
        message: error instanceof Error ? error.message : 'Failed to start processing',
        type: 'escalation'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-3 lg:p-4 space-y-4">
      {/* Error State */}
      {error && (
        <div className={`p-4 border rounded-lg ${
          isDark ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="font-medium">Error loading data:</div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* KPIs Row - Single row layout */}
      <div className="rounded-lg border border-gray-100 bg-white px-6 py-3 shadow-sm mb-3 mr-6">
        <div className="mr-5 flex items-center">
          {/* Total Applications */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Total Applications</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{totalApplications}</span>
                <span className="text-xs text-red-500">▼ +{queueApplications.length} pending</span>
              </div>
            </div>
          </div>

          {/* Gap and Divider */}
          <div className="ml-10 h-12 w-px bg-gray-200"></div>

          {/* Avg Risk Score */}
          <div className="ml-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Avg Risk Score</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{avgRiskScore}</span>
                <span className={`text-xs flex items-center gap-1 ${
                  riskLevel.color === 'red' ? 'text-red-500' :
                  riskLevel.color === 'yellow' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {riskLevel.level === 'High' && <span>▲</span>}
                  {riskLevel.level === 'Low' && <span>▼</span>}
                  {riskLevel.level} risk
                </span>
              </div>
            </div>
          </div>

          {/* Gap and Divider */}
          <div className="ml-10 h-12 w-px bg-gray-200"></div>

          {/* Approval Rate */}
          <div className="ml-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Approval Rate</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{approvalRate}%</span>
                <span className="text-sm text-green-500">▼ +{Math.round(approvalRate * 0.12)}%</span>
              </div>
            </div>
          </div>

          {/* Gap and Divider */}
          <div className="ml-12 h-12 w-px bg-gray-200"></div>

          {/* ROI - No trailing space */}
          <div className="flex items-center gap-3 ml-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">ROI</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{roiMetrics.roi}%</span>
                <span className="text-xs text-green-500">▼ ${(roiMetrics.fraudPrevented / 1000).toFixed(0)}K saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applications - Scrollable */}
      <div className={`border rounded-lg p-4 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pending Applications
            </h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              queueApplications.length > 10 
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {queueApplications.length}
            </div>
          </div>
          <button
            onClick={() => {
              // Process all pending applications
              const allPendingIds = queueApplications.map(app => app.id);
              handleBulkProcess(allPendingIds);
            }}
            disabled={queueApplications.length === 0 || isProcessing}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              queueApplications.length === 0 || isProcessing
                ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Processing...' : `Process All (${queueApplications.length})`}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className={`mb-4 p-4 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedApplications.length} selected
              </span>
              <button
                onClick={() => handleBulkProcess()}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-gray-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Process Selected'}
              </button>
            </div>
          </div>
        )}

        {/* Loading State for Applications */}
        {applicationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Loading applications...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {queueApplications.slice(0, 8).map((application) => (
                <div
                  key={application.id}
                  className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedApplications.includes(application.id)
                      ? isDark
                        ? 'bg-gray-900/30 border-gray-500/50'
                        : 'bg-blue-50 border-blue-300'
                      : isDark
                        ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    console.log('Open case:', application.studentId);
                    onOpenCaseFullScreen(application.studentId);
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => handleSelectApplication(application.id)}
                      className="rounded text-blue-200"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(true);
                      }}
                      className="flex-shrink-0 transition-transform hover:scale-105"
                    >
                    </button>
                    {/* Standardized columns using a 3-column grid for perfect centering */}
                    <div className="grid w-full items-center grid-cols-3">
                      {/* Name & ID - left, allow truncate */}
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{application.name}</div>
                        <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ID: {application.studentId}</div>
                      </div>

                      {/* Program - centered: Program Name only (larger text) */}
                      <div className="flex items-center justify-start min-w-0 justify-self-start px-2 w-full">
                        <div
                          className={`truncate text-base text-left text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}
                          title={application.programName || ''}
                        >
                          {application.programName || '—'}
                        </div>
                      </div>

                      {/* Time - right aligned */}
                      <div className={`text-sm flex items-center justify-self-end pl-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg>
                        {getTimeElapsed(application.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!applicationsLoading && queueApplications.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm">No pending applications</p>
                <p className="text-xs mt-1">All caught up!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recently Processed - Below Pending */}
      <div className={`border rounded-lg p-4 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recently Processed
            </h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700
            }`}>
              {processedToday} today
            </div>
          </div>
          <button
            onClick={onNavigateToProcessed}
            className={`text-sm hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
          >
            View All
          </button>
        </div>

        {/* Loading State for Processed Applications */}
        {applicationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Loading processed applications...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {processedApplications.slice(0, 8).map((application) => {
                const riskInfo = application.riskScore ? getRiskLevel(application.riskScore) : null;
                return (
                  <div
                    key={application.id}
                    className={`flex items-center p-4 rounded-lg border justify-between cursor-pointer ${
                      isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    } hover:shadow-md transition-all`}
                    onClick={() => onOpenCaseFullScreen(application.studentId)}
                  >
                    <div className="grid w-full items-center grid-cols-3 gap-2">
                      {/* Name & ID - left */}
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{application.name}</div>
                        <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{application.studentId}</div>
                      </div>

                      {/* Program Name - center */}
                      <div className="flex items-center justify-start min-w-0 justify-self-start px-2 w-full">
                        <div
                          className={`truncate text-base text-left text-sm ${isDark ? 'text-gray-100' : 'text-gray-400'}`}
                          title={application.programName || ''}
                        >
                          {application.programName || '—'}
                        </div>
                      </div>

                      {/* Risk/Status - right */}
                      <div className="flex items-center gap-2 justify-self-end pl-2">
                        {application.riskScore && riskInfo && (
                          <div className={`px-2 py-1 rounded-full text-xs font-mono border ${riskInfo.bgClass}`}>
                            <span className={
                              riskInfo.color === 'red' ? 'text-red-600' :
                              riskInfo.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                            }>
                              {application.riskScore}
                            </span>
                          </div>
                        )}
                        <span className="flex items-center px-2 py-1 rounded-full text-xs border font-medium bg-transparent border-transparent">
                          <StatusDot status={application.status} />
                          <span className={isDark ? 'text-white' : 'text-black'}>
                            {application.status.replace(/(^|\s|-)\S/g, (l) => l.toUpperCase())}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!applicationsLoading && processedApplications.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm">No processed applications</p>
                <p className="text-xs mt-1">Start processing to see results</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default HomeContent;
