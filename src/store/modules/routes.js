// This module handles route segments between destinations
import routeService from '@/services/routeService';

export default {
  namespaced: true,
  
  state: {
    routeSegments: [],
    selectedSegment: null
  },
  
  mutations: {
    SET_ROUTE_SEGMENTS(state, segments) {
      state.routeSegments = segments;
    },
    ADD_ROUTE_SEGMENT(state, segment) {
      state.routeSegments.push(segment);
    },
    UPDATE_ROUTE_SEGMENT(state, updatedSegment) {
      const index = state.routeSegments.findIndex(segment => segment.id === updatedSegment.id);
      if (index !== -1) {
        state.routeSegments.splice(index, 1, updatedSegment);
      }
    },
    DELETE_ROUTE_SEGMENT(state, segmentId) {
      state.routeSegments = state.routeSegments.filter(segment => segment.id !== segmentId);
    },
    SET_SELECTED_SEGMENT(state, segment) {
      state.selectedSegment = segment;
    }
  },
  
  actions: {
    // Set route segments (usually from a trip fetch)
    setRouteSegments({ commit }, segments) {
      commit('SET_ROUTE_SEGMENTS', segments);
    },
    
    // Create a route segment
    async createRouteSegment({ commit, dispatch }, segmentData) {
      try {
        dispatch('setLoading', true, { root: true });
        const segment = await routeService.createRouteSegment(segmentData);
        commit('ADD_ROUTE_SEGMENT', segment);
        return segment;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to create route segment', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Update a route segment
    async updateRouteSegment({ commit, dispatch }, { id, segmentData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const segment = await routeService.updateRouteSegment(id, segmentData);
        commit('UPDATE_ROUTE_SEGMENT', segment);
        return segment;
      } catch (error) {
        dispatch('setError', error.message || 'Failed to update route segment', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    
    // Select a route segment
    selectRouteSegment({ commit }, segment) {
      commit('SET_SELECTED_SEGMENT', segment);
    },
    
    // Calculate a route between two points (without saving)
    async calculateRoute({ dispatch }, { origin, destination }) {
      try {
        dispatch('setLoading', true, { root: true });
        return await routeService.calculateRoute(origin, destination);
      } catch (error) {
        dispatch('setError', error.message || 'Failed to calculate route', { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    }
  },
  
  getters: {
    allRouteSegments: state => state.routeSegments,
    segmentById: state => id => {
      return state.routeSegments.find(segment => segment.id === parseInt(id));
    },
    selectedSegment: state => state.selectedSegment,
    
    // Get total distance for all route segments
    totalDistance: state => {
      return state.routeSegments.reduce((total, segment) => total + segment.distance, 0);
    },
    
    // Get total duration for all route segments
    totalDuration: state => {
      return state.routeSegments.reduce((total, segment) => total + segment.duration, 0);
    },
    
    // Format total duration as human-readable string
    formattedTotalDuration: (state, getters) => {
      const totalSeconds = getters.totalDuration;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      let formatted = '';
      if (hours > 0) {
        formatted += hours + ' hour' + (hours > 1 ? 's' : '');
      }
      
      if (minutes > 0) {
        if (formatted) {
          formatted += ' ';
        }
        formatted += minutes + ' minute' + (minutes > 1 ? 's' : '');
      }
      
      return formatted || '0 minutes';
    },
    
    // Format total distance
    formattedTotalDistance: (state, getters) => {
      return getters.totalDistance.toFixed(1) + ' km';
    }
  }
};




// This file is part of the Vue Front End framework.


// src/store/modules/routes.js