<template>
    <div class="poi-finder-form">
      <div class="finder-header">
        <h3>Find Points of Interest</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="finder-content">
        <form @submit.prevent="findPois">
          <div class="form-group">
            <label for="segment-select">Route Segment</label>
            <select 
              id="segment-select" 
              v-model="form.segmentId"
              required
            >
              <option value="" disabled>Select a route segment</option>
              <option 
                v-for="segment in routeSegments" 
                :key="segment.id" 
                :value="segment.id"
              >
                {{ getSegmentName(segment) }}
              </option>
              <option value="all">All segments</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Categories of Interest</label>
            <div class="categories-grid">
              <label 
                v-for="category in availableCategories" 
                :key="category.value"
                class="category-checkbox"
              >
                <input 
                  type="checkbox" 
                  v-model="form.categories" 
                  :value="category.value"
                >
                <i :class="category.icon"></i>
                {{ category.label }}
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="search-radius">Search Radius (km)</label>
            <div class="slider-container">
              <input 
                type="range" 
                id="search-radius" 
                v-model.number="form.radius" 
                min="1" 
                max="20" 
                step="1"
                class="radius-slider"
              >
              <div class="slider-value">{{ form.radius }} km</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.replace">
              Replace existing POIs
            </label>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="searching">
              <i v-if="searching" class="fas fa-spinner fa-spin"></i>
              {{ searching ? 'Searching...' : 'Find Points of Interest' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'PoiFinderForm',
    
    props: {
      tripId: {
        type: [Number, String],
        required: true
      },
      routeSegments: {
        type: Array,
        required: true
      }
    },
    
    data() {
      return {
        form: {
          segmentId: '',
          categories: ['tourist_attraction', 'natural_feature'],
          radius: 5,
          replace: true
        },
        searching: false,
        errorMessage: '',
        availableCategories: [
          { value: 'tourist_attraction', label: 'Attractions', icon: 'fas fa-landmark' },
          { value: 'natural_feature', label: 'Nature', icon: 'fas fa-mountain' },
          { value: 'museum', label: 'Museums', icon: 'fas fa-museum' },
          { value: 'restaurant', label: 'Restaurants', icon: 'fas fa-utensils' },
          { value: 'park', label: 'Parks', icon: 'fas fa-tree' },
          { value: 'entertainment', label: 'Entertainment', icon: 'fas fa-theater-masks' }
        ]
      };
    },
    
    methods: {
      ...mapActions('pois', ['findPoisForSegment']),
      
      getSegmentName(segment) {
        const originName = segment.origin?.name || 'Unknown';
        const destinationName = segment.destination?.name || 'Unknown';
        return `${originName} to ${destinationName}`;
      },
      
      async findPois() {
        if (!this.form.segmentId) {
          this.errorMessage = 'Please select a route segment.';
          return;
        }
        
        if (this.form.categories.length === 0) {
          this.errorMessage = 'Please select at least one category.';
          return;
        }
        
        try {
          this.errorMessage = '';
          this.searching = true;
          
          // Convert radius from km to meters
          const radiusInMeters = this.form.radius * 1000;
          
          if (this.form.segmentId === 'all') {
            // Search POIs for all segments
            const promises = this.routeSegments.map(segment => {
              return this.findPoisForSegment({
                segmentId: segment.id,
                options: {
                  categories: this.form.categories,
                  radius: radiusInMeters,
                  replace: this.form.replace
                }
              });
            });
            
            await Promise.all(promises);
          } else {
            // Search POIs for specific segment
            await this.findPoisForSegment({
              segmentId: this.form.segmentId,
              options: {
                categories: this.form.categories,
                radius: radiusInMeters,
                replace: this.form.replace
              }
            });
          }
          
          this.$emit('pois-found');
        } catch (error) {
          this.errorMessage = error.message || 'Failed to find points of interest.';
        } finally {
          this.searching = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .poi-finder-form {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .finder-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .finder-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: #777;
  }
  
  .finder-content {
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
  }
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .category-checkbox {
    display: flex;
    align-items: center;
    font-weight: normal;
    cursor: pointer;
  }
  
  .category-checkbox input {
    margin-right: 0.5rem;
  }
  
  .category-checkbox i {
    margin-right: 0.5rem;
    color: #3498db;
  }
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .radius-slider {
    flex: 1;
    height: 5px;
    background-color: #ddd;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 5px;
  }
  
  .radius-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background-color: #3498db;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .radius-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background-color: #3498db;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  
  .slider-value {
    font-size: 0.9rem;
    color: #7f8c8d;
    min-width: 48px;
    text-align: right;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    font-weight: normal;
    cursor: pointer;
  }
  
  .checkbox-label input {
    margin-right: 0.5rem;
  }
  
  .error-message {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  /* Responsive adjustments */
  @media (min-width: 768px) {
    .categories-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .categories-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/RouteDetails/PoiFinderForm.vue -->
  