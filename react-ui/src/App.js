// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [selectedRooms, setSelectedRooms] = useState('1');
  const [selectedMetric, setSelectedMetric] = useState('PretMediu');
  const [statistics, setStatistics] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    { value: '4', label: '4 Rooms' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching data from:', API_URL);
        
        // Fetch statistics based on selected rooms
        const statsResponse = await axios.get(`${API_URL}/rentals/stats/${selectedRooms}`);
        console.log('Statistics response:', statsResponse.data);
        
        // Ensure the data is an array and has the expected structure
        const validatedStats = Array.isArray(statsResponse.data) 
          ? statsResponse.data.filter(item => item && typeof item === 'object')
          : [];
          
        setStatistics(validatedStats);
        
        // Fetch map data
        const mapResponse = await axios.get(`${API_URL}/rentals/map`);
        console.log('Map data response:', mapResponse.data);
        
        if (mapResponse.data && mapResponse.data.features) {
          setMapData(mapResponse.data);
        } else {
          console.error('Invalid map data structure:', mapResponse.data);
          setError('Invalid map data structure received from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err.response 
          ? `Error: ${err.response.status} ${err.response.statusText}` 
          : err.message === 'Network Error'
            ? 'Network error: Please check if the backend server is running on port 5001'
            : 'Failed to load data. Please try again.';
        
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedRooms]); // Remove API_URL from dependency array

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
      />
    </ThemeProvider>
  );
}

export default App;