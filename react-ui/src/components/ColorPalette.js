// src/components/ColorPalette.js
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ColorPalette = () => {
  const { accentColor, setAccentColor, colorOptions } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const paletteRef = useRef(null);

  // Close palette when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paletteRef]);

  return (
    <div className="relative" ref={paletteRef}>
      <button
        className="flex items-center space-x-2 bg-white dark:bg-gray-700 p-2 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme color"
      >
        <span 
          className="block w-5 h-5 rounded-full" 
          style={{ backgroundColor: accentColor }}
        ></span>
        <span className="text-sm text-gray-600 dark:text-gray-300">Theme Color</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 animate-fade-in">
          <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Color Palette</div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full ${accentColor === color.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => {
                  setAccentColor(color.value);
                }}
                title={color.name}
              ></button>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Custom Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
              />
              <span className="ml-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {accentColor}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;