import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageSquare,
  X,
  Calendar,
  AlertTriangle,
  Shield
} from 'lucide-react';

import { useApplications } from '../contexts/ApplicationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import FlagsChart from './FlagsChart';
import ChatAgent from './ChatAgent';

interface HomeContentProps {
  onNavigateToQueue: () => void;
  onNavigateToProcessed: () => void;
}

const HomeContent: React.FC<HomeContentProps> = ({ 
  onNavigateToQueue, 
  onNavigateToProcessed
}) => {
  const { queueApplications, processedApplications, startBulkFraudDetection } = useApplications();
  const { addNotification } = useNotifications();
  const { isDark } = useTheme();
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Admin name and date
  const adminName = 'Admin 1';
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  // Calculate KPI values with trend indicators
  const totalApplications = queueApplications.length + processedApplications.length;
  const processedToday = processedApplications.filter(app => {
    const today = new Date().toDateString();
    return new Date(app.timestamp).toDateString() === today;
  }).length;
  
  // Calculate yesterday's processed count for trend
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const processedYesterday = processedApplications.filter(app => {
    return new Date(app.timestamp).toDateString() === yesterday.toDateString();
  }).length;
  
  const processingTrend = processedToday >= processedYesterday ? 'up' : 'down';
  const processingChange = processedYesterday > 0 ? Math.round(((processedToday - processedYesterday) / processedYesterday) * 100) : 0;
  
  const avgRiskScore = processedApplications.length > 0 
    ? Math.round(processedApplications.reduce((sum, app) => sum + (app.riskScore || 0), 0) / processedApplications.length)
    : 0;
  
  const approvalRate = processedApplications.length > 0
    ? Math.round((processedApplications.filter(app => app.status === 'approved').length / processedApplications.length) * 100)
    : 0;

  // Risk level categorization for color coding
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'red', bgClass: isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200' };
    if (score >= 50) return { level: 'Medium', color: 'yellow', bgClass: isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200' };
    return { level: 'Low', color: 'green', bgClass: isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200' };
  };

  const riskLevel = getRiskLevel(avgRiskScore);

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleBulkProcess = async () => {
    if (selectedApplications.length === 0) {
      addNotification({
        title: 'No Selection',
        message: 'Please select applications to process',
        type: 'new-case'
      });
      return;
    }

    setIsProcessing(true);

    try {
      for (let i = 0; i < selectedApplications.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      startBulkFraudDetection();
      
      addNotification({
        title: 'Bulk Processing Started',
        message: `Processing ${selectedApplications.length} applications`,
        type: 'new-case'
      });
      
      setSelectedApplications([]);
    } catch {
      addNotification({
        title: 'Processing Error',
        message: 'Failed to start bulk processing',
        type: 'escalation'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Dynamic greeting subtitle as a text link
  let greetingSubtitle: React.ReactNode = null;
  if (queueApplications.length > 0) {
    greetingSubtitle = (
      <button
        onClick={onNavigateToQueue}
        className="hover:underline font-medium focus:outline-none"
        type="button"
      >
        Start processing queued applications
        <ArrowRight className="inline-block w-4 h-4 ml-1" />
      </button>
    );
  } else if (processedApplications.length > 0) {
    greetingSubtitle = (
      <button
        onClick={onNavigateToProcessed}
        className="hover:underline font-medium focus:outline-none"
        type="button"
      >
        Review processed applications
        <ArrowRight className="inline-block w-4 h-4 ml-1" />
      </button>
    );
  } else {
    greetingSubtitle = 'Look at reports in detail';
  }

  return (
    <div className="p-3 lg:p-4 space-y-4">
      {/* Compact Greeting Header */}
      <div className={`flex items-center justify-between mb-4 px-4 py-3`}>
        <div className="space-y-0.5">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Hello, {adminName} 👋
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {greetingSubtitle}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
          isDark ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {dateString}
          </span>
        </div>
      </div>

      {/* Compact KPI Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-blue-500/10' : 'bg-blue-50'
            }`}>
              <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalApplications}
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Applications
            </p>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Active processing
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-green-500/10' : 'bg-green-50'
            }`}>
              <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            </div>
            {processingTrend === 'up' ? 
              <TrendingUp className="w-4 h-4 text-green-500" /> : 
              <TrendingDown className="w-4 h-4 text-red-500" />
            }
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {processedToday}
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Processed Today
            </p>
            <p className={`text-xs font-medium mt-0.5 ${
              processingTrend === 'up' 
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              {processingChange > 0 ? '+' : ''}{processingChange}% vs yesterday
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${riskLevel.bgClass} shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
              riskLevel.color === 'red' ? 'bg-red-500/20' :
              riskLevel.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-green-500/20'
            }`}>
              {riskLevel.color === 'red' ? 
                <AlertTriangle className="w-5 h-5 text-red-500" /> :
                <Shield className="w-5 h-5 text-green-500" />
              }
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              riskLevel.color === 'red' ? 'bg-red-100 text-red-700' :
              riskLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {riskLevel.level} Risk
            </span>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {avgRiskScore}
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Risk Score
            </p>
            <p className={`text-xs font-medium mt-0.5 ${
              riskLevel.color === 'red' ? 'text-red-600' :
              riskLevel.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {riskLevel.level} risk level
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
            </div>
            <TrendingUp className={`w-4 h-4 ${
              approvalRate >= 70 ? 'text-green-500' : 
              approvalRate >= 50 ? 'text-yellow-500' : 'text-red-500'
            }`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {approvalRate}%
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Approval Rate
            </p>
            <p className={`text-xs font-medium mt-0.5 ${
              approvalRate >= 70 ? 'text-green-600' : 
              approvalRate >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {approvalRate >= 70 ? 'Excellent' : 
               approvalRate >= 50 ? 'Good' : 'Needs attention'}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Chart and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <FlagsChart />
        </div>
        
        {/* Quick Stats Summary */}
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <h3 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Pending Queue</span>
              </div>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {queueApplications.length} 
                <span className={`ml-1 w-2 h-2 inline-block rounded-full ${
                  queueApplications.length === 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>High Risk Cases</span>
              </div>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {processedApplications.filter(app => (app.riskScore || 0) >= 80).length} 
                <span className={`ml-1 text-xs px-1 py-0.5 rounded ${
                  processedApplications.filter(app => (app.riskScore || 0) >= 80).length > 4 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  ▲
                </span>
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Processing Time (Avg)</span>
              </div>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                2.3 min
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Success Rate</span>
              </div>
              <span className={`text-sm font-semibold text-green-600`}>
                99.2%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Queues - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Applications Queue */}
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
                  : queueApplications.length > 5 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {queueApplications.length}
              </div>
            </div>
            <button
              onClick={onNavigateToQueue}
              className={`text-sm hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
            >
              View All
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className={`mb-4 p-4 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                  {selectedApplications.length} selected
                </span>
                <button
                  onClick={handleBulkProcess}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Process Selected'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {queueApplications.slice(0, 6).map((application) => (
              <div
                key={application.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedApplications.includes(application.id)
                    ? isDark
                      ? 'bg-blue-900/30 border-blue-500/50'
                      : 'bg-blue-50 border-blue-300'
                    : isDark
                      ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleSelectApplication(application.id)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application.id)}
                    onChange={() => handleSelectApplication(application.id)}
                    className="rounded text-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img 
                    src={application.avatar} 
                    alt={application.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <div>
                    <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {application.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {application.studentId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs border font-medium ${
                    application.stage === 'financial-aid' 
                      ? isDark ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                      : isDark ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {application.stage.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {queueApplications.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">No pending applications</p>
              <p className="text-xs mt-1">All caught up!</p>
            </div>
          )}
        </div>
        {/* Recently Processed */}
        <div className={`border rounded-lg p-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recently Processed
              </h3>
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                processedToday > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {processedApplications.slice(0, 6).map((application) => {
              const riskInfo = application.riskScore ? getRiskLevel(application.riskScore) : null;
              return (
                <div
                  key={application.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  } hover:shadow-md transition-all`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={application.avatar} 
                      alt={application.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <div>
                      <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {application.name}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {application.studentId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {application.riskScore && riskInfo && (
                      <div className={`px-2 py-1 rounded-full text-xs font-mono border ${riskInfo.bgClass}`}>
                        <span className={`${
                          riskInfo.color === 'red' ? 'text-red-600' :
                          riskInfo.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {application.riskScore}
                        </span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs border font-medium ${
                      application.status === 'approved'
                        ? isDark ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
                        : application.status === 'rejected'
                          ? isDark ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
                          : isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {application.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {processedApplications.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm">No processed applications</p>
              <p className="text-xs mt-1">Start processing to see results</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Chat Widget Button */}
      <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-10">
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)}
            className={`w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center ${
              isDark 
                ? 'bg-purple-600 hover:bg-purple-500' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        ) : null}
      </div>

      {/* Enhanced Chat Widget Popup */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-20 w-[380px] h-[520px] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="w-full h-full flex flex-col">
            <div className={`p-4 flex justify-between items-center border-b ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-purple-600 border-purple-700'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">AI Assistant</h3>
                  <p className="text-white/80 text-xs">Always here to help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatAgent applicationId="home" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeContent;
