<template>
    <div class="accommodation-finder">
      <div class="finder-header">
        <h3>Find Accommodation</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="finder-content">
        <div v-if="!searching && !accommodations.length">
          <form @submit.prevent="findAccommodation">
            <div class="form-group">
              <label for="segment-select">Route Segment (3+ hours)</label>
              <select 
                id="segment-select" 
                v-model="form.segmentId"
                required
              >
                <option value="" disabled>Select a route segment</option>
                <option 
                  v-for="segment in longSegments" 
                  :key="segment.id" 
                  :value="segment.id"
                >
                  {{ getSegmentName(segment) }} ({{ formatDuration(segment.duration) }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="max-price">Maximum Price per Night</label>
              <div class="price-slider-container">
                <input 
                  type="range" 
                  id="max-price" 
                  v-model.number="form.maxPrice" 
                  min="50" 
                  max="500" 
                  step="10"
                  class="price-slider"
                >
                <div class="slider-value">${{ form.maxPrice }}</div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Minimum Rating</label>
              <div class="rating-select">
                <div 
                  v-for="rating in [1, 2, 3, 4, 5]" 
                  :key="rating"
                  class="star-rating"
                  :class="{ 'active': form.minRating >= rating }"
                  @click="form.minRating = rating"
                >
                  <i class="fas fa-star"></i>
                </div>
              </div>
            </div>
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div class="form-actions">
              <button type="button" @click="$emit('close')" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="!form.segmentId">
                Find Accommodations
              </button>
            </div>
          </form>
        </div>
        
        <div v-else-if="searching" class="searching-state">
          <div class="spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Searching for accommodation options...</p>
        </div>
        
        <div v-else>
          <h4 class="results-title">Accommodation Options</h4>
          
          <div class="accommodations-list">
            <div 
              v-for="(hotel, index) in accommodations" 
              :key="index"
              class="hotel-card"
            >
              <div class="hotel-image">
                <img 
                  :src="hotel.image_url || 'https://via.placeholder.com/150x100?text=Hotel'"
                  :alt="hotel.name"
                >
              </div>
              <div class="hotel-details">
                <h5>{{ hotel.name }}</h5>
                <div class="hotel-rating">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    class="fas"
                    :class="star <= Math.round(hotel.rating) ? 'fa-star' : 'fa-star-o'"
                  ></i>
                  <span class="rating-text">{{ hotel.rating.toFixed(1) }}</span>
                </div>
                <p class="hotel-price">${{ hotel.price }} per night</p>
                <p v-if="hotel.address" class="hotel-address">
                  <i class="fas fa-map-marker-alt"></i> {{ hotel.address }}
                </p>
              </div>
            </div>
          </div>
          
          <div v-if="accommodations.length === 0" class="empty-results">
            <p>No accommodation options found that match your criteria.</p>
          </div>
          
          <div class="results-actions">
            <button @click="resetSearch" class="btn btn-outline">
              <i class="fas fa-search"></i> New Search
            </button>
            <button @click="$emit('close')" class="btn btn-primary">Done</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapActions, mapGetters } from 'vuex';
  
  export default {
    name: 'AccommodationFinderForm',
    
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
          maxPrice: 200,
          minRating: 3
        },
        searching: false,
        errorMessage: '',
        hasSearched: false
      };
    },
    
    computed: {
      ...mapGetters('pois', ['allAccommodations']),
      
      longSegments() {
        // Filter for segments longer than 3 hours (10800 seconds)
        return this.routeSegments.filter(segment => segment.duration > 10800);
      },
      
      accommodations() {
        return this.allAccommodations;
      }
    },
    
    methods: {
      ...mapActions('pois', ['findAccommodation']),
      
      getSegmentName(segment) {
        const originName = segment.origin?.name || 'Unknown';
        const destinationName = segment.destination?.name || 'Unknown';
        return `${originName} to ${destinationName}`;
      },
      
      formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let formatted = '';
        if (hours > 0) {
          formatted += hours + 'h ';
        }
        formatted += minutes + 'm';
        
        return formatted;
      },
      
      async searchAccommodation() {
        if (!this.form.segmentId) {
          this.errorMessage = 'Please select a route segment.';
          return;
        }
        
        try {
          this.errorMessage = '';
          this.searching = true;
          
          await this.findAccommodation({
            segmentId: this.form.segmentId,
            options: {
              max_price: this.form.maxPrice,
              min_rating: this.form.minRating
            }
          });
          
          this.hasSearched = true;
        } catch (error) {
          this.errorMessage = error.message || 'Failed to find accommodation options.';
        } finally {
          this.searching = false;
        }
      },
      
      resetSearch() {
        this.hasSearched = false;
        this.form.segmentId = '';
      },
      
      closeFinderForm() {
        this.$emit('accommodations-found');
      }
    }
  };
  </script>
  
  <style scoped>
  .accommodation-finder {
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
  
  .price-slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .price-slider {
    flex: 1;
    height: 5px;
    background-color: #ddd;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 5px;
  }
  
  .price-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background-color: #3498db;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .price-slider::-moz-range-thumb {
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
  
  .rating-select {
    display: flex;
    gap: 0.5rem;
  }
  
  .star-rating {
    color: #ddd;
    cursor: pointer;
    font-size: 1.5rem;
  }
  
  .star-rating.active {
    color: #f1c40f;
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
  
  .searching-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }
  
  .spinner {
    font-size: 2rem;
    color: #3498db;
    margin-bottom: 1rem;
  }
  
  .results-title {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .accommodations-list {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .hotel-card {
    display: flex;
    background-color: #f9f9f9;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .hotel-image {
    width: 100px;
    min-width: 100px;
    height: 100px;
    overflow: hidden;
  }
  
  .hotel-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .hotel-details {
    padding: 0.75rem;
    flex: 1;
  }
  
  .hotel-details h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  .hotel-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .hotel-rating .fas.fa-star {
    color: #f1c40f;
    font-size: 0.8rem;
  }
  
  .hotel-rating .fas.fa-star-o {
    color: #ddd;
    font-size: 0.8rem;
  }
  
  .rating-text {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-left: 0.25rem;
  }
  
  .hotel-price {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }
  
  .hotel-address {
    margin: 0;
    font-size: 0.8rem;
    color: #7f8c8d;
  }
  
  .empty-results {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
  }
  
  .results-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  /* Responsive adjustments */
  @media (max-width: 480px) {
    .hotel-card {
      flex-direction: column;
    }
    
    .hotel-image {
      width: 100%;
      height: 120px;
    }
  }
  </style>