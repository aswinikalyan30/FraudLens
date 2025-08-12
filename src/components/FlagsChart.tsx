import React, { useState, useEffect } from 'react';
import { MoreVertical, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FlagsChart: React.FC<{ onNavigateToReporting?: () => void; compact?: boolean }> = ({ onNavigateToReporting, compact = false }) => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showOptions, setShowOptions] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const [data, setData] = useState([
    { day: 'Mon', applications: 45, flags: 12, flagRate: 26.7 },
    { day: 'Tue', applications: 52, flags: 18, flagRate: 34.6 },
    { day: 'Wed', applications: 38, flags: 8, flagRate: 21.1 },
    { day: 'Thu', applications: 61, flags: 22, flagRate: 36.1 },
    { day: 'Fri', applications: 48, flags: 15, flagRate: 31.3 },
    { day: 'Sat', applications: 29, flags: 6, flagRate: 20.7 },
    { day: 'Sun', applications: 35, flags: 9, flagRate: 25.7 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        const newApplications = Math.max(10, item.applications + Math.floor(Math.random() * 10 - 5));
        const newFlags = Math.max(0, item.flags + Math.floor(Math.random() * 6 - 3));
        return {
          ...item,
          applications: newApplications,
          flags: newFlags,
          flagRate: newApplications > 0 ? (newFlags / newApplications) * 100 : 0
        };
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const maxApplications = Math.max(...data.map(d => d.applications));
  const maxFlags = Math.max(...data.map(d => d.flags));
  // const avgFlagRate = data.reduce((sum, item) => sum + item.flagRate, 0) / data.length;
  const totalApplications = data.reduce((sum, item) => sum + item.applications, 0);
  const totalFlags = data.reduce((sum, item) => sum + item.flags, 0);
  
  const chartHeight = compact ? 110 : 160;
  const chartWidth = 400;
  const padding = 30;

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' }
  ];

  return (
    <div className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} ${
      isDark 
        ? 'bg-gray-800 border-gray-700 shadow-lg' 
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header with controls */}
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <div>
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-gray-500/10' : 'bg-gray-50'
              }`}>
                <BarChart3 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              Application Trends
            </h3>
            {!compact && (
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Detection patterns and volumes
              </p>
            )}
          </div>
          
          {/* Quick stats */}
          {!compact && (
            <div className="flex items-center gap-3 ml-4">
              <div className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Flag Rate</div>
                
              </div>
              <div className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Processed</div>
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalApplications}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Time range and options */}
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className={`px-2 py-1 rounded-lg border text-xs ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {!compact && (
            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className={`p-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showOptions && (
                <div className={`absolute right-0 top-12 w-48 rounded-lg border shadow-lg z-10 ${
                  isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-2">
                    <button className={`w-full text-left px-3 py-2 rounded-md text-sm hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    } transition-colors`}>
                      Export Data
                    </button>
                    <button className={`w-full text-left px-3 py-2 rounded-md text-sm hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    } transition-colors`}>
                      Configure Alerts
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chart container */}
      <div className={`flex items-start ${compact ? 'gap-3' : 'gap-4'}`}>
        {/* Chart */}
        <div
          className={`flex-1 relative ${onNavigateToReporting ? 'group cursor-pointer' : ''}`}
          style={{ height: chartHeight + 40 }}
          onClick={() => onNavigateToReporting && onNavigateToReporting()}
          title={onNavigateToReporting ? 'Click to open Reporting & Analytics' : undefined}
        >
          {onNavigateToReporting && (
            <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-5 bg-gray-500 transition-opacity pointer-events-none" />
          )}
          <svg 
            width="100%" 
            height={chartHeight + 40}
            className="overflow-visible"
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = chartHeight - (percent / 100) * chartHeight + padding;
              return (
                <g key={percent}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={`calc(100% - 60px)`}
                    y2={y}
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                  {!compact && (
                    <text
                      x={padding - 10}
                      y={y + 4}
                      textAnchor="end"
                      className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-500'}`}
                    >
                      {Math.round((percent / 100) * maxApplications)}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Applications line */}
            <path
              d={data.map((item, index) => {
                const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
                const y = chartHeight - (item.applications / maxApplications) * chartHeight + padding;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#838dcfff"
              strokeWidth={compact ? 2 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Flags line */}
            <path
              d={data.map((item, index) => {
                const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
                const y = chartHeight - (item.flags / maxFlags) * chartHeight + padding;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth={compact ? 1.5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            
            {/* Interactive data points */}
            {data.map((item, index) => {
              const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
              const yApps = chartHeight - (item.applications / maxApplications) * chartHeight + padding;
              const yFlags = chartHeight - (item.flags / maxFlags) * chartHeight + padding;
              const isHovered = hoveredPoint === index;
              
              return (
                <g key={`${item.day}-${index}`}>
                  {/* Applications point */}
                  <circle
                    cx={x}
                    cy={yApps}
                    r={isHovered ? (compact ? 4.5 : 6) : (compact ? 3.5 : 4)}
                    fill="#1537b4ff"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className={`transition-all duration-200 drop-shadow-sm ${compact ? '' : 'cursor-pointer'}`}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  
                  {/* Flags point */}
                  <circle
                    cx={x}
                    cy={yFlags}
                    r={isHovered ? (compact ? 3.5 : 5) : (compact ? 2.5 : 3)}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className={`transition-all duration-200 drop-shadow-sm ${compact ? '' : 'cursor-pointer'}`}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {!compact && isHovered && (
                    <g>
                      <rect
                        x={x - 50}
                        y={Math.min(yApps, yFlags) - 70}
                        width="100"
                        height="55"
                        rx="6"
                        fill={isDark ? '#1f2937' : '#ffffff'}
                        stroke={isDark ? '#374151' : '#e5e7eb'}
                        strokeWidth="1"
                        className="drop-shadow-xl"
                      />
                      <text
                        x={x}
                        y={Math.min(yApps, yFlags) - 50}
                        textAnchor="middle"
                        className={`text-xs font-semibold ${isDark ? 'fill-white' : 'fill-gray-900'}`}
                      >
                        {item.day}
                      </text>
                      <text
                        x={x}
                        y={Math.min(yApps, yFlags) - 35}
                        textAnchor="middle"
                        className={`text-xs ${isDark ? 'fill-gray-300' : 'fill-gray-700'}`}
                      >
                        Apps: {item.applications}
                      </text>
                      <text
                        x={x}
                        y={Math.min(yApps, yFlags) - 22}
                        textAnchor="middle"
                        className="text-xs fill-red-500"
                      >
                        Flags: {item.flags} ({item.flagRate.toFixed(1)}%)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* X-axis labels */}
            {data.map((item, index) => {
              const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
              return (
                <text
                  key={`label-${item.day}`}
                  x={x}
                  y={chartHeight + padding + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
                >
                  {item.day}
                </text>
              );
            })}
          </svg>
        </div>
        
        {/* Legend on the right */}
        {!compact ? (
          <div className="flex flex-col gap-4 min-w-[170px] pt-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-4 bg-blue-500 rounded-full"></div>
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Applications
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {totalApplications} total
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-red-500 rounded-full"></div>
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Flagged
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {totalFlags} total
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Compact legend below chart */
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-1 bg-blue-500 rounded-full"></div>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Apps ({totalApplications})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-1 bg-red-500 rounded-full"></div>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Flags ({totalFlags})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlagsChart;
