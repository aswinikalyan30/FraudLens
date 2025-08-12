import React, { useState } from 'react';
import { Brain, Target, TrendingUp, ArrowRight, CheckCircle, Lightbulb, BarChart3, AlertCircle, Trophy, Zap, ChevronRight, ChevronDown } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';

interface RiskFactor {
  id: string;
  name: string;
  weight: number;
  points: number;
  description: string;
  category: 'high' | 'medium' | 'low';
}

interface SummaryCardProps {
  aiRecommendation: { summary: string; confidence: number };
  isDark: boolean;
  confidenceProgress: number;
  setConfidenceProgress: (v: number) => void;
  isGenerating: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ isDark, confidenceProgress }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Enhanced risk factor breakdown with detailed weights
  const riskFactors: RiskFactor[] = [
    {
      id: 'essay_similarity',
      name: 'Essay Similarity',
      weight: 0.37,
      points: 35,
      description: 'High similarity detected with known fraudulent applications',
      category: 'high'
    },
    {
      id: 'email_age',
      name: 'Email Account Age',
      weight: 0.21,
      points: 20,
      description: 'Email account created recently (less than 30 days)',
      category: 'medium'
    },
    {
      id: 'velocity_check',
      name: 'Application Velocity',
      weight: 0.16,
      points: 15,
      description: 'Multiple applications submitted in short timeframe',
      category: 'medium'
    },
    {
      id: 'device_fingerprint',
      name: 'Device Fingerprint',
      weight: 0.15,
      points: 14,
      description: 'Shared device used across multiple applications',
      category: 'medium'
    },
    {
      id: 'address_verification',
      name: 'Address Verification',
      weight: 0.11,
      points: 11,
      description: 'Address verification failed or incomplete',
      category: 'low'
    }
  ];

  const totalRiskScore = riskFactors.reduce((sum, factor) => sum + factor.points, 0);
  
  // Historical accuracy and confidence intervals
  const historicalData = {
    accuracy: 87,
    totalCases: 2847,
    confidenceInterval: { lower: 83, upper: 91 },
    falsePositiveRate: 8.2,
    falseNegativeRate: 4.8
  };

  // Generate smart suggestions based on common fraud patterns
  const suggestions = [
    {
      type: 'document',
      icon: <Target className="w-4 h-4" />,
      title: 'Suggested Documents',
      content: 'Based on the essay similarity flag, consider requesting handwritten samples',
      priority: 'high',
      confidence: 92
    },
    {
      type: 'prediction',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Success Prediction',
      content: 'This request type resolves 87% of similar cases',
      priority: 'medium',
      confidence: 87
    },
    {
      type: 'alternative',
      icon: <Lightbulb className="w-4 h-4" />,
      title: 'Alternative Verification',
      content: 'If phone verification fails, try video interview',
      priority: 'low',
      confidence: 73
    }
  ];

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={toggleCollapse}>
        <h3 className={`text-base font-semibold mb-4 flex items-center space-x-2`}>
          <Brain className="w-4 h-4" />
          <span>AI Risk Analysis</span>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
            isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}>
            {confidenceProgress}% confident
          </span>
        </h3>
        <div
          className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          aria-label="Toggle collapse"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Risk Factor Breakdown */}
          <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4" />
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Risk Factor Weights
              </h4>
              <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
                totalRiskScore >= 80 
                  ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                  : totalRiskScore >= 60
                  ? isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                  : isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                Total: {totalRiskScore} points
              </span>
            </div>
            
            <div className="space-y-3">
              {riskFactors.map((factor) => (
                <div key={factor.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {factor.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        factor.category === 'high'
                          ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                          : factor.category === 'medium'
                          ? isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                          : isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {factor.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        +{factor.points}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({(factor.weight * 100).toFixed(0)}% weight)
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual weight bar */}
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        factor.category === 'high'
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : factor.category === 'medium'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${factor.weight * 100}%` }}
                    />
                  </div>
                  
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Accuracy Section */}
          <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-blue-500" />
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Historical Performance
              </h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Model Accuracy
                  </span>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {historicalData.accuracy}%
                  </span>
                </div>
                <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Confidence: {historicalData.confidenceInterval.lower}%-{historicalData.confidenceInterval.upper}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cases Analyzed
                  </span>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {historicalData.totalCases.toLocaleString()}
                  </span>
                </div>
                <div className={`grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>FP: {historicalData.falsePositiveRate}%</span>
                  <span>FN: {historicalData.falseNegativeRate}%</span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-blue-500" />
                <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  This risk profile has been accurate in {historicalData.accuracy}% of similar cases
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced AI Suggestions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI-Powered Suggestions
              </h4>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  isDark 
                    ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon with priority color */}
                  <div className={`p-1.5 rounded-lg ${
                    suggestion.priority === 'high'
                      ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')
                      : suggestion.priority === 'medium'
                      ? (isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600')
                      : (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600')
                  }`}>
                    {suggestion.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {suggestion.title}
                      </h5>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        suggestion.confidence >= 90
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          : suggestion.confidence >= 80
                          ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                          : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {suggestion.confidence}% confident
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {suggestion.content}
                    </p>
                  </div>

                  {/* Action indicator */}
                  <ArrowRight className={`w-4 h-4 transition-transform hover:translate-x-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>

                {/* Priority and success indicators */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      suggestion.priority === 'high'
                        ? 'bg-red-500'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`} />
                    <span className={`text-xs font-medium capitalize ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {suggestion.priority} Priority
                    </span>
                  </div>

                  {/* Success indicator for predictions */}
                  {suggestion.type === 'prediction' && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">87% success rate</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Confidence Section */}
          <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Overall AI Confidence:
              </span>
              <div className={`flex-1 h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full confidence-bar transition-all duration-500"
                  style={{ width: `${confidenceProgress}%` }}
                  role="progressbar"
                  aria-valuenow={confidenceProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Confidence level: ${confidenceProgress}%`}
                />
              </div>
              <span className={`text-sm font-bold min-w-[3rem] ${
                confidenceProgress >= 80 ? 'text-green-600' : 
                confidenceProgress >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {confidenceProgress}%
              </span>
            </div>
            
            {/* Enhanced confidence description with uncertainty */}
            <div className="space-y-2">
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {confidenceProgress >= 80 
                  ? `High confidence - AI recommendations are highly reliable (±${Math.round((100 - confidenceProgress) / 4)}% margin)`
                  : confidenceProgress >= 60
                  ? `Medium confidence - Consider manual review alongside AI suggestions (±${Math.round((100 - confidenceProgress) / 3)}% margin)`
                  : `Low confidence - Manual review strongly recommended (±${Math.round((100 - confidenceProgress) / 2)}% margin)`
                }
              </p>
              
              {/* Uncertainty visualization */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Uncertainty range:</span>
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.max(0, confidenceProgress - Math.round((100 - confidenceProgress) / 3))}%
                  </span>
                  <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>to</span>
                  <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.min(100, confidenceProgress + Math.round((100 - confidenceProgress) / 3))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryCard;
