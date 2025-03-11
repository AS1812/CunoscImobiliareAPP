// src/components/StatisticsPanel.js
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const StatisticsPanel = ({ statistics, selectedMetric }) => {
  const { accentColor } = useTheme();
  const [sortOrder, setSortOrder] = useState('desc');
  
  if (!statistics || statistics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }
  
  // Sort statistics by the selected metric
  const sortedStats = [...statistics].sort((a, b) => {
    const aVal = parseFloat(a[selectedMetric]);
    const bVal = parseFloat(b[selectedMetric]);
    
    if (isNaN(aVal)) return 1;
    if (isNaN(bVal)) return -1;
    
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });
  
  // Find max value for the visual bar
  const maxValue = Math.max(...sortedStats.map(stat => parseFloat(stat[selectedMetric]) || 0));
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <button
          className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          {sortOrder === 'desc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 15a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" />
              <path d="M18 13.5a1.5 1.5 0 01-3 0V9.94l-.216.087a1 1 0 11-.768-1.847l2-1a1 1 0 011.448.894l.04 6.429z" />
            </svg>
          )}
          Sort {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
        </button>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {statistics.length} Zones
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {sortedStats.map((stat, index) => {
            const value = parseFloat(stat[selectedMetric]);
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const formattedValue = selectedMetric.includes('Pret') ? 
              `€${value.toLocaleString()}` : value.toLocaleString();
            
            return (
              <li key={index} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">

                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {stat.ZonăApartament ? stat.ZonăApartament.replace('Timisoara, zona ', '') : 'Unknown Zone'}
                  </span>
                  <span className="text-sm font-semibold">{formattedValue}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: accentColor
                    }}
                  ></div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default StatisticsPanel;