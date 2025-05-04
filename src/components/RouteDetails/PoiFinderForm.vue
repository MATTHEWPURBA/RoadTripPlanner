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
          <label class="form-label">Categories of Interest</label>
          <div class="categories-grid">
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.categories" value="tourist_attraction">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                <i class="fas fa-landmark"></i> Attractions
              </span>
            </label>
            
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.categories" value="natural_feature">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                <i class="fas fa-mountain"></i> Nature
              </span>
            </label>
            
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.categories" value="museum">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                <i class="fas fa-museum"></i> Museums
              </span>
            </label>
            
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.categories" value="restaurant">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                <i class="fas fa-utensils"></i> Restaurants
              </span>
            </label>
            
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.categories" value="park">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                <i class="fas fa-tree"></i> Parks
              </span>
            </label>
            
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.categories" value="entertainment">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                <i class="fas fa-theater-masks"></i> Entertainment
              </span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Search Radius (km)</label>
          <input type="range" class="radius-slider" v-model="form.radius" min="1" max="10">
          <div class="slider-value">{{ form.radius }} km</div>
        </div>

        <div class="form-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.replace">
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Replace existing POIs</span>
          </label>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="$emit('close')">Cancel</button>
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
  border-radius: 12px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.finder-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.finder-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #777;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.finder-content {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: #2c3e50;
}

select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

/* Custom checkbox styling */
.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.checkbox-item:hover {
  background-color: #f8f9fa;
}

.checkbox-item input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-item:hover .checkbox-custom {
  border-color: #3498db;
}

.checkbox-item input:checked ~ .checkbox-custom {
  background-color: #3498db;
  border-color: #3498db;
}

/* Checkmark */
.checkbox-custom::after {
  content: "";
  display: none;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.checkbox-item input:checked ~ .checkbox-custom::after {
  display: block;
}

.checkbox-label {
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
  color: #2c3e50;
}

.checkbox-label i {
  margin-right: 0.5rem;
  color: #3498db;
  font-size: 1.1rem;
}

/* Radius slider */
.radius-slider {
  width: 100%;
  height: 5px;
  background-color: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 5px;
  margin: 10px 0;
}

.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background-color: #3498db;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.radius-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background-color: #3498db;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-value {
  font-size: 0.9375rem;
  color: #7f8c8d;
  text-align: center;
  margin-top: 0.5rem;
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-outline {
  background-color: white;
  border: 2px solid #ddd;
  color: #2c3e50;
}

.btn-outline:hover {
  border-color: #3498db;
  color: #3498db;
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
  
  .finder-content {
    padding: 1rem;
  }
}
</style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/RouteDetails/PoiFinderForm.vue -->
  