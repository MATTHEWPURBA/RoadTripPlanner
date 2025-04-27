import apiClient from './apiService';

export default {
  /**
   * Get all trips
   * @returns {Promise<Array>} List of trips
   */
  async getTrips() {
    const response = await apiClient.get('/trips');
    return response.data;
  },
  
  /**
   * Get a specific trip with related data
   * @param {Number} id Trip ID
   * @returns {Promise<Object>} Trip with destinations, route segments, and POIs
   */
  async getTrip(id) {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },
  
  /**
   * Create a new trip
   * @param {Object} tripData Trip data (name, description, dates)
   * @returns {Promise<Object>} Created trip
   */
  async createTrip(tripData) {
    const response = await apiClient.post('/trips', tripData);
    return response.data;
  },
  
  /**
   * Update an existing trip
   * @param {Number} id Trip ID
   * @param {Object} tripData Trip data to update
   * @returns {Promise<Object>} Updated trip
   */
  async updateTrip(id, tripData) {
    const response = await apiClient.put(`/trips/${id}`, tripData);
    return response.data;
  },
  
  /**
   * Delete a trip
   * @param {Number} id Trip ID
   * @returns {Promise<void>}
   */
  async deleteTrip(id) {
    await apiClient.delete(`/trips/${id}`);
  },
  
  /**
   * Calculate routes for a trip
   * @param {Number} id Trip ID
   * @returns {Promise<Object>} Trip with updated route information
   */
  async calculateRoutes(id) {
    const response = await apiClient.post(`/trips/${id}/calculate-route`);
    return response.data;
  }
};