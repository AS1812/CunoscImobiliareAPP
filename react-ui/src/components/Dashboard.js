// src/components/Dashboard.js - Updated to display data source
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
  roomOptions,
  dbStats,
  dataSource
}) => {
  const { accentColor } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [showWelcome, setShowWelcome] = useState(true);
  const [lastUpdate] = useState(new Date());

  // Set sidebar open by default on larger screens
  useEffect(() => {
    // Check if the screen is large enough for desktop view
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) {
      setSidebarOpen(true);
    }
  }, []);

  // Close sidebar when selecting an option on mobile
  const handleMobileSelect = (newValue, setter) => {
    setter(newValue);
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      // Keep sidebar open in desktop view regardless of previous state
      if (isDesktop) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if it's first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);

  // Count total listings in current statistics
  const totalListingsForSelection = statistics.reduce((sum, zone) => sum + zone.NumarAnunturi, 0);

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

  // Get an appropriate notification message based on the data source
  const getDataSourceNotification = () => {
    if (dataSource === 'api') {
      if (dbStats) {
        return {
          type: 'success',
          message: `Using real data from ${dbStats.totalListings.toLocaleString()} listings. Currently showing ${totalListingsForSelection.toLocaleString()} listings for ${selectedRooms} room apartments.`
        };
      } else {
        return {
          type: 'success',
          message: `Using real data from the database. Currently showing ${totalListingsForSelection.toLocaleString()} listings for ${selectedRooms} room apartments.`
        };
      }
    } else if (dataSource === 'fallback') {
      return {
        type: 'warning',
        message: 'Using estimated data. The database connection is currently unavailable. Data shown is approximate.'
      };
    } else {
      return null;
    }
  };

  const dataSourceNotification = getDataSourceNotification();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Mobile Sidebar Overlay - only visible when sidebar is open on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none border-r border-gray-100 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h1 className="text-xl font-bold text-accent-500" style={{ color: accentColor }}>Rent Stats</h1>
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none" 
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <FilterPanel
                selectedRooms={selectedRooms}
                setSelectedRooms={(value) => handleMobileSelect(value, setSelectedRooms)}
                selectedMetric={selectedMetric}
                setSelectedMetric={(value) => handleMobileSelect(value, setSelectedMetric)}
                metrics={metrics}
                roomOptions={roomOptions}
                statistics={statistics}
              />
              
              {/* Database Stats Section */}
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Statistics</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Total Listings:</span>
                    <span className="font-medium">{dbStats ? dbStats.totalListings.toLocaleString() : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Selection:</span>
                    <span className="font-medium">{totalListingsForSelection.toLocaleString()} listings</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Source:</span>
                    <span className={`font-medium ${dataSource === 'fallback' ? 'text-yellow-500' : 'text-green-500'}`}>
                      {dataSource === 'api' ? 'Database' : dataSource === 'fallback' ? 'Estimated' : 'Loading...'}
                    </span>
                  </div>
                  
                  {dbStats && dbStats.roomDistribution && dbStats.roomDistribution.length > 0 && (
                    <div className="pt-2">
                      <div className="text-xs font-medium mb-1">Room Distribution:</div>
                      <div className="space-y-1">
                        {dbStats.roomDistribution.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span>{item._id || 'Unknown'}:</span>
                            <span>{item.count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Timișoara Real Estate Statistics
                <div className="mt-1">
                  {dbStats ? (
                    <span>
                      Data: {new Date(dbStats.timestamp).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>Data loaded: {lastUpdate.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
            {dataSourceNotification && (
              <NotificationAlert
                type={dataSourceNotification.type}
                message={dataSourceNotification.message}
                dismissible={true}
                timeout={8000}
              />
            )}
            
            {showWelcome && !dataSourceNotification && (
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
              dataSource={dataSource}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-6">
              <div className="lg:col-span-2">
                <div className="card animate-fade-in">
                  <div className="card-header">
                    <h3 className="card-title">Real Estate Map</h3>
                    {dataSource === 'fallback' && (
                      <span className="text-xs text-yellow-500">Estimated data</span>
                    )}
                  </div>
                  <div className="card-body p-0 relative">
                    <div className="h-96 md:h-[500px]">
                      <RealEstateMap 
                        mapData={mapData} 
                        statistics={statistics} 
                        selectedMetric={selectedMetric}
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
                      dataSource={dataSource}
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
                <h3 className="card-title">Area vs {metrics.find(m => m.value === selectedMetric)?.label} Correlation</h3>
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
              {dataSource === 'fallback' && (
                <p className="text-xs mt-1 text-yellow-500">
                  * Using estimated data - database connection unavailable
                </p>
              )}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;