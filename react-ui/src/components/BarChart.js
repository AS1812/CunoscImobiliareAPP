// src/components/BarChart.js
import React, { useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const BarChart = ({ data, metric }) => {
  const { accentColor, isDarkMode } = useTheme();
  const [activeBar, setActiveBar] = useState(null);
  
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
  
  // Sort and filter data for the chart
  const chartData = [...data]
    .filter(item => !isNaN(parseFloat(item[metric])))
    .sort((a, b) => parseFloat(b[metric]) - parseFloat(a[metric]))
    .slice(0, 8)  // Limit to top 8 for better readability
    .map(item => ({
      name: item.ZonăApartament ? item.ZonăApartament.replace('Timisoara, zona ', '') : 'Unknown',
      value: parseFloat(item[metric])
    }));
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
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
  
  // Get a lighter version of the color for hover effect
  const getLighterColor = (hex) => {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Make lighter (blend with white)
    r = Math.min(255, r + 40);
    g = Math.min(255, g + 40);
    b = Math.min(255, b + 40);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 5,
          right: 20,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
          horizontal={false} 
        />
        <XAxis 
          type="number" 
          tick={{ 
            fill: isDarkMode ? '#9ca3af' : '#6b7280', 
            fontSize: 12 
          }}
          axisLine={{ 
            stroke: isDarkMode ? '#4b5563' : '#d1d5db' 
          }}
          tickLine={{ 
            stroke: isDarkMode ? '#4b5563' : '#d1d5db' 
          }}
          tickFormatter={(value) => metric.includes('Pret') ? `€${value}` : value}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ 
            fill: isDarkMode ? '#d1d5db' : '#4b5563', 
            fontSize: 12 
          }}
          axisLine={{ 
            stroke: isDarkMode ? '#4b5563' : '#d1d5db' 
          }}
          tickLine={{ 
            stroke: isDarkMode ? '#4b5563' : '#d1d5db' 
          }}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]}
          onMouseEnter={(data, index) => setActiveBar(index)}
          onMouseLeave={() => setActiveBar(null)}
          animationDuration={1000}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index === activeBar ? getLighterColor(accentColor) : accentColor}
              cursor="pointer"
              stroke={isDarkMode ? '#1f2937' : '#ffffff'}
              strokeWidth={1}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;