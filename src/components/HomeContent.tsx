import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  X,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useNotifications } from '../contexts/NotificationContext';
import FlagsChart from './FlagsChart';
import ChatAgent from './ChatAgent';
import UserProfile from './UserProfile';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);

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

  // Advanced Performance Metrics (Mock Data - in real app would come from API)
  const performanceMetrics = {
    investigatorPerformance: {
      individualProductivity: 87.5, // percentage
      teamAverage: 82.3,
      casesPerDay: 12.4,
      trend: '+5.2%'
    },
    accuracyMetrics: {
      falsePositiveRate: 2.1, // percentage
      falseNegativeRate: 1.3,
      overallAccuracy: 96.6,
      improvement: '+1.2%'
    },
    resolutionTime: {
      avgResolutionHours: 18.7,
      byComplexity: {
        simple: 8.2,
        medium: 16.5,
        complex: 32.1
      },
      trend: '-12%'
    },
    roiMetrics: {
      fraudPrevented: 485000, // dollars
      operationalCost: 125000,
      roi: 288, // percentage
      costBenefit: 3.88 // ratio
    }
  };

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
              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <Users className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
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
              isDark ? 'bg-green-500/10' : 'bg-green-50'
            }`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
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
        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <h3 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Performance Insights
          </h3>
          <div className="space-y-2">
            {/* Individual Performance */}
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Productivity
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  performanceMetrics.investigatorPerformance.individualProductivity > performanceMetrics.investigatorPerformance.teamAverage
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {performanceMetrics.investigatorPerformance.trend}
                </span>
              </div>
              <div className="flex items-end gap-1">
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {performanceMetrics.investigatorPerformance.individualProductivity}%
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  vs {performanceMetrics.investigatorPerformance.teamAverage}% team avg
                </div>
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {performanceMetrics.investigatorPerformance.casesPerDay} cases/day
                </span>
                <span className={performanceMetrics.investigatorPerformance.individualProductivity > performanceMetrics.investigatorPerformance.teamAverage ? 'text-green-600' : 'text-yellow-600'}>
                  {performanceMetrics.investigatorPerformance.individualProductivity > performanceMetrics.investigatorPerformance.teamAverage ? 'Above Average' : 'On Track'}
                </span>
              </div>
            </div>

            {/* Accuracy Metrics */}
            <div className={`p-1 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Detection Accuracy
                </span>
                <span className="text-xs px-1 py-1 rounded-full bg-green-100 text-green-700">
                  {performanceMetrics.accuracyMetrics.improvement}
                </span>
              </div>
              <div className={`text-md font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {performanceMetrics.accuracyMetrics.overallAccuracy}%
              </div>
              <div className="space-y-0.2 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>False Positive</span>
                  <span className="text-red-600">{performanceMetrics.accuracyMetrics.falsePositiveRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>False Negative</span>
                  <span className="text-orange-600">{performanceMetrics.accuracyMetrics.falseNegativeRate}%</span>
                </div>
              </div>
            </div>

            {/* ROI Quick View */}
            <div className={`p-1 rounded-lg border-l-4 border-green-500 ${
              isDark ? 'bg-green-900/10' : 'bg-green-50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  ROI This Month
                </span>
                <span className="text-xs text-green-600 font-medium">
                  {performanceMetrics.roiMetrics.roi}%
                </span>
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-semibold">
                  ${(performanceMetrics.roiMetrics.fraudPrevented / 1000).toFixed(0)}K
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {' '}prevented
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Dashboard - Collapsible */}
      <div className={`rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        {/* Header - Always Visible */}
        <div className="p-4 flex items-center justify-between border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Advanced Performance Analytics
            </h3>
            <div className="flex items-center gap-4 text-sm">
              {/* Key Performance Indicators - Always Visible */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>
                  {performanceMetrics.resolutionTime.avgResolutionHours}h avg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {performanceMetrics.accuracyMetrics.overallAccuracy}% accuracy
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>
                  {performanceMetrics.roiMetrics.roi}% ROI
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isAnalyticsExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>View Details</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        {isAnalyticsExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Resolution Time Analytics */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Resolution Time
                  </h4>
                </div>
                <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {performanceMetrics.resolutionTime.avgResolutionHours}h
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Simple Cases</span>
                    <span className="text-green-600">{performanceMetrics.resolutionTime.byComplexity.simple}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Medium Cases</span>
                    <span className="text-yellow-600">{performanceMetrics.resolutionTime.byComplexity.medium}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complex Cases</span>
                    <span className="text-red-600">{performanceMetrics.resolutionTime.byComplexity.complex}h</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Trend</span>
                    <span className="text-green-600 font-medium">{performanceMetrics.resolutionTime.trend}</span>
                  </div>
                </div>
              </div>

              {/* Accuracy Analysis */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Accuracy Analysis
                  </h4>
                </div>
                <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {performanceMetrics.accuracyMetrics.overallAccuracy}%
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600" 
                        style={{ width: `${performanceMetrics.accuracyMetrics.overallAccuracy}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      {performanceMetrics.accuracyMetrics.overallAccuracy}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 rounded">
                      <div className="text-red-600 font-medium">FP: {performanceMetrics.accuracyMetrics.falsePositiveRate}%</div>
                    </div>
                    <div className="text-center p-2 rounded">
                      <div className="text-orange-600 font-medium">FN: {performanceMetrics.accuracyMetrics.falseNegativeRate}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Analysis */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ROI Analysis
                  </h4>
                </div>
                <div className={`text-2xl font-bold mb-2 text-green-600`}>
                  {performanceMetrics.roiMetrics.roi}%
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Fraud Prevented</span>
                    <span className="text-green-600 font-medium">
                      ${(performanceMetrics.roiMetrics.fraudPrevented / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Operational Cost</span>
                    <span className="text-gray-600">
                      ${(performanceMetrics.roiMetrics.operationalCost / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-300 dark:border-gray-600">
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cost-Benefit Ratio</span>
                    <span className="text-green-600 font-bold">
                      {performanceMetrics.roiMetrics.costBenefit}:1
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Performance Comparison */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Team Performance
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>You</span>
                      <span className="text-xs font-medium text-green-600">
                        {performanceMetrics.investigatorPerformance.individualProductivity}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${performanceMetrics.investigatorPerformance.individualProductivity}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Team Average</span>
                      <span className="text-xs font-medium text-purple-600">
                        {performanceMetrics.investigatorPerformance.teamAverage}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${performanceMetrics.investigatorPerformance.teamAverage}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Rank</span>
                      <span className="text-green-600 font-medium">#3 of 12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights and Recommendations - Only shown when expanded */}
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI-Powered Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg border-l-4 border-purple-500 ${
                  isDark ? 'bg-purple-900/10' : 'bg-purple-50'
                }`}>
                  <div className="text-xs font-medium text-purple-600 mb-1">EFFICIENCY</div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Focus on medium complexity cases to improve resolution time by 15%
                  </p>
                </div>
                <div className={`p-3 rounded-lg border-l-4 border-green-500 ${
                  isDark ? 'bg-green-900/10' : 'bg-green-50'
                }`}>
                  <div className="text-xs font-medium text-green-600 mb-1">ACCURACY</div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Review financial aid patterns to reduce false positives
                  </p>
                </div>
                <div className={`p-3 rounded-lg border-l-4 border-purple-500 ${
                  isDark ? 'bg-purple-900/10' : 'bg-purple-50'
                }`}>
                  <div className="text-xs font-medium text-purple-600 mb-1">LEARNING</div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Consider advanced training on international application patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
              className={`text-sm hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
            >
              View All
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className={`mb-4 p-4 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-purple-700'}`}>
                  {selectedApplications.length} selected
                </span>
                <button
                  onClick={handleBulkProcess}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
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
                      ? 'bg-purple-900/30 border-purple-500/50'
                      : 'bg-purple-50 border-purple-300'
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
                    className="rounded text-purple-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(true);
                    }}
                    className="flex-shrink-0 transition-transform hover:scale-105"
                  >
                    <img 
                      src={application.avatar} 
                      alt={application.name}
                      className="w-5 h-5 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                    />
                  </button>
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
                      ? isDark ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'
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
              className={`text-sm hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(true);
                      }}
                      className="flex-shrink-0 transition-transform hover:scale-105"
                    >
                      <img 
                        src={application.avatar} 
                        alt={application.name}
                        className="w-5 h-5 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />
                    </button>
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
      
      {/* User Profile Modal */}
      <UserProfile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default HomeContent;
