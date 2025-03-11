// src/components/SummaryStats.js
import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SummaryStats = ({ statistics, selectedMetric, selectedRooms }) => {
  const { accentColor, isDarkMode } = useTheme();

  const metrics = useMemo(() => {
    if (!statistics || statistics.length === 0) {
      return {
        average: 0,
        max: 0,
        min: 0,
        totalListings: 0,
        maxZone: 'N/A',
        minZone: 'N/A'
      };
    }

    // Filter out invalid data
    const validStats = statistics.filter(stat => 
      !isNaN(parseFloat(stat[selectedMetric])) && 
      stat.ZonăApartament
    );

    if (validStats.length === 0) {
      return {
        average: 0,
        max: 0,
        min: 0,
        totalListings: 0,
        maxZone: 'N/A',
        minZone: 'N/A'
      };
    }

    // Calculate statistics
    const values = validStats.map(stat => parseFloat(stat[selectedMetric]));
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Find zones with max and min values
    const maxZone = validStats.find(stat => parseFloat(stat[selectedMetric]) === max)?.ZonăApartament.replace('Timisoara, zona ', '');
    const minZone = validStats.find(stat => parseFloat(stat[selectedMetric]) === min)?.ZonăApartament.replace('Timisoara, zona ', '');

    // Calculate total listings
    const totalListings = validStats.reduce((sum, stat) => sum + (stat.NumarAnunturi || 0), 0);

    return {
      average: Math.round(average),
      max,
      min,
      totalListings,
      maxZone,
      minZone
    };
  }, [statistics, selectedMetric]);

  const formatValue = (value) => {
    if (selectedMetric.includes('Pret')) {
      return `€${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const StatCard = ({ title, value, subtitle, icon, accentClass = '' }) => (
    <div className="card h-full">
      <div className="p-4 flex items-start">
        <div className={`flex-shrink-0 rounded-lg p-3 ${accentClass || 'bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200'}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <StatCard 
        title="Average Price" 
        value={formatValue(metrics.average)}
        subtitle={`For ${selectedRooms} room properties`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2H9.83c.11-.313.17-.65.17-1v-1h1a1 1 0 100-2h-1V7a1 1 0 112 0 1 1 0 102 0 3 3 0 00-3-3z" clipRule="evenodd" />
          </svg>
        }
        accentClass="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
      />
      
      <StatCard 
        title="Highest Price" 
        value={formatValue(metrics.max)}
        subtitle={metrics.maxZone}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        }
        accentClass="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      />
      
      <StatCard 
        title="Lowest Price" 
        value={formatValue(metrics.min)}
        subtitle={metrics.minZone}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
        }
        accentClass="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      />
      
      <StatCard 
        title="Total Listings" 
        value={metrics.totalListings.toLocaleString()}
        subtitle={`${statistics?.length || 0} zones`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        }
        accentClass="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
      />
    </div>
  );
};

export default SummaryStats;