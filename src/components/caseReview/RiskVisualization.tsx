import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';

interface RiskVisualizationProps {
  score: number;
  trend?: number[]; // historical scores
  similarAverage?: number; // average of similar applications
  breakdown?: { label: string; value: number }[]; // contributions
  isDark: boolean;
}

const RiskVisualization: React.FC<RiskVisualizationProps> = ({ score, trend = [], similarAverage, breakdown = [], isDark }) => {
  const level = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';
//   const gaugeColor = level === 'High' ? 'from-red-500 to-red-600' : level === 'Medium' ? 'from-orange-500 to-orange-600' : 'from-green-500 to-green-600';

  return (
    <CollapsibleSection title="Risk Analysis" defaultOpen>
      <div className="space-y-4">
        {/* Gauge */}
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-32 h-32">
              <path
                className="text-gray-300"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-700 ease-out`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${score}, 100`}
                stroke="url(#riskGradient)"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={level === 'High' ? '#ef4444' : level === 'Medium' ? '#f97316' : '#22c55e'} />
                  <stop offset="100%" stopColor={level === 'High' ? '#b91c1c' : level === 'Medium' ? '#c2410c' : '#15803d'} />
                </linearGradient>
              </defs>
              <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className={`text-sm font-semibold ${level === 'High' ? 'fill-red-600' : level === 'Medium' ? 'fill-orange-600' : 'fill-green-600'}`}>{score}</text>
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className={`w-4 h-4 ${level === 'High' ? 'text-red-500' : level === 'Medium' ? 'text-orange-500' : 'text-green-500'}`} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                This application is considered <strong>{level} risk</strong> based on current indicators.
              </span>
            </div>
            {similarAverage !== undefined && (
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Similar applications average: <span className="font-medium">{similarAverage}</span>
                {score - (similarAverage || 0) > 0 && (
                  <span className="ml-1 text-red-500">(+{score - similarAverage})</span>
                )}
              </div>
            )}
            {trend.length > 0 && (
              <div className="text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recent trend: {trend.join(' → ')}</span>
              </div>
            )}
          </div>
        </div>
        {/* Breakdown */}
        {breakdown.length > 0 && (
          <div className="space-y-2">
            <div className={`text-[11px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Risk Factor Breakdown</div>
            <div className="space-y-1">
              {breakdown.map(b => (
                <div key={b.label} className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={`h-full ${
                      b.value >= 30 ? 'bg-red-500' : b.value >= 15 ? 'bg-orange-500' : 'bg-green-500'
                    }`} style={{ width: `${b.value}%` }} />
                  </div>
                  <span className={`text-[10px] w-24 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{b.label}</span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{b.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default RiskVisualization;
