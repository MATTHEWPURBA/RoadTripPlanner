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
    console.log('Calling geocode API with address:', address);
    try {
      const response = await apiClient.post('/destinations/geocode', { address });
      console.log('Geocode API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in geocode API call:', error);
      
      // Show detailed error information
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      throw error;
    }
  }




};




//  This file is part of the Vue Front End framework.

// src/services/destinationService.js