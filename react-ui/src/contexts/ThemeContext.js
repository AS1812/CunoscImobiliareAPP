// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accentColor, setAccentColor] = useState(() => {
    const savedColor = localStorage.getItem('accentColor');
    return savedColor || '#6366F1'; // Default to indigo
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    
    // Extract RGB values for CSS variables
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    document.documentElement.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`);
  }, [accentColor]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colorOptions = [
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Fuchsia', value: '#D946EF' }
  ];

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      accentColor, 
      setAccentColor,
      colorOptions
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);