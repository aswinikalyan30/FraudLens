import React from 'react';
import { Clock, Target, TrendingUp, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ReportingDashboard: React.FC = () => {
  const { isDark } = useTheme();

  // Mock metrics; in a real app these would come from API/state
  const performanceMetrics = {
    investigatorPerformance: {
      individualProductivity: 87.5,
      teamAverage: 82.3,
      casesPerDay: 12.4,
      trend: '+5.2%'
    },
    accuracyMetrics: {
      falsePositiveRate: 2.1,
      falseNegativeRate: 1.3,
      overallAccuracy: 96.6,
      improvement: '+1.2%'
    },
    resolutionTime: {
      avgResolutionHours: 18.7,
      byComplexity: { simple: 8.2, medium: 16.5, complex: 32.1 },
      trend: '-12%'
    },
    roiMetrics: { fraudPrevented: 485000, operationalCost: 125000, roi: 288, costBenefit: 3.88 }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reporting & Advanced Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Resolution Time</h4>
          </div>
          <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{performanceMetrics.resolutionTime.avgResolutionHours}h</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Simple</span><span>{performanceMetrics.resolutionTime.byComplexity.simple}h</span></div>
            <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Medium</span><span>{performanceMetrics.resolutionTime.byComplexity.medium}h</span></div>
            <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complex</span><span>{performanceMetrics.resolutionTime.byComplexity.complex}h</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 text-xs">
            <span className="text-green-500">{performanceMetrics.resolutionTime.trend}</span> vs last period
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Accuracy</h4>
          </div>
          <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{performanceMetrics.accuracyMetrics.overallAccuracy}%</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>False Positive</div>
              <div className="font-semibold">{performanceMetrics.accuracyMetrics.falsePositiveRate}%</div>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>False Negative</div>
              <div className="font-semibold">{performanceMetrics.accuracyMetrics.falseNegativeRate}%</div>
            </div>
          </div>
          <div className="mt-3 text-xs"><span className="text-green-500">{performanceMetrics.accuracyMetrics.improvement}</span> improvement</div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>ROI</h4>
          </div>
          <div className={`text-2xl font-bold mb-2 text-green-600`}>{performanceMetrics.roiMetrics.roi}%</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Fraud Prevented</span><span>${performanceMetrics.roiMetrics.fraudPrevented.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Operational Cost</span><span>${performanceMetrics.roiMetrics.operationalCost.toLocaleString()}</span></div>
            <div className="flex justify-between pt-1 border-t border-gray-300 dark:border-gray-600"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cost Benefit</span><span>{performanceMetrics.roiMetrics.costBenefit}x</span></div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-indigo-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Team Performance</h4>
          </div>
          <div className="space-y-3">
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
              <div className="h-full bg-blue-500" style={{ width: `${performanceMetrics.investigatorPerformance.individualProductivity}%` }} />
            </div>
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
              <div className="h-full bg-green-500" style={{ width: `${performanceMetrics.investigatorPerformance.teamAverage}%` }} />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-300 dark:border-gray-600 text-xs">
            <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cases/Day</span><span>{performanceMetrics.investigatorPerformance.casesPerDay}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
        <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI-Powered Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
            <div className="text-xs font-medium text-blue-600 mb-1">EFFICIENCY</div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Focus on medium complexity cases to improve resolution time by 15%</p>
          </div>
          <div className={`p-3 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/10' : 'bg-green-50'}`}>
            <div className="text-xs font-medium text-green-600 mb-1">ACCURACY</div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Review financial aid patterns to reduce false positives</p>
          </div>
          <div className={`p-3 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
            <div className="text-xs font-medium text-blue-600 mb-1">LEARNING</div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Consider advanced training on international application patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingDashboard;
