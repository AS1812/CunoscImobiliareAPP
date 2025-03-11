// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import ColorPalette from './ColorPalette';
import RealEstateMap from './RealEstateMap';
import StatisticsPanel from './StatisticsPanel';
import BarChart from './BarChart';
import PolarChart from './PolarChart';
import ScatterChart from './ScatterChart';
import FilterPanel from './FilterPanel';
import SummaryStats from './SummaryStats';
import InfoCard from './InfoCard';
import NotificationAlert from './NotificationAlert';
import MapOverlay from './MapOverlay';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = ({
  loading,
  error,
  statistics,
  mapData,
  selectedRooms,
  setSelectedRooms,
  selectedMetric,
  setSelectedMetric,
  metrics,
  roomOptions
}) => {
  const { accentColor } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [lastUpdate] = useState(new Date());

  // Check if it's first visit (could be stored in localStorage in a real app)
  useEffect(() => {
    // In a real app, you might check localStorage here
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-accent-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto text-center px-4">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none border-r border-gray-100 dark:border-gray-700 lg:translate-x-0 transform transition-transform duration-200 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h1 className="text-xl font-bold text-accent-500">Rent Stats</h1>
              <button className="lg:hidden icon-btn" onClick={() => setSidebarOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <FilterPanel
                selectedRooms={selectedRooms}
                setSelectedRooms={setSelectedRooms}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                metrics={metrics}
                roomOptions={roomOptions}
                statistics={statistics}
              />
              

            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Timișoara Real Estate Statistics
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-2 icon-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold">Timișoara Rent Dashboard</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                  {selectedRooms} Room{selectedRooms !== '1' && 's'} • {metrics.find(m => m.value === selectedMetric)?.label}
                </span>
              <div className="ml-2 flex items-center space-x-2">
                <ColorPalette />
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {showWelcome && (
              <NotificationAlert
                type="info"
                message="Welcome to the Real Estate Dashboard! This dashboard provides insights into Timișoara's real estate market based on current listings."
                dismissible={true}
                timeout={8000}
              />
            )}
            
            <SummaryStats 
              statistics={statistics} 
              selectedMetric={selectedMetric} 
              selectedRooms={selectedRooms}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
              <div className="lg:col-span-2">
                <div className="card animate-fade-in">
                  <div className="card-header">
                    <h3 className="card-title">Real Estate Map</h3>
                  </div>
                  <div className="card-body p-0 relative">
                    <div className="h-96 md:h-[500px]">
                      <RealEstateMap 
                        mapData={mapData} 
                        statistics={statistics} 
                        selectedMetric={selectedMetric}
                        accentColor={accentColor}
                      />
                      <MapOverlay 
                        position="bottom-left"
                        statistics={statistics}
                        selectedMetric={selectedMetric}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="card h-full animate-fade-in">
                  <div className="card-header">
                    <h3 className="card-title">Zone Rankings</h3>
                  </div>
                  <div className="card-body p-0">
                    <StatisticsPanel 
                      statistics={statistics} 
                      selectedMetric={selectedMetric} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card animate-fade-in animate-delay-100">
                <div className="card-header">
                  <h3 className="card-title">Zone Comparison</h3>
                </div>
                <div className="card-body">
                  <div className="h-72">
                    <BarChart 
                      data={statistics} 
                      metric={selectedMetric} 
                      color={accentColor} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="card animate-fade-in animate-delay-200">
                <div className="card-header">
                  <h3 className="card-title">Radial View</h3>
                </div>
                <div className="card-body">
                  <div className="h-72">
                    <PolarChart 
                      data={statistics} 
                      metric={selectedMetric} 
                      color={accentColor} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card animate-fade-in animate-delay-300 mb-6">
              <div className="card-header">
                <h3 className="card-title">Area vs {selectedMetric} Correlation</h3>
              </div>
              <div className="card-body">
                <div className="h-80">
                  <ScatterChart 
                    data={statistics} 
                    metric={selectedMetric} 
                    color={accentColor} 
                  />
                </div>
              </div>
            </div>
            
            <footer className="text-center text-gray-500 text-sm py-4">
              <p>© {new Date().getFullYear()} Timișoara Real Estate Statistics</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;