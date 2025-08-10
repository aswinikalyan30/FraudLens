import React from 'react';
import { Brain, Target, TrendingUp, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';

interface SummaryCardProps {
  aiRecommendation: { summary: string; confidence: number };
  isDark: boolean;
  confidenceProgress: number;
  setConfidenceProgress: (v: number) => void;
  isGenerating: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ isDark, confidenceProgress }) => {
  // Generate smart suggestions based on common fraud patterns
  const suggestions = [
    {
      type: 'document',
      icon: <Target className="w-4 h-4" />,
      title: 'Suggested Documents',
      content: 'Based on the essay similarity flag, consider requesting handwritten samples',
      priority: 'high'
    },
    {
      type: 'prediction',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Success Prediction',
      content: 'This request type resolves 87% of similar cases',
      priority: 'medium'
    },
    {
      type: 'alternative',
      icon: <Lightbulb className="w-4 h-4" />,
      title: 'Alternative Options',
      content: 'If phone verification fails, try video interview',
      priority: 'low'
    }
  ];

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-base font-semibold mb-4 flex items-center space-x-2`}>
        <Brain className="w-4 h-4" />
        <span>AI-Powered Suggestions</span>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
          isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
        }`}>
          {confidenceProgress}% confident
        </span>
      </h3>

      {/* AI Suggestions Grid */}
      <div className="space-y-3">
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
                <h4 className={`text-sm font-semibold mb-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {suggestion.title}
                </h4>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {suggestion.content}
                </p>
              </div>

              {/* Action indicator */}
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>

            {/* Priority indicator */}
            <div className="flex items-center justify-between mt-2">
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
                  <span className="text-xs text-green-600 font-medium">87% success</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Confidence Bar */}
      <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            AI Confidence:
          </span>
          <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full confidence-bar transition-all duration-500"
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
        
        {/* Confidence description */}
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {confidenceProgress >= 80 
            ? 'High confidence - AI recommendations are highly reliable'
            : confidenceProgress >= 60
            ? 'Medium confidence - Consider manual review alongside AI suggestions'
            : 'Low confidence - Manual review strongly recommended'
          }
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
