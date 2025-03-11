// src/components/RealEstateMap.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../contexts/ThemeContext';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RealEstateMap = ({ mapData, statistics, selectedMetric }) => {
  const { accentColor, isDarkMode } = useTheme();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const legendRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  
  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current && mapContainerRef.current) {
      // Apply a style to disable selection
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-container { 
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }
        .leaflet-control-container { pointer-events: auto; }
      `;
      document.head.appendChild(style);
      
      // Create map with selection disabled
      const mapOptions = {
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        attributionControl: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        minZoom: 11,
        maxZoom: 16
      };
      
      mapRef.current = L.map(mapContainerRef.current, mapOptions).setView([45.758, 21.227], 12);
      
      // Disable tap handler completely
      if (mapRef.current.tap) {
        mapRef.current.tap.disable();
      }
      
      // Add dark or light theme map tiles
      updateMapTiles();
      
      // Add zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapRef.current);
      
      // Add attribution control
      L.control.attribution({
        position: 'bottomleft',
        prefix: '© OpenStreetMap, Carto'
      }).addTo(mapRef.current);
      
      // Prevent text selection
      mapContainerRef.current.style.webkitUserSelect = 'none';
      mapContainerRef.current.style.msUserSelect = 'none';
      mapContainerRef.current.style.userSelect = 'none';
    }
    
    return () => {
      // Clean up on component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Function to update map tiles based on theme
  const updateMapTiles = () => {
    if (!mapRef.current) return;
    
    // Remove existing tile layers
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });
    
    // Add appropriate tile layer based on theme
    if (isDarkMode) {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapRef.current);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  };
  
  // Update map tiles when theme changes
  useEffect(() => {
    updateMapTiles();
  }, [isDarkMode]);
  
  // Update map when data or selected metric changes
  useEffect(() => {
    if (!mapRef.current || !mapData || !statistics || statistics.length === 0) return;
    
    // Remove existing GeoJSON layer if it exists
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current);
    }
    
    // Create a lookup map for statistics
    const statsMap = {};
    statistics.forEach(stat => {
      statsMap[stat.ZonăApartament] = stat;
    });
    
    // Find min and max values for the selected metric
    const values = statistics
      .map(stat => parseFloat(stat[selectedMetric]))
      .filter(val => !isNaN(val));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    
    // Convert hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    const rgb = hexToRgb(accentColor);
    
    // Add GeoJSON layer
    geoJsonLayerRef.current = L.geoJSON(mapData, {
      style: (feature) => {
        const zoneName = feature.properties.text;
        const zoneStat = statsMap[zoneName];
        
        if (!zoneStat || isNaN(parseFloat(zoneStat[selectedMetric]))) {
          return {
            fillColor: isDarkMode ? '#374151' : '#f3f4f6',
            weight: 1,
            opacity: 0.7,
            color: isDarkMode ? '#4b5563' : '#d1d5db',
            fillOpacity: 0.5
          };
        }
        
        // Calculate color intensity based on value
        const value = parseFloat(zoneStat[selectedMetric]);
        const intensity = valueRange === 0 ? 0.5 : (value - minValue) / valueRange;
        
        return {
          fillColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 + intensity * 0.6})`,
          weight: 1,
          opacity: 0.7,
          color: isDarkMode ? '#4b5563' : '#d1d5db',
          fillOpacity: 0.8
        };
      },
      onEachFeature: (feature, layer) => {
        const zoneName = feature.properties.text;
        const zoneStat = statsMap[zoneName];
        
        // Make all these non-interactive to disable selection
        layer.options.interactive = true;
        
        // Add mouseover events
        layer.on({
          mouseover: (e) => {
            setHoveredZone(zoneName);
            const layer = e.target;
            layer.setStyle({
              weight: 2,
              color: accentColor,
              dashArray: '',
              fillOpacity: 0.9
            });
            layer.bringToFront();
          },
          mouseout: (e) => {
            setHoveredZone(null);
            geoJsonLayerRef.current.resetStyle(e.target);
          },
          click: (e) => {
            // Prevent the default selection behavior
            L.DomEvent.stop(e);
            
            if (zoneStat) {
              // Create popup with stats
              const displayValue = selectedMetric.includes('Pret') ? 
                `€${zoneStat[selectedMetric].toLocaleString()}` : 
                zoneStat[selectedMetric].toLocaleString();
              
              const popupContent = `
                <div class="font-sans">
                  <h3 class="font-bold text-base mb-1">${zoneName ? zoneName.replace('Timisoara, zona ', '') : 'Unknown Zone'}</h3>
                  <div class="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                    <span class="text-gray-500 dark:text-gray-400">${selectedMetric}:</span>
                    <span class="font-medium text-right">${displayValue}</span>
                    <span class="text-gray-500 dark:text-gray-400">Listings:</span>
                    <span class="font-medium text-right">${zoneStat.NumarAnunturi || '—'}</span>
                    ${zoneStat.MetriPartrati_InMedie ? `
                      <span class="text-gray-500 dark:text-gray-400">Avg. Area:</span>
                      <span class="font-medium text-right">${zoneStat.MetriPartrati_InMedie.toLocaleString()} m²</span>
                    ` : ''}
                  </div>
                </div>
              `;
              
              L.popup({
                closeButton: true,
                className: isDarkMode ? 'dark-popup' : '',
                maxWidth: 300
              })
                .setLatLng(layer.getBounds().getCenter())
                .setContent(popupContent)
                .openOn(mapRef.current);
            }
          }
        });
        
        // Add tooltips
        if (zoneStat) {
          const displayValue = selectedMetric.includes('Pret') ? 
            `€${zoneStat[selectedMetric].toLocaleString()}` : 
            zoneStat[selectedMetric].toLocaleString();
            
          layer.bindTooltip(`
            <div class="font-sans">
              <h3 class="font-bold">${zoneName ? zoneName.replace('Timisoara, zona ', '') : 'Unknown Zone'}</h3>
              <div class="mt-1 flex items-center">
                <span class="font-medium">${displayValue}</span>
              </div>
            </div>
          `, { sticky: true, direction: 'top', offset: [0, -10] });
        } else {
          layer.bindTooltip(`
            <div class="font-sans">
              <h3 class="font-bold">${zoneName ? zoneName.replace('Timisoara, zona ', '') : 'Unknown Zone'}</h3>
              <div class="mt-1">No data available</div>
            </div>
          `, { sticky: true, direction: 'top', offset: [0, -10] });
        }
      }
    }).addTo(mapRef.current);
    
    // Fit map to GeoJSON bounds
    mapRef.current.fitBounds(geoJsonLayerRef.current.getBounds(), {
      padding: [20, 20],
      maxZoom: 14
    });
    
    // Add a legend
    if (legendRef.current) {
      legendRef.current.remove();
    }
    
    legendRef.current = L.control({ position: 'topright' });
    
    legendRef.current.onAdd = function() {
      const div = L.DomUtil.create('div', 'legend bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-colors');
      
      div.innerHTML = `
        <div class="p-3 border-b border-gray-100 dark:border-gray-700">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
            ${selectedMetric}
          </div>
        </div>
        <div class="p-3">
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-full h-2 rounded-full" style="background: linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8))"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>${minValue.toLocaleString()}</span>
            <span>${maxValue.toLocaleString()}</span>
          </div>
        </div>
      `;
      
      return div;
    };
    
    legendRef.current.addTo(mapRef.current);
    
  }, [mapData, statistics, selectedMetric, accentColor, isDarkMode]);
  
  return (
    <>
      <div 
        ref={mapContainerRef} 
        className="h-full w-full rounded-lg overflow-hidden"
      ></div>
      {hoveredZone && (
        <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 animate-fade-in max-w-xs">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {hoveredZone.replace('Timisoara, zona ', '')}
          </h3>
        </div>
      )}
    </>
  );
};

export default RealEstateMap;