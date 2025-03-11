// src/components/ScatterChart.js
import React, { useState } from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const ScatterChart = ({ data, metric }) => {
  const { accentColor, isDarkMode } = useTheme();
  const [activePoint, setActivePoint] = useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }
  
  // Prepare data for scatter chart (mapping selected metric vs area)
  const scatterData = data
    .filter(item => {
      const metricValue = parseFloat(item[metric]);
      const areaValue = parseFloat(item.MetriPartrati_InMedie);
      return !isNaN(metricValue) && !isNaN(areaValue) && item.ZonăApartament;
    })
    .map((item, index) => ({
      x: parseFloat(item.MetriPartrati_InMedie),
      y: parseFloat(item[metric]),
      z: parseFloat(item.NumarAnunturi) || 1,
      name: item.ZonăApartament.replace('Timisoara, zona ', ''),
      id: index
    }));
  
  if (scatterData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Insufficient data for correlation</p>
        </div>
      </div>
    );
  }
  
  // Find min and max values for axes
  const xMin = Math.min(...scatterData.map(item => item.x));
  const xMax = Math.max(...scatterData.map(item => item.x));
  const yMin = Math.min(...scatterData.map(item => item.y));
  const yMax = Math.max(...scatterData.map(item => item.y));
  
  // Add some padding to axis ranges
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xPadding = Math.max(5, xRange * 0.1);
  const yPadding = Math.max(10, yRange * 0.1);
  
  // Get linear regression line data
  const getLinearRegressionLine = () => {
    const n = scatterData.length;
    if (n < 2) return [];
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    scatterData.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return [
      { x: xMin - xPadding, y: slope * (xMin - xPadding) + intercept },
      { x: xMax + xPadding, y: slope * (xMax + xPadding) + intercept }
    ];
  };
  
  const regressionLine = getLinearRegressionLine();
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{payload[0].payload.name}</p>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Average Area:</span>
              <span className="font-medium ml-4">{payload[0].payload.x.toLocaleString()} m²</span>
            </div>
            <div className="flex justify-between">
              <span>{metric}:</span>
              <span className="font-medium ml-4">
                {metric.includes('Pret') ? `€${payload[0].payload.y.toLocaleString()}` : payload[0].payload.y.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Listings:</span>
              <span className="font-medium ml-4">{payload[0].payload.z.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Convert hex color to rgba
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
        />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Average Area (m²)" 
          domain={[Math.max(0, xMin - xPadding), xMax + xPadding]}
          tick={{ 
            fill: isDarkMode ? '#9ca3af' : '#6b7280' 
          }}
          stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
          label={{ 
            value: 'Average Area (m²)', 
            position: 'insideBottom', 
            offset: -10,
            fill: isDarkMode ? '#d1d5db' : '#4b5563'
          }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name={metric} 
          domain={[Math.max(0, yMin - yPadding), yMax + yPadding]}
          tick={{ 
            fill: isDarkMode ? '#9ca3af' : '#6b7280' 
          }}
          stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
          label={{ 
            value: metric.includes('Pret') ? `${metric} (€)` : metric, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' },
            fill: isDarkMode ? '#d1d5db' : '#4b5563'
          }}
          tickFormatter={(value) => metric.includes('Pret') ? `€${value}` : value}
        />
        <ZAxis type="number" dataKey="z" range={[60, 300]} name="Listings" />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ 
            strokeDasharray: '3 3', 
            stroke: isDarkMode ? '#6b7280' : '#9ca3af' 
          }} 
        />
        <Legend
          content={() => (
            <div className="flex justify-center items-center mt-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs flex items-center">
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: accentColor }}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  Zone Data
                </span>
              </div>
            </div>
          )}
        />
        
        {/* Regression Line */}
        <Scatter
          name="Trend Line"
          data={regressionLine}
          line={{ stroke: isDarkMode ? '#6b7280' : '#9ca3af', strokeDasharray: '5 5' }}
          shape={() => null}
          legendType="none"
        />
        
        {/* Main Scatter */}
        <Scatter 
          name="Zones" 
          data={scatterData} 
          fillOpacity={0.8}
          fill={accentColor}
          stroke={isDarkMode ? '#1f2937' : '#ffffff'}
          strokeWidth={1}
          animationDuration={1000}
          onMouseOver={(data) => setActivePoint(data.id)}
          onMouseLeave={() => setActivePoint(null)}
          shape={props => {
            const { cx, cy, r, id } = props;
            return (
              <circle 
                cx={cx} 
                cy={cy} 
                r={activePoint === id ? r * 1.2 : r} 
                fill={activePoint === id ? hexToRgba(accentColor, 1) : hexToRgba(accentColor, 0.8)}
                stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                strokeWidth={1}
                style={{
                  transition: 'r 0.2s',
                  filter: activePoint === id ? 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' : 'none'
                }}
              />
            );
          }}
        />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChart;