import L from 'leaflet';
import routeService from './routeService';

/**
 * Service for map-related operations using Leaflet
 */
export default {
  /**
   * Initialize a Leaflet map on the given element
   * 
   * @param {String|Element} elementId DOM element or ID to mount map
   * @param {Object} options Map options
   * @returns {Object} Leaflet map instance
   */
  createMap(elementId, options = {}) {
    // Default options
    const defaultOptions = {
      center: [51.505, -0.09], // Default center (London)
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    };
    
    const mapOptions = { ...defaultOptions, ...options };
    
    // Create the map instance
    const map = L.map(elementId, mapOptions);
    
    // Add OpenStreetMap tile layer (free to use)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    return map;
  },
  
  /**
   * Add a marker to the map
   * 
   * @param {Object} map Leaflet map instance
   * @param {Array} position [lat, lng]
   * @param {Object} options Marker options
   * @returns {Object} Leaflet marker instance
   */
  addMarker(map, position, options = {}) {
    const marker = L.marker(position, options);
    marker.addTo(map);
    return marker;
  },
  
  /**
   * Add a route polyline to the map
   * 
   * @param {Object} map Leaflet map instance
   * @param {Array|String} polyline Encoded polyline or array of [lat, lng] points
   * @param {Object} options Polyline options
   * @returns {Object} Leaflet polyline instance
   */
  addRoute(map, polyline, options = {}) {
    const decodedPolyline = routeService.decodePolyline(polyline);
    
    const defaultOptions = {
      color: '#3388ff',
      weight: 5,
      opacity: 0.7
    };
    
    const polylineOptions = { ...defaultOptions, ...options };
    const routeLine = L.polyline(decodedPolyline, polylineOptions);
    routeLine.addTo(map);
    
    return routeLine;
  },
  
  /**
   * Fit map bounds to show all markers
   * 
   * @param {Object} map Leaflet map instance
   * @param {Array} markers Array of Leaflet markers
   * @param {Object} options Fit bounds options
   */
  fitMapToMarkers(map, markers, options = {}) {
    if (!markers || markers.length === 0) return;
    
    const defaultOptions = {
      padding: [30, 30],
      maxZoom: 15,
      animate: true
    };
    
    const boundsOptions = { ...defaultOptions, ...options };
    
    // Create bounds from markers
    const bounds = L.latLngBounds(markers.map(marker => marker.getLatLng()));
    map.fitBounds(bounds, boundsOptions);
  },
  
  /**
   * Create a custom icon
   * 
   * @param {String} iconUrl Icon URL
   * @param {Object} options Icon options
   * @returns {Object} Leaflet icon instance
   */
  createIcon(iconUrl, options = {}) {
    const defaultOptions = {
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    };
    
    const iconOptions = { ...defaultOptions, ...options };
    return L.icon({ ...iconOptions, iconUrl });
  },
  
  /**
   * Create a marker with popup
   * 
   * @param {Object} map Leaflet map instance
   * @param {Array} position [lat, lng]
   * @param {String} content Popup content (HTML)
   * @param {Object} options Marker options
   * @returns {Object} Leaflet marker instance
   */
  addMarkerWithPopup(map, position, content, options = {}) {
    const marker = this.addMarker(map, position, options);
    marker.bindPopup(content);
    return marker;
  },
  
  /**
   * Add a POI marker with custom icon based on type
   * 
   * @param {Object} map Leaflet map instance
   * @param {Object} poi POI object with latitude, longitude, name, type
   * @returns {Object} Leaflet marker instance
   */
  addPoiMarker(map, poi) {
    const position = [poi.latitude, poi.longitude];
    
    // Create popup content
    const content = `
      <div class="poi-popup">
        <h3>${poi.name}</h3>
        <p>${poi.type.split(',')[0]}</p>
        ${poi.description ? `<p>${poi.description.substring(0, 100)}...</p>` : ''}
      </div>
    `;
    
    // Add marker with popup
    return this.addMarkerWithPopup(map, position, content);
  }
};





// This file is part of the Vue Front End framework.

// src/services/mapService.js