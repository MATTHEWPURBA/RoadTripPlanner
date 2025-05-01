import destinationService from '@/services/destinationService';

export default {
  namespaced: true,
  
  state: {
    destinations: [],
    selectedDestination: null,
    temporaryDestination: null // For holding potential new destination (e.g., from map click)
  },
  
  mutations: {
    SET_DESTINATIONS(state, destinations) {
      state.destinations = destinations;
    },
    ADD_DESTINATION(state, destination) {
      state.destinations.push(destination);
    },
    UPDATE_DESTINATION(state, updatedDestination) {
      const index = state.destinations.findIndex(dest => dest.id === updatedDestination.id);
      if (index !== -1) {
        state.destinations.splice(index, 1, updatedDestination);
      }
    },
    DELETE_DESTINATION(state, destinationId) {
      state.destinations = state.destinations.filter(dest => dest.id !== destinationId);
    },
    REORDER_DESTINATIONS(state, sortedDestinations) {
      state.destinations = sortedDestinations;
    },
    SET_SELECTED_DESTINATION(state, destination) {
      state.selectedDestination = destination;
    },
    SET_TEMPORARY_DESTINATION(state, destination) {
      state.temporaryDestination = destination;
    },
    CLEAR_TEMPORARY_DESTINATION(state) {
      state.temporaryDestination = null;
    }
  },
  
  actions: {
    // Load destinations for a specific trip
    async fetchDestinations({ commit, dispatch }, tripId) {
      try {
        dispatch('setLoading', true, { root: true });
        const destinations = await destinationService.getDestinationsByTrip(tripId);
        commit('SET_DESTINATIONS', destinations);
        return destinations;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load destinations', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Add a new destination
    async addDestination({ commit, dispatch }, destinationData) {
      try {
        dispatch('setLoading', true, { root: true });
        const destination = await destinationService.createDestination(destinationData);
        commit('ADD_DESTINATION', destination);
        return destination;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to add destination', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Update an existing destination
    async updateDestination({ commit, dispatch }, { id, destinationData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const destination = await destinationService.updateDestination(id, destinationData);
        commit('UPDATE_DESTINATION', destination);
        return destination;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update destination', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Delete a destination
    async deleteDestination({ commit, dispatch }, destinationId) {
      try {
        dispatch('setLoading', true, { root: true });
        await destinationService.deleteDestination(destinationId);
        commit('DELETE_DESTINATION', destinationId);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to delete destination', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Reorder destinations
    async reorderDestinations({ commit, dispatch }, { tripId, destinations }) {
      try {
        dispatch('setLoading', true, { root: true });
        // Add order property to each destination based on index
        const destinationsWithOrder = destinations.map((dest, index) => ({
          id: dest.id,
          order: index
        }));
        
        const updatedDestinations = await destinationService.reorderDestinations(
          tripId, 
          { destinations: destinationsWithOrder }
        );
        
        commit('SET_DESTINATIONS', updatedDestinations);
        return updatedDestinations;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to reorder destinations', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Geocode an address to get coordinates
    async geocodeAddress({ dispatch }, address) {
      try {
        dispatch('setLoading', true, { root: true });
        return await destinationService.geocodeAddress(address);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to geocode address', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Set selected destination
    selectDestination({ commit }, destination) {
      commit('SET_SELECTED_DESTINATION', destination);
    },
    
    // Set temporary destination (from map click)
    setTemporaryDestination({ commit }, destination) {
      commit('SET_TEMPORARY_DESTINATION', destination);
    },
    
    // Clear temporary destination
    clearTemporaryDestination({ commit }) {
      commit('CLEAR_TEMPORARY_DESTINATION');
    }
  },
  
  getters: {
    allDestinations: state => state.destinations,
    destinationById: state => id => {
      return state.destinations.find(dest => dest.id === parseInt(id));
    },
    selectedDestination: state => state.selectedDestination,
    temporaryDestination: state => state.temporaryDestination,
    // Sort destinations by order
    sortedDestinations: state => {
      return [...state.destinations].sort((a, b) => a.order - b.order);
    }
  }
};




// This file is part of the Vue Front End framework.


// src/store/modules/destinations.js