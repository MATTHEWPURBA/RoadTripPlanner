import apiClient from './apiService';

export default {
  /**
   * Get all points of interest for a trip
   * @param {Number} tripId Trip ID
   * @returns {Promise<Array>} List of POIs
   */
  async getPointsOfInterestByTrip(tripId) {
    const response = await apiClient.get(`/trips/${tripId}/points-of-interest`);
    return response.data;
  },
  
  /**
   * Find points of interest for a route segment
   * @param {Number} segmentId Route segment ID
   * @param {Object} options Search options (categories, radius, replace)
   * @returns {Promise<Array>} List of POIs
   */
  async findPointsOfInterest(segmentId, options = {}) {
    const response = await apiClient.get(`/route-segments/${segmentId}/points-of-interest`, {
      params: options
    });
    return response.data;
  },
  
  /**
   * Find accommodation options for a route segment
   * @param {Number} segmentId Route segment ID
   * @param {Object} options Search options (max_price, min_rating)
   * @returns {Promise<Array>} List of accommodations
   */
  async findAccommodation(segmentId, options = {}) {
    const response = await apiClient.get(`/route-segments/${segmentId}/accommodation`, {
      params: options
    });
    return response.data;
  },
  
  /**
   * Find events along a trip route for specific dates
   * @param {Number} tripId Trip ID
   * @param {Object} options Search options (start_date, end_date)
   * @returns {Promise<Array>} List of events
   */
  async findEvents(tripId, options = {}) {
    const response = await apiClient.get(`/trips/${tripId}/events`, {
      params: options
    });
    return response.data;
  },
  
  /**
   * Get icon for a POI based on its type
   * @param {String} type POI type
   * @returns {String} CSS class for icon
   */
  getPoiIcon(type) {
    const primaryType = type.split(',')[0].trim();
    
    const iconMap = {
      'tourism.attraction': 'fa-landmark',
      'tourism.sights': 'fa-monument',
      'tourism.museum': 'fa-museum',
      'natural': 'fa-mountain',
      'natural.water': 'fa-water',
      'leisure.park': 'fa-tree',
      'catering.restaurant': 'fa-utensils',
      'catering.cafe': 'fa-coffee',
      'entertainment': 'fa-theater-masks',
      'accommodation.hotel': 'fa-bed',
      'accommodation.motel': 'fa-bed'
    };
    
    return 'fas ' + (iconMap[primaryType] || 'fa-map-marker-alt');
  }
};




// This file is part of the Vue Front End framework.

// src/services/poiService.js