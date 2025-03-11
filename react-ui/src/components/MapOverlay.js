// src/components/MapOverlay.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MapOverlay = ({ position = 'bottom-left', statistics, selectedMetric }) => {
  const { accentColor, isDarkMode } = useTheme();
  
  if (!statistics || statistics.length === 0) return null;
  
  // Sort statistics by the selected metric (descending)
  const sortedStats = [...statistics]
    .filter(stat => !isNaN(parseFloat(stat[selectedMetric])))
    .sort((a, b) => parseFloat(b[selectedMetric]) - parseFloat(a[selectedMetric]))
    .slice(0, 3); // Show only top 3
  
  if (sortedStats.length === 0) return null;
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };
  
  const formatValue = (value) => {
    if (selectedMetric.includes('Pret')) {
      return `€${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };
  
  return (
    <div className={`absolute ${positionClasses[position]} z-10 max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 animate-fade-in border border-gray-100 dark:border-gray-700`}>
      <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        Top Zones by {selectedMetric}
      </div>
      <div className="space-y-2">
        {sortedStats.map((stat, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="flex items-center justify-center w-5 h-5 rounded-full mr-2 text-white text-xs font-medium"
              style={{ backgroundColor: accentColor }}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {stat.ZonăApartament ? stat.ZonăApartament.replace('Timisoara, zona ', '') : 'Unknown Zone'}
              </p>
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white ml-2">
              {formatValue(parseFloat(stat[selectedMetric]))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapOverlay;