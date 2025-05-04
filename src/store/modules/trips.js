import tripService from '@/services/tripService';

export default {
  namespaced: true,

  state: {
    trips: [],
    currentTrip: null,
  },

  mutations: {
    SET_TRIPS(state, trips) {
      state.trips = trips;
    },
    ADD_TRIP(state, trip) {
      state.trips.push(trip);
    },
    UPDATE_TRIP(state, updatedTrip) {
      const index = state.trips.findIndex((trip) => trip.id === updatedTrip.id);
      if (index !== -1) {
        state.trips.splice(index, 1, updatedTrip);
      }

      // Also update currentTrip if it's the same trip
      if (state.currentTrip && state.currentTrip.id === updatedTrip.id) {
        state.currentTrip = updatedTrip;
      }
    },
    DELETE_TRIP(state, tripId) {
      state.trips = state.trips.filter((trip) => trip.id !== tripId);

      // Clear currentTrip if it's the deleted trip
      if (state.currentTrip && state.currentTrip.id === tripId) {
        state.currentTrip = null;
      }
    },
    SET_CURRENT_TRIP(state, trip) {
      state.currentTrip = trip;
    },
  },

  actions: {
    // Load all trips from API
    async fetchTrips({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true });
        const trips = await tripService.getTrips();
        console.log('API Response:', trips); // Debug log
        commit('SET_TRIPS', trips);
        return trips;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load trips', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },

    // Create a new trip
    async createTrip({ commit, dispatch }, tripData) {
      try {
        dispatch('setLoading', true, { root: true });
        const trip = await tripService.createTrip(tripData);
        commit('ADD_TRIP', trip);
        return trip;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to create trip', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },

    // Update an existing trip
    async updateTrip({ commit, dispatch }, { id, tripData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const trip = await tripService.updateTrip(id, tripData);
        commit('UPDATE_TRIP', trip);
        return trip;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update trip', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },

    // Delete a trip
    async deleteTrip({ commit, dispatch }, tripId) {
      try {
        dispatch('setLoading', true, { root: true });
        await tripService.deleteTrip(tripId);
        commit('DELETE_TRIP', tripId);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to delete trip', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },

    // Load a specific trip with all related data
    async fetchTrip({ commit, dispatch }, tripId) {
      try {
        dispatch('setLoading', true, { root: true });
        const trip = await tripService.getTrip(tripId);
        commit('SET_CURRENT_TRIP', trip);

        // Also ensure we update destinations in the destinations module
        if (trip.destinations) {
          dispatch('destinations/setDestinations', trip.destinations, { root: true });
        }

        return trip;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load trip details', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },

    // Calculate routes for a trip
    async calculateRoutes({ commit, dispatch }, tripId) {
      try {
        dispatch('setLoading', true, { root: true });
        const trip = await tripService.calculateRoutes(tripId);
        commit('UPDATE_TRIP', trip);
        commit('SET_CURRENT_TRIP', trip);
        return trip;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to calculate routes', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },

    // Set current trip from local data (no API call)
    setCurrentTrip({ commit }, trip) {
      commit('SET_CURRENT_TRIP', trip);
    },
  },

  getters: {
    allTrips: (state) => state.trips,
    currentTrip: (state) => state.currentTrip,
    tripById: (state) => (id) => {
      return state.trips.find((trip) => trip.id === parseInt(id));
    },
  },
};




// This file is part of the Vue Front End framework.

// src/store/modules/trips.js