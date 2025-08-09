  // Admin name (could be dynamic in a real app)
  const adminName = 'Admin 1';
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  ArrowRight,
  MessageSquare,
  X
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

  // Calculate KPI values
  const totalApplications = queueApplications.length + processedApplications.length;
  const processedToday = processedApplications.filter(app => {
    const today = new Date().toDateString();
    return new Date(app.timestamp).toDateString() === today;
  }).length;
  
  const avgRiskScore = processedApplications.length > 0 
    ? Math.round(processedApplications.reduce((sum, app) => sum + (app.riskScore || 0), 0) / processedApplications.length)
    : 0;
  
  const approvalRate = processedApplications.length > 0
    ? Math.round((processedApplications.filter(app => app.status === 'approved').length / processedApplications.length) * 100)
    : 0;

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
      // Simulate bulk processing
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
    <div className="p-4 lg:p-6 space-y-6">
      {/* Greeting Header */}
      <div className={
        `flex items-center justify-between mb-3 px-4 py-3` +
        (isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200')
      }>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold">Hello, {adminName}👋</h1>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-snug">{greetingSubtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{dateString}</span>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" stroke="currentColor" fill="none"/></svg>
          </span>
        </div>
      </div>
      {/* KPI Cards - Compact with Icons and Text on Same Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalApplications}
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Applications
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">↗</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                isDark ? 'bg-green-500/10' : 'bg-green-50'
              }`}>
                <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {processedToday}
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Processed Today
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">↗</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                isDark ? 'bg-orange-500/10' : 'bg-orange-50'
              }`}>
                <Target className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {avgRiskScore}
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Risk Score
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">—</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                isDark ? 'bg-purple-500/10' : 'bg-purple-50'
              }`}>
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {approvalRate}%
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Approval Rate
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">↗</span>
          </div>
        </div>
      </div>

      {/* Enhanced Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FlagsChart />
                <div className={`border rounded-xl p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pending Applications
            </h3>
            <button
              onClick={onNavigateToQueue}
              className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              View All
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className={`mb-4 p-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedApplications.length} selected
                </span>
                <button
                  onClick={handleBulkProcess}
                  disabled={isProcessing}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    isProcessing
                      ? isDark
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark
                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Process Selected'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {queueApplications.slice(0, 5).map((application) => (
              <div
                key={application.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  selectedApplications.includes(application.id)
                    ? isDark
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-100 border-gray-300'
                    : isDark
                      ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } cursor-pointer`}
                onClick={() => handleSelectApplication(application.id)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application.id)}
                    onChange={() => handleSelectApplication(application.id)}
                    className="rounded text-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img 
                    src={application.avatar} 
                    alt={application.name}
                    className="w-8 h-8 rounded-full object-cover"
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
                  <span className={`px-2 py-1 rounded-full text-xs border ${
                    application.stage === 'financial-aid' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {application.stage.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {queueApplications.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">No pending applications</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Queues */}
      <div>
        {/* Pending Applications Queue */}


        {/* Recently Processed */}
        <div className={`border rounded-xl p-6 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recently Processed
            </h3>
            <button
              onClick={onNavigateToProcessed}
              className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {processedApplications.slice(0, 5).map((application) => (
              <div
                key={application.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-900/50 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={application.avatar} 
                    alt={application.name}
                    className="w-8 h-8 rounded-full object-cover"
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
                  {application.riskScore && (
                    <span className={`text-xs font-mono ${
                      application.riskScore >= 80 
                        ? 'text-red-500' 
                        : application.riskScore >= 50 
                          ? 'text-yellow-500' 
                          : 'text-green-500'
                    }`}>
                      {application.riskScore}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs border ${
                    application.status === 'approved'
                      ? isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
                      : application.status === 'rejected'
                        ? isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
                        : isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {processedApplications.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm">No processed applications</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Widget Button */}
      <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-10">
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg transition-all"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        ) : null}
      </div>

      {/* Chat Widget Popup */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-20 w-[350px] h-[500px] rounded-lg shadow-xl overflow-hidden">
          <div className="w-full h-full flex flex-col">
            <div className={`p-3 flex justify-between items-center ${isDark ? 'bg-gray-900' : 'bg-purple-600'}`}>
              <h3 className="text-white font-medium">AI Assistant</h3>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white"
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
