/**
 * Service for handling local storage operations
 * This supplements Vuex Persist for cases where we need direct access
 */
export default {
    /**
     * Save data to local storage
     * @param {String} key Storage key
     * @param {*} value Data to store (will be JSON stringified)
     */
    saveData(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    
    /**
     * Get data from local storage
     * @param {String} key Storage key
     * @param {*} defaultValue Default value if key not found
     * @returns {*} Stored data (JSON parsed) or default value
     */
    getData(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (error) {
        console.error('Error getting data from localStorage:', error);
        return defaultValue;
      }
    },
    
    /**
     * Remove data from local storage
     * @param {String} key Storage key
     */
    removeData(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing data from localStorage:', error);
      }
    },
    
    /**
     * Clear all data from local storage
     */
    clearAll() {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    },
    
    /**
     * Check if local storage is available
     * @returns {Boolean} True if localStorage is available
     */
    isAvailable() {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (error) {
        return false;
      }
    }
  };




// This file is part of the Vue Front End framework. 

// src/services/localStorageService.js
