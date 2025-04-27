// src/store/modules/pois.js
// This module handles Points of Interest, accommodations, and events
import poiService from '@/services/poiService';

export default {
  namespaced: true,
  
  state: {
    pointsOfInterest: [],
    selectedPoi: null,
    accommodations: [],
    events: []
  },
  
  mutations: {
    SET_POIS(state, pois) {
      state.pointsOfInterest = pois;
    },
    ADD_POIS(state, pois) {
      state.pointsOfInterest = [...state.pointsOfInterest, ...pois];
    },
    SET_SELECTED_POI(state, poi) {
      state.selectedPoi = poi;
    },
    SET_ACCOMMODATIONS(state, accommodations) {
      state.accommodations = accommodations;
    },
    SET_EVENTS(state, events) {
      state.events = events;
    }
  },
  
  actions: {
    // Load all POIs for a trip
    async fetchPoisForTrip({ commit, dispatch }, tripId) {
      try {
        dispatch('setLoading', true, { root: true });
        const pois = await poiService.getPointsOfInterestByTrip(tripId);
        commit('SET_POIS', pois);
        return pois;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to load points of interest', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Find POIs for a specific route segment
    async findPoisForSegment({ commit, dispatch,state }, { segmentId, options }) {
      try {
        dispatch('setLoading', true, { root: true });
        const pois = await poiService.findPointsOfInterest(segmentId, options);
        
        // If replace option is true, replace all POIs for this segment
        if (options?.replace) {
          // Filter out existing POIs for this segment
          const filteredPois = state.pointsOfInterest.filter(
            poi => poi.route_segment_id !== segmentId
          );
          commit('SET_POIS', [...filteredPois, ...pois]);
        } else {
          commit('ADD_POIS', pois);
        }
        
        return pois;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to find points of interest', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Find accommodation options for a route segment
    async findAccommodation({ commit, dispatch }, { segmentId, options }) {
      try {
        dispatch('setLoading', true, { root: true });
        const accommodations = await poiService.findAccommodation(segmentId, options);
        commit('SET_ACCOMMODATIONS', accommodations);
        return accommodations;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to find accommodation options', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Find events for a trip based on dates
    async findEvents({ commit, dispatch }, { tripId, options }) {
      try {
        dispatch('setLoading', true, { root: true });
        const events = await poiService.findEvents(tripId, options);
        commit('SET_EVENTS', events);
        return events;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to find events', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Select a POI
    selectPoi({ commit }, poi) {
      commit('SET_SELECTED_POI', poi);
    }
  },
  
  getters: {
    allPois: state => state.pointsOfInterest,
    selectedPoi: state => state.selectedPoi,
    allAccommodations: state => state.accommodations,
    allEvents: state => state.events,
    
    // Get POIs for a specific segment
    poisBySegment: state => segmentId => {
      return state.pointsOfInterest.filter(poi => poi.route_segment_id === segmentId);
    },
    
    // Group POIs by their type
    poisByType: state => {
      const grouped = {};
      
      state.pointsOfInterest.forEach(poi => {
        // Split comma-separated types and use the first one as primary
        const types = poi.type.split(',').map(type => type.trim());
        const primaryType = types[0] || 'other';
        
        if (!grouped[primaryType]) {
          grouped[primaryType] = [];
        }
        
        grouped[primaryType].push(poi);
      });
      
      return grouped;
    }
  }
};