// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all rentals
export const getAllRentals = async () => {
  try {
    const response = await apiClient.get('/rentals');
    return response.data;
  } catch (error) {
    console.error('Error fetching rentals:', error);
    throw error;
  }
};

// Get statistics by room count
export const getStatsByRooms = async (rooms) => {
  try {
    const response = await apiClient.get(`/rentals/stats/${rooms}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for ${rooms} rooms:`, error);
    throw error;
  }
};

// Get map data
export const getMapData = async () => {
  try {
    const response = await apiClient.get('/rentals/map');
    return response.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw error;
  }
};