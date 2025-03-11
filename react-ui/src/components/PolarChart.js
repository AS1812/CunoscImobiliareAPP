// src/components/PolarChart.js
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const PolarChart = ({ data, metric }) => {
  const { accentColor, isDarkMode } = useTheme();
  
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
  
  // Filter out invalid data and prepare for radar chart
  const chartData = data
    .filter(item => !isNaN(parseFloat(item[metric])) && item.ZonăApartament)
    .sort((a, b) => parseFloat(b[metric]) - parseFloat(a[metric]))
    .slice(0, 8)  // Limit to top 8 for better readability
    .map(item => ({
      name: item.ZonăApartament.replace('Timisoara, zona ', ''),
      value: parseFloat(item[metric])
    }));
  
  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Insufficient data for visualization</p>
        </div>
      </div>
    );
  }
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{payload[0].payload.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {metric}: {
              metric.includes('Pret') 
                ? `€${payload[0].value.toLocaleString()}` 
                : payload[0].value.toLocaleString()
            }
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Add opacity to color
  const getColorWithOpacity = (hex, opacity = 0.7) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart 
        cx="50%" 
        cy="50%" 
        outerRadius="70%" 
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          bottom: 20,
          left: 30
        }}
      >
        <PolarGrid 
          stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
        />
        <PolarAngleAxis 
          dataKey="name" 
          tick={{ 
            fill: isDarkMode ? '#d1d5db' : '#4b5563', 
            fontSize: 11 
          }} 
          tickLine={false}
        />
        <PolarRadiusAxis 
          tick={{ 
            fill: isDarkMode ? '#9ca3af' : '#6b7280' 
          }} 
          axisLine={{ 
            stroke: isDarkMode ? '#4b5563' : '#d1d5db' 
          }}
          tickCount={5}
          tickFormatter={(value) => metric.includes('Pret') ? `€${value}` : value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar 
          name={metric} 
          dataKey="value" 
          stroke={accentColor} 
          fill={getColorWithOpacity(accentColor, isDarkMode ? 0.5 : 0.6)} 
          strokeWidth={2}
          animationDuration={1000}
          activeDot={{ 
            r: 6, 
            fill: accentColor, 
            stroke: isDarkMode ? '#1f2937' : '#ffffff', 
            strokeWidth: 2 
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default PolarChart;