import React from 'react';
import { Shield, Brain } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';

interface SummaryCardProps {
  aiRecommendation: { summary: string; confidence: number };
  isDark: boolean;
  confidenceProgress: number;
  setConfidenceProgress: (v: number) => void;
  isGenerating: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ aiRecommendation, isDark, confidenceProgress }) => {
  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-base font-semibold mb-3 flex items-center space-x-2`}>
        <Shield className="w-4 h-4" />
        <span>AI Summary</span>
      </h3>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}> <Brain className={`${isDark ? 'text-purple-400' : 'text-purple-600'} w-4 h-4`} /> </div>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{aiRecommendation.summary}</p>
      </div>
      {/* Inline Confidence Gauge */}
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confidence:</span>
        <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full confidence-bar"
            style={{ width: `${confidenceProgress}%` }}
            role="progressbar"
            aria-valuenow={confidenceProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Confidence level: ${confidenceProgress}%`}
          />
        </div>
        <span className={`text-sm font-bold min-w-[3rem] ${
          confidenceProgress >= 80 ? 'text-red-600' : 
          confidenceProgress >= 60 ? 'text-orange-600' : 'text-green-600'
        }`}>
          {confidenceProgress}%
        </span>
      </div>
    </div>
  );
};

export default SummaryCard;
