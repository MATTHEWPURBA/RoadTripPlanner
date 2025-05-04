<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1>Plan Your Perfect Road Trip</h1>
        <p>Map your journey, discover attractions, and make the most of your adventure</p>
        <div class="hero-actions">
          <router-link to="/trip/new" class="btn btn-primary btn-lg">
            <i class="fas fa-plus"></i>
            Start Planning
          </router-link>
          <button @click="showDemo" class="btn btn-outline btn-lg">
            <i class="fas fa-play"></i>
            See Demo
          </button>
        </div>
      </div>
    </section>
  
      <section class="features">
        <h2 class="section-title">Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <h3>Route Planning</h3>
            <p>Add destinations, rearrange stops, and visualize your journey on interactive maps</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-landmark"></i>
            </div>
            <h3>Discover Points of Interest</h3>
            <p>Find attractions, natural features, and hidden gems along your route</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-hotel"></i>
            </div>
            <h3>Accommodation Options</h3>
            <p>Get suggestions for hotels and rest stops for longer journeys</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <h3>Event Discovery</h3>
            <p>Find events and activities happening during your trip dates</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-gas-pump"></i>
            </div>
            <h3>Trip Statistics</h3>
            <p>Calculate journey time, distance, and estimated fuel consumption</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-save"></i>
            </div>
            <h3>Save Your Plans</h3>
            <p>Your trips are automatically saved to your browser's local storage</p>
          </div>
        </div>
      </section>
  
      <section class="my-trips" v-if="trips.length > 0">
      <h2 class="section-title">My Trips</h2>
      <div class="trips-grid">
        <div v-for="trip in trips" :key="trip.id" class="trip-card">
          <div class="trip-card-header">
            <h3>{{ trip.name }}</h3>
            <span v-if="trip.start_date" class="trip-dates">
              {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
            </span>
          </div>
          
          <div class="trip-description" v-if="trip.description">
            <p>{{ truncateDescription(trip.description, 100) }}</p>
          </div>
          
          <div class="trip-stats">
            <div class="stat">
              <i class="fas fa-road"></i>
              <span>{{ formatDistance(trip.total_distance) }}</span>
            </div>
            <div class="stat">
              <i class="fas fa-clock"></i>
              <span>{{ formatDuration(trip.total_duration) }}</span>
            </div>
            <div class="stat">
              <i class="fas fa-gas-pump"></i>
              <span>{{ formatFuel(trip.fuel_consumption) }}</span>
            </div>
          </div>
          
          <div class="trip-actions">
            <router-link :to="`/trip/${trip.id}`" class="btn btn-primary">
              View Details
            </router-link>
            <button @click.stop="deleteTrip(trip.id)" class="btn btn-danger btn-icon">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="trip-card new-trip-card">
          <div class="new-trip-content">
            <i class="fas fa-plus-circle"></i>
            <h3>New Adventure</h3>
            <p>Start planning your next road trip</p>
            <router-link to="/trip/new" class="btn btn-primary">Create Trip</router-link>
          </div>
        </div>
      </div>
    </section>


    <!-- Add a debug section to help diagnose issues -->
    <section v-if="trips.length === 0" class="debug-section">
      <h3>No trips found</h3>
      <p>API might not be connected or returning data.</p>
      <button @click="fetchTrips" class="btn">Retry Loading Trips</button>
    </section>


    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  
  export default {
    name: 'HomePage',
    
    created() {
      // Fetch trips when component is created
      this.loadTrips();
    },
    
    computed: {
      ...mapGetters('trips', ['allTrips']),
      
      trips() {
        console.log('Current trips in component:', this.allTrips); // Debug log
        return this.allTrips;
      }
    },
    
    methods: {
      ...mapActions('trips', ['fetchTrips', 'deleteTrip']),
      

      async loadTrips() {
      try {
        await this.fetchTrips();
        console.log('Trips loaded successfully');
      } catch (error) {
        console.error('Failed to load trips:', error);
      }
    },


      showDemo() {
        // Navigate to a demo trip or create one if not exists
        const demoTripId = 1; // This would normally be dynamic
        this.$router.push(`/trip/${demoTripId}`);
      },
      


      // Add this method to safely check if destinations exist
    hasDestinations(trip) {
      return trip.destinations && trip.destinations.length > 0;
    },
    
    // Add this method to truncate long descriptions
    truncateDescription(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    // Add fuel formatting
    formatFuel(fuel) {
      return fuel ? `${parseFloat(fuel).toFixed(1)} L` : '';
    },


      formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      },
      
      formatDistance(distance) {
        return distance ? `${parseFloat(distance).toFixed(1)} km` : '';
      },
      
      formatDuration(seconds) {
        if (!seconds) return '';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let result = '';
        if (hours > 0) {
          result += `${hours}h `;
        }
        result += `${minutes}m`;
        
        return result;
      }
    }
  };
  </script>
  
  <style scoped>
.home-page {
  padding-bottom: 2rem;
}

/* Hero section */
.hero {
  background: linear-gradient(rgba(52, 152, 219, 0.9), rgba(44, 62, 80, 0.9)), 
              url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 3rem 1rem;
  margin: -1rem -1rem 2rem -1rem;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-lg {
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  gap: 0.75rem;
}

/* Features section */
.features {
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.feature-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.5;
  font-size: 0.9375rem;
}

/* My Trips section */
.trips-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.trip-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.trip-card-header {
  margin-bottom: 1rem;
}

.trip-card-header h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: #2c3e50;
  font-weight: 600;
}

.trip-dates {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.trip-description {
  margin-bottom: 1rem;
  color: #555;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.trip-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #2c3e50;
}

.stat i {
  color: #3498db;
  font-size: 1rem;
}

.trip-actions {
  margin-top: auto;
  display: flex;
  gap: 0.75rem;
}

.trip-actions .btn {
  flex: 1;
}

.btn-icon {
  width: 44px;
  flex: none;
}

.new-trip-card {
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px;
  background-color: #fafbfc;
  transition: all 0.2s;
}

.new-trip-card:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
  transform: translateY(-2px);
}

.new-trip-content i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.new-trip-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.new-trip-content p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

/* Tablet and up */
@media (min-width: 640px) {
  .hero {
    padding: 4rem 2rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trips-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero {
    padding: 5rem 2rem;
  }
  
  .hero h1 {
    font-size: 3rem;
  }
  
  .hero p {
    font-size: 1.25rem;
  }
  
  .feature-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .trips-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}
</style>




<!--This file is part of the Vue Front End framework. -->

<!-- src/views/HomePage.vue -->
