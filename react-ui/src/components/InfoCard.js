// src/components/InfoCard.js
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const InfoCard = ({ title, content, icon, action, expandable = false, initiallyExpanded = false }) => {
  const { accentColor } = useTheme();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 text-accent-500" style={{ color: accentColor }}>
              {icon}
            </div>
          )}
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center">
          {action && (
            <button 
              onClick={action.onClick} 
              className="text-sm text-accent-500 hover:text-accent-600 mr-2"
              style={{ color: accentColor }}
            >
              {action.label}
            </button>
          )}
          {expandable && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      {(!expandable || isExpanded) && (
        <div className="px-4 pb-4 pt-0">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoCard;