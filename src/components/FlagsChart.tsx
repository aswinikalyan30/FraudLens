import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FlagsChart: React.FC = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([
    { day: 'Mon', applications: 45, flags: 12 },
    { day: 'Tue', applications: 52, flags: 18 },
    { day: 'Wed', applications: 38, flags: 8 },
    { day: 'Thu', applications: 61, flags: 22 },
    { day: 'Fri', applications: 48, flags: 15 },
    { day: 'Sat', applications: 29, flags: 6 },
    { day: 'Sun', applications: 35, flags: 9 }
  ]);
  
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        applications: Math.max(10, item.applications + Math.floor(Math.random() * 10 - 5)),
        flags: Math.max(0, item.flags + Math.floor(Math.random() * 6 - 3))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const maxApplications = Math.max(...data.map(d => d.applications));
  const maxFlags = Math.max(...data.map(d => d.flags));
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
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <TrendingUp className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span>Application Trends</span>
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last 7 days activity
          </p>
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
          
          {/* Applications line */}
          <path
            d={data.map((item, index) => {
              const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
              const y = chartHeight - (item.applications / maxApplications) * chartHeight + padding;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#d7b1ffff"
            strokeWidth="3"
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
            stroke="#cf8888ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
            const yApps = chartHeight - (item.applications / maxApplications) * chartHeight + padding;
            const yFlags = chartHeight - (item.flags / maxFlags) * chartHeight + padding;
            const isHovered = hoveredPoint === index;
            
            return (
              <g key={item.day}>
                {/* Applications point */}
                <circle
                  cx={x}
                  cy={yApps}
                  r={isHovered ? 6 : 4}
                  fill="#7100EB"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 drop-shadow-sm"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Flags point */}
                <circle
                  cx={x}
                  cy={yFlags}
                  r={isHovered ? 5 : 3}
                  fill="#D42828"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 drop-shadow-sm"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 35}
                      y={yApps - 50}
                      width="70"
                      height="35"
                      rx="4"
                      fill={isDark ? '#1f2937' : '#ffffff'}
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      className="drop-shadow-lg"
                    />
                    <text
                      x={x}
                      y={yApps - 35}
                      textAnchor="middle"
                      className={`text-xs font-medium ${isDark ? 'fill-white' : 'fill-gray-900'}`}
                    >
                      Apps: {item.applications}
                    </text>
                    <text
                      x={x}
                      y={yApps - 22}
                      textAnchor="middle"
                      className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
                    >
                      Flags: {item.flags}
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
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-purple-600 rounded"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Applications
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-red-600 rounded"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Flags
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagsChart;