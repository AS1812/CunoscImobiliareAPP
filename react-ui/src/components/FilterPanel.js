// src/components/FilterPanel.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const FilterPanel = ({ 
  selectedRooms, 
  setSelectedRooms, 
  selectedMetric, 
  setSelectedMetric, 
  metrics, 
  roomOptions,
  statistics = [] // Add statistics with default empty array
}) => {
  const { accentColor } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Property Size
        </h3>
        <div className="flex flex-col space-y-2">
          {roomOptions.map(option => (
            <button
              key={option.value}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRooms === option.value
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={selectedRooms === option.value ? { backgroundColor: accentColor } : {}}
              onClick={() => setSelectedRooms(option.value)}
            >
              <span>{option.label}</span>
              {selectedRooms === option.value && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Metric
        </h3>
        <div className="relative">
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="select bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Expensive Areas</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Top 3</span>
        </div>
        <div className="space-y-2">
          {[...statistics]
            .sort((a, b) => parseFloat(b[selectedMetric]) - parseFloat(a[selectedMetric]))
            .slice(0, 3)
            .map((stat, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: accentColor }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {stat.ZonăApartament ? stat.ZonăApartament.replace('Timisoara, zona ', '') : 'Unknown Zone'}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {selectedMetric.includes('Pret') ? `€${stat[selectedMetric]}` : stat[selectedMetric]}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;