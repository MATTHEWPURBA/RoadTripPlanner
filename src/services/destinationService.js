import apiClient from './apiService';

export default {
  /**
   * Get destinations for a trip
   * @param {Number} tripId Trip ID
   * @returns {Promise<Array>} List of destinations
   */
  async getDestinationsByTrip(tripId) {
    const response = await apiClient.get(`/trips/${tripId}/destinations`);
    return response.data;
  },
  
  /**
   * Create a new destination
   * @param {Object} destinationData Destination data
   * @returns {Promise<Object>} Created destination
   */
  async createDestination(destinationData) {
    const response = await apiClient.post('/destinations', destinationData);
    return response.data;
  },
  
  /**
   * Update an existing destination
   * @param {Number} id Destination ID
   * @param {Object} destinationData Destination data to update
   * @returns {Promise<Object>} Updated destination
   */
  async updateDestination(id, destinationData) {
    const response = await apiClient.put(`/destinations/${id}`, destinationData);
    return response.data;
  },
  
  /**
   * Delete a destination
   * @param {Number} id Destination ID
   * @returns {Promise<void>}
   */
  async deleteDestination(id) {
    await apiClient.delete(`/destinations/${id}`);
  },
  
  /**
   * Reorder destinations for a trip
   * @param {Number} tripId Trip ID
   * @param {Object} orderData Object with destinations array containing id and order
   * @returns {Promise<Array>} Updated destinations
   */
  async reorderDestinations(tripId, orderData) {
    const response = await apiClient.post(`/trips/${tripId}/destinations/reorder`, orderData);
    return response.data;
  },
  
  /**
   * Geocode an address to get coordinates
   * @param {String} address Address to geocode
   * @returns {Promise<Object>} Location data with coordinates
   */
  async geocodeAddress(address) {
    const response = await apiClient.post('/destinations/geocode', { address });
    return response.data;
  }
};