// scripts/copyGeoJson.js
const fs = require('fs').promises;
const path = require('path');

async function copyGeoJson() {
  try {
    console.log('Copying GeoJSON file to backend and react-ui directories...');
    
    // Read the map.geojson from the source file provided in paste-3.txt
    const sourceGeojson = process.env.SOURCE_GEOJSON || path.join(__dirname, '../map.geojson');
    
    console.log(`Reading from: ${sourceGeojson}`);
    const geojsonData = await fs.readFile(sourceGeojson, 'utf8');
    
    // Write to backend directory
    const backendPath = path.join(__dirname, '../map.geojson');
    await fs.writeFile(backendPath, geojsonData);
    console.log(`GeoJSON written to: ${backendPath}`);
    
    // Write to react-ui public directory
    const react-uiPath = path.join(__dirname, '../../react-ui/public/map.geojson');
    
    // Ensure react-ui/public directory exists
    try {
      await fs.mkdir(path.join(__dirname, '../../react-ui/public'), { recursive: true });
    } catch (err) {
      console.log('react-ui public directory already exists or could not be created');
    }
    
    await fs.writeFile(react-uiPath, geojsonData);
    console.log(`GeoJSON written to: ${react-uiPath}`);
    
    console.log('GeoJSON copy complete!');
  } catch (err) {
    console.error('Error copying GeoJSON:', err);
    process.exit(1);
  }
}

copyGeoJson();