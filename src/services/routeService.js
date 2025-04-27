// src/services/routeService.js
// import apiClient from './apiService';
import L from 'leaflet';

export default {
  /**
   * Calculate a route between two points
   * This is a client-side calculation using Leaflet for preview purposes
   * 
   * @param {Array} origin [lat, lng]
   * @param {Array} destination [lat, lng]
   * @returns {Object} Simplified route data
   */
  calculateRoute(origin, destination) {
    // Create a straight line between points (simplified)
    const distance = this.calculateDistance(origin, destination);
    
    // Estimate duration based on average speed of 60 km/h
    const duration = distance * 60; // seconds
    
    return {
      distance,
      duration,
      polyline: [
        [origin[0], origin[1]],
        [destination[0], destination[1]]
      ]
    };
  },
  
  /**
   * Calculate the distance between two coordinates
   * @param {Array} origin [lat, lng]
   * @param {Array} destination [lat, lng]
   * @returns {Number} Distance in kilometers
   */
  calculateDistance(origin, destination) {
    const from = L.latLng(origin[0], origin[1]);
    const to = L.latLng(destination[0], destination[1]);
    return from.distanceTo(to) / 1000; // convert meters to kilometers
  },
  
  /**
   * Decode a polyline from GeoJSON or encoded string format
   * @param {String|Object} polyline Encoded polyline or GeoJSON
   * @returns {Array} Array of coordinate pairs [[lat, lng], ...]
   */
  decodePolyline(polyline) {
    if (!polyline) return [];
    
    try {
      // Check if it's a GeoJSON string
      if (typeof polyline === 'string' && polyline.includes('"type"')) {
        const geoJson = JSON.parse(polyline);
        if (geoJson.type === 'LineString') {
          // GeoJSON format has [lng, lat] order, so flip them
          return geoJson.coordinates.map(coord => [coord[1], coord[0]]);
        }
        
        // Handle other GeoJSON types if necessary
        if (geoJson.type === 'Feature' && geoJson.geometry && geoJson.geometry.type === 'LineString') {
          return geoJson.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        }
      }
      
      // If it's already an array, return it
      if (Array.isArray(polyline)) {
        return polyline;
      }
      
      // Default to empty array if format not recognized
      return [];
    } catch (e) {
      console.error('Error decoding polyline:', e);
      return [];
    }
  },
  
  /**
   * Format duration from seconds to a human-readable string
   * @param {Number} seconds Duration in seconds
   * @returns {String} Formatted duration (e.g. "2h 30m")
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let formatted = '';
    if (hours > 0) {
      formatted += hours + 'h ';
    }
    formatted += minutes + 'm';
    
    return formatted;
  },
  
  /**
   * Calculate fuel consumption based on distance
   * @param {Number} distance Distance in kilometers
   * @param {Number} efficiency Fuel efficiency in L/100km (default: 8.0)
   * @returns {Number} Fuel consumption in liters
   */
  calculateFuelConsumption(distance, efficiency = 8.0) {
    return (distance * efficiency) / 100;
  }
};