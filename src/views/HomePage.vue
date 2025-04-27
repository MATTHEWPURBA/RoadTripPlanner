<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1>Plan Your Perfect Road Trip</h1>
        <p>Map your journey, discover attractions, and make the most of your adventure</p>
        <div class="hero-actions">
          <router-link to="/trip/new" class="btn btn-primary btn-lg">Start Planning</router-link>
          <button @click="showDemo" class="btn btn-outline">See Demo</button>
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
            <span v-if="trip.start_date" class="trip-dates"> {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }} </span>
          </div>

          <div class="trip-description" v-if="trip.description">
            <p>{{ truncateDescription(trip.description, 100) }}</p>
          </div>

          <div class="trip-stats">
            <div class="stat">🛣️ {{ formatDistance(trip.total_distance) }}</div>
            <div class="stat">⏱️ {{ formatDuration(trip.total_duration) }}</div>
            <div class="stat">⛽ {{ formatFuel(trip.fuel_consumption) }}</div>
          </div>

          <div class="trip-actions">
            <router-link :to="`/trip/${trip.id}`" class="btn">View Details</router-link>
            <button @click.stop="deleteTrip(trip.id)" class="btn btn-danger">
  🗑️ Delete
</button>
          </div>
        </div>

        <div class="trip-card new-trip-card">
          <div class="new-trip-content">
            <i class="fas fa-plus-circle"></i>
            <h3>New Adventure</h3>
            <p>Start planning your next road trip</p>
            <router-link to="/trip/new" class="btn btn-primary">Create New Trip</router-link>
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
    },
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
    },
  },
};
</script>

<style scoped>
.home-page {
  padding-bottom: 2rem;
}

/* Hero section */
.hero {
  background: linear-gradient(rgba(52, 152, 219, 0.8), rgba(44, 62, 80, 0.9)), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 4rem 1rem;
  margin: -1rem;
  margin-bottom: 2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.btn-primary {
  background-color: #2ecc71;
  color: white;
}

.btn-primary:hover {
  background-color: #27ae60;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Features section */
.features {
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.feature-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.5;
}

/* My Trips section */
.trips-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.debug-section {
  background-color: #ffe0e0;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

/* This fixes potentially hidden content */
.trip-card {
  min-height: 250px;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.trip-card-header {
  margin-bottom: 1rem;
}

.trip-card-header h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.trip-dates {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.trip-description {
  margin-bottom: 1rem;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.4;
}

.destination-count {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.destination-preview {
  color: #7f8c8d;
}

.trip-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.stat i {
  color: #3498db;
}

.new-trip-card {
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.7);
}

.new-trip-content i {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
}

/* Improved delete button styling */
.btn-danger {
  background-color: #e74c3c;
  color: white;
  font-size: 1.2rem;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-danger:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-danger:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Update the trip actions layout */
.trip-actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Style for the View Details button to create visual balance */
.trip-actions .btn:not(.btn-danger) {
  background-color: #3498db;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  flex-grow: 1;
  text-align: center;
}

.trip-actions .btn:not(.btn-danger):hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (min-width: 768px) {
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

@media (min-width: 992px) {
  .feature-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .trips-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
