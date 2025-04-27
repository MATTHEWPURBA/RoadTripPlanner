import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';

// Import modules
import trips from './modules/trips';
import destinations from './modules/destinations';
import routes from './modules/routes';
import pois from './modules/pois';

// Create vuex-persist instance to save state to localStorage
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  key: 'roadtrip-planner',
  modules: ['trips', 'destinations', 'routes', 'pois'] // Only persist these modules
});

// Create store
export default createStore({
  modules: {
    trips,
    destinations,
    routes,
    pois
  },
  // Root state shared across modules
  state: {
    loading: false,
    error: null
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading);
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error);
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },
  getters: {
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    error: state => state.error
  },
  plugins: [vuexLocal.plugin]
});