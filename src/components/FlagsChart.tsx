import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FlagsChart: React.FC = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([
    { day: 'Mon', flags: 45, date: '2024-01-08' },
    { day: 'Tue', flags: 52, date: '2024-01-09' },
    { day: 'Wed', flags: 38, date: '2024-01-10' },
    { day: 'Thu', flags: 61, date: '2024-01-11' },
    { day: 'Fri', flags: 48, date: '2024-01-12' },
    { day: 'Sat', flags: 29, date: '2024-01-13' },
    { day: 'Sun', flags: 35, date: '2024-01-14' }
  ]);
  
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        flags: Math.max(10, item.flags + Math.floor(Math.random() * 10 - 5))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxFlags = Math.max(...data.map(d => d.flags));
  const minFlags = Math.min(...data.map(d => d.flags));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  return (
    <div className={`border rounded-xl p-6 ${
      isDark 
        ? 'bg-gray-800 border-gray-700 shadow-lg' 
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <span>Fraud Risk Trends (Last 7 Days)</span>
        </h3>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Total: {data.reduce((sum, d) => sum + d.flags, 0)}
        </div>
      </div>
      
      <div className="relative" style={{ height: chartHeight + 80 }}>
        <svg 
          width="100%" 
          height={chartHeight + 80}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = chartHeight - (percent / 100) * chartHeight + padding;
            return (
              <line
                key={percent}
                x1={padding}
                y1={y}
                x2="100%"
                y2={y}
                stroke={isDark ? '#374151' : '#e5e7eb'}
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}
          
          {/* Line path */}
          <path
            d={data.map((item, index) => {
              const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
              const y = chartHeight - ((item.flags - minFlags) / (maxFlags - minFlags)) * chartHeight + padding;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7100EB" />
              <stop offset="100%" stopColor="#51ABFF" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
            const y = chartHeight - ((item.flags - minFlags) / (maxFlags - minFlags)) * chartHeight + padding;
            const isHovered = hoveredPoint === index;
            
            return (
              <g key={item.day}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#7100EB' : '#ffffff'}
                  stroke="#7100EB"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 drop-shadow-sm"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 25}
                      y={y - 35}
                      width="50"
                      height="25"
                      rx="4"
                      fill={isDark ? '#1f2937' : '#ffffff'}
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      className="drop-shadow-lg"
                    />
                    <text
                      x={x}
                      y={y - 18}
                      textAnchor="middle"
                      className={`text-xs font-medium ${isDark ? 'fill-white' : 'fill-gray-900'}`}
                    >
                      {item.flags}
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
                key={item.day}
                x={x}
                y={chartHeight + padding + 20}
                textAnchor="middle"
                className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
              >
                {item.day}
              </text>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Fraud Cases Detected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagsChart;