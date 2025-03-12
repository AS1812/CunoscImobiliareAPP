// src/App.js - Never uses estimated data
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';

// Use environment variable for API URL with fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Define list of known zones to ensure consistent data
const KNOWN_ZONES = [
  'Timisoara, zona Cetatii',
  'Timisoara, zona Telegrafului',
  'Timisoara, zona Dorobantilor',
  'Timisoara, zona Lipovei',
  'Timisoara, zona Aradului',
  'Timisoara, zona Elisabetin',
  'Timisoara, zona Iosefin',
  'Timisoara, zona Blascovici',
  'Timisoara, zona Torontalului',
  'Timisoara, zona Fabric',
  'Timisoara, zona Complex Studentesc'
];

function App() {
  const [selectedRooms, setSelectedRooms] = useState('1');
  const [selectedMetric, setSelectedMetric] = useState('PretMediu');
  const [statistics, setStatistics] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [dataSource, setDataSource] = useState('api'); // Always 'api'

  const metrics = [
    { value: 'PretMediu', label: 'Average Price' },
    { value: 'PretMinim', label: 'Minimum Price' },
    { value: 'PretMaxim', label: 'Maximum Price' },
    { value: 'PretMediu_MetruPatrat', label: 'Price / m²' },
    { value: 'NumarAnunturi', label: 'Number of Listings' },
    { value: 'MetriPartrati_InMedie', label: 'Average Area (m²)' }
  ];

  // Room options
  const roomOptions = [
    { value: '1', label: '1 Room' },
    { value: '2', label: '2 Rooms' },
    { value: '3', label: '3 Rooms' },
    { value: '4', label: '4+ Rooms' }
  ];

  // Fetch database stats once at startup
  useEffect(() => {
    const fetchDatabaseStats = async () => {
      try {
        console.log('Fetching database stats...');
        const response = await axios.get(`${API_URL}/rentals/database-stats`);
        if (response.data && response.data.totalListings) {
          setDbStats(response.data);
          console.log(`Database contains ${response.data.totalListings} listings`);
        }
      } catch (err) {
        console.warn('Could not fetch database stats:', err.message);
      }
    };
    
    fetchDatabaseStats();
  }, []);

  // Fetch data when selected rooms change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching data for ${selectedRooms} room(s) from: ${API_URL}`);
        
        // First check database health
        let databaseConnected = false;
        try {
          const healthResponse = await axios.get(`${API_URL}/rentals/health`);
          databaseConnected = healthResponse.data.status === 'ok';
          console.log(`Database health check: ${databaseConnected ? 'Connected' : 'Disconnected'}`);
          
          if (!databaseConnected) {
            throw new Error('Database not connected');
          }
        } catch (healthError) {
          console.error('Health check failed:', healthError.message);
          throw new Error('Could not connect to the database. Please try again later.');
        }
        
        // Get statistics data
        const statsResponse = await axios.get(`${API_URL}/rentals/stats/${selectedRooms}`);
        
        if (!Array.isArray(statsResponse.data)) {
          throw new Error('Invalid statistics data format (not an array)');
        }
        
        console.log(`Received ${statsResponse.data.length} zones from statistics endpoint`);
        
        // Ensure we have data for all known zones
        const statsData = [...statsResponse.data];
        const existingZones = new Set(statsData.map(item => item.ZonăApartament));
        
        // Add any missing zones with zero values
        for (const zone of KNOWN_ZONES) {
          if (!existingZones.has(zone)) {
            statsData.push({
              ZonăApartament: zone,
              PretMediu: 0,
              PretMinim: 0,
              PretMaxim: 0,
              MetriPartrati_InMedie: 0,
              PretMediu_MetruPatrat: 0,
              NumarAnunturi: 0
            });
          }
        }
        
        // Sort by number of listings
        statsData.sort((a, b) => b.NumarAnunturi - a.NumarAnunturi);
        
        // Set the statistics state
        setStatistics(statsData);
        
        // Now get the map data
        try {
          // Try the enhanced map endpoint first
          const mapResponse = await axios.get(`${API_URL}/rentals/map`);
          
          if (mapResponse.data && mapResponse.data.features) {
            console.log(`Received map data with ${mapResponse.data.features.length} features`);
            setMapData(mapResponse.data);
          } else {
            throw new Error('Invalid map data structure');
          }
        } catch (mapError) {
          console.warn('Map endpoint failed, trying static map:', mapError.message);
          
          // Try the static map endpoint
          try {
            const staticMapResponse = await axios.get(`${API_URL}/rentals/map-static`);
            
            if (staticMapResponse.data && staticMapResponse.data.features) {
              console.log('Using static map data');
              
              // Enhance the map with our statistics data
              const enhancedFeatures = staticMapResponse.data.features.map(feature => {
                const zoneName = feature.properties.text;
                const zoneStats = statsData.find(stat => stat.ZonăApartament === zoneName);
                
                return {
                  ...feature,
                  properties: {
                    ...feature.properties,
                    statistics: zoneStats ? {
                      count: zoneStats.NumarAnunturi,
                      avgPrice: zoneStats.PretMediu
                    } : {
                      count: 0,
                      avgPrice: 0
                    }
                  }
                };
              });
              
              setMapData({
                ...staticMapResponse.data,
                features: enhancedFeatures
              });
            } else {
              throw new Error('Invalid static map data');
            }
          } catch (staticMapError) {
            console.error('All map endpoints failed:', staticMapError.message);
            throw new Error('Could not load map data. Please try again later.');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data. Please check your connection and try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedRooms]);

  return (
    <ThemeProvider>
      <Dashboard
        loading={loading}
        error={error}
        statistics={statistics}
        mapData={mapData}
        selectedRooms={selectedRooms}
        setSelectedRooms={setSelectedRooms}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        metrics={metrics}
        roomOptions={roomOptions}
        dbStats={dbStats}
        dataSource="api" // Always use real data
      />
    </ThemeProvider>
  );
}

export default App;