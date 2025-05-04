<template>
  <div class="trip-details-page">
    <!-- Loading and error states -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading trip details...</p>
    </div>

    <div v-else-if="!trip" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h3>Trip Not Found</h3>
      <p>The trip you're looking for doesn't exist or has been deleted.</p>
      <router-link to="/" class="btn">Return to Home</router-link>
    </div>

    <!-- Trip content when loaded -->
    <template v-else>
      <div class="page-header">
        <div class="header-info">
          <h2 class="page-title">{{ trip.name }}</h2>
          <p v-if="trip.description" class="page-subtitle">{{ trip.description }}</p>
        </div>
        <router-link to="/" class="btn btn-outline btn-sm">
          <i class="fas fa-arrow-left"></i>
          <span class="btn-text">Back</span>
        </router-link>
      </div>

      <!-- Mobile-optimized layout -->
      <div class="content-layout">
        <!-- Map section -->
        <div class="map-section">
          <TripMap 
            :trip-id="tripId" 
            :destinations="destinations" 
            :route-segments="routeSegments" 
            :points-of-interest="showPois ? pointsOfInterest : []"
            :height="mapHeight"
            @update-destination="handleUpdateDestination"
            @destination-added="handleDestinationAdded"
          />
          
          <div class="map-controls">
            <label class="toggle-switch">
              <input type="checkbox" v-model="showPois">
              <span class="toggle-slider"></span>
              <span class="toggle-label">Show Points of Interest</span>
            </label>
          </div>
        </div>
        
        <!-- Summary section -->
        <div class="summary-section">
          <TripSummary 
            :trip="trip" 
            @edit-trip="editTrip"
            @routes-updated="loadTrip" 
          />
        </div>

        <!-- Destinations section -->
        <div class="destinations-section">
          <DestinationList 
            :destinations="destinations" 
            :route-segments="routeSegments"
            :trip-id="tripId"
            :selected-destination-id="selectedDestinationId"
            @select-destination="selectDestination"
            @add-destination="showDestinationForm = true"
            @edit-destination="editDestination"
            @delete-destination="deleteDestination"
            @reorder-destinations="reorderDestinations"
          />
        </div>
        
        <!-- POIs section -->
        <div v-if="showPois && pointsOfInterest.length > 0" class="poi-section">
          <PointOfInterestList 
            :points-of-interest="pointsOfInterest"
            :selected-poi-id="selectedPoiId"
            @select-poi="selectPoi"
          />
        </div>
        
        <!-- Actions section -->
        <div v-if="routeSegments.length > 0" class="actions-section">
          <div class="actions-card">
            <h3 class="actions-title">Discover</h3>
            <div class="action-buttons">
              <button @click="findPointsOfInterest" class="btn btn-block">
                <i class="fas fa-search"></i>
                Find Points of Interest
              </button>
              <button @click="findAccommodation" class="btn btn-block">
                <i class="fas fa-hotel"></i>
                Find Places to Stay
              </button>
              <button v-if="trip.start_date" @click="findEvents" class="btn btn-block">
                <i class="fas fa-calendar-alt"></i>
                Find Events
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  




      
      <!-- Modals and dialogs -->
      <div v-if="showDestinationForm" class="modal">
        <div class="modal-backdrop" @click="showDestinationForm = false"></div>
        <div class="modal-content">
          <DestinationForm 
            :trip-id="tripId"
            :destination="destinationToEdit"
            :max-order="destinations.length"
            @close="closeDestinationForm"
            @add-destination="addDestination"
            @update-destination="updateDestination"
          />
        </div>
      </div>
      
      <!-- POI finder modal -->
      <div v-if="showPoiFinder" class="modal">
        <div class="modal-backdrop" @click="showPoiFinder = false"></div>
        <div class="modal-content poi-finder-modal">
          <PoiFinderForm
            :trip-id="tripId"
            :route-segments="routeSegments"
            @close="showPoiFinder = false"
            @pois-found="handlePoisFound"
          />
        </div>
      </div>
      
      <!-- Accommodation finder modal -->
      <div v-if="showAccommodationFinder" class="modal">
        <div class="modal-backdrop" @click="showAccommodationFinder = false"></div>
        <div class="modal-content">
          <AccommodationFinderForm
            :trip-id="tripId"
            :route-segments="routeSegments"
            @close="showAccommodationFinder = false"
            @accommodations-found="handleAccommodationsFound"
          />
        </div>
      </div>
      
      <!-- Events finder modal -->
      <div v-if="showEventsFinder" class="modal">
        <div class="modal-backdrop" @click="showEventsFinder = false"></div>
        <div class="modal-content">
          <EventsFinderForm
            :trip-id="tripId"
            :start-date="trip && trip.start_date"
            :end-date="trip && trip.end_date"
            @close="showEventsFinder = false"
            @events-found="handleEventsFound"
          />
        </div>
      </div>
    </div>

    
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import TripMap from '@/components/Map/TripMap.vue';
  import TripSummary from '@/components/Summary/TripSummary.vue';
  import DestinationList from '@/components/Destinations/DestinationList.vue';
  import DestinationForm from '@/components/Destinations/DestinationForm.vue';
  import PointOfInterestList from '@/components/RouteDetails/PointOfInterestList.vue';
  import PoiFinderForm from '@/components/RouteDetails/PoiFinderForm.vue';
  import AccommodationFinderForm from '@/components/RouteDetails/AccommodationFinderForm.vue';
  import EventsFinderForm from '@/components/RouteDetails/EventsFinderForm.vue';
  
  export default {
    name: 'TripDetailsPage',
    
    components: {
      TripMap,
      TripSummary,
      DestinationList,
      DestinationForm,
      PointOfInterestList,
      PoiFinderForm,
      AccommodationFinderForm,
      EventsFinderForm
    },
    
    props: {
      id: {
        type: [String, Number],
        required: true
      }
    },
    
    data() {
      return {
        loading: true,
        showDestinationForm: false,
        destinationToEdit: null,
        selectedDestinationId: null,
        selectedPoiId: null,
        showPois: true,
        showPoiFinder: false,
        showAccommodationFinder: false,
        showEventsFinder: false
      };
    },
    
    computed: {
      ...mapGetters('trips', ['currentTrip']),
      ...mapGetters('destinations', ['sortedDestinations']),
      ...mapGetters('routes', ['allRouteSegments']),
      ...mapGetters('pois', ['allPois', 'allAccommodations', 'allEvents']),
      
      tripId() {
        return parseInt(this.id);
      },
      
      trip() {
        return this.currentTrip;
      },
      
      destinations() {
        return this.sortedDestinations;
      },
      
      routeSegments() {
        return this.allRouteSegments;
      },
      
      pointsOfInterest() {
        return this.allPois;
      },
      
      hasLongSegments() {
        // Check if any route segment is longer than 1 hours (3600 seconds)
        return this.routeSegments.some(segment => segment.duration > 3600);
      }
    },
    
    watch: {
      // Re-fetch trip data if ID changes
      id: {
        handler() {
          this.loadTrip();
        },
        immediate: true
      }
    },
    
    methods: {
      ...mapActions('trips', ['fetchTrip', 'calculateRoutes']),
      ...mapActions('destinations', [
        'addDestination', 
        'updateDestination', 
        'deleteDestination',
        'reorderDestinations',
        'selectDestination'
      ]),
      ...mapActions('routes', ['setRouteSegments']),
      ...mapActions('pois', [
        'fetchPoisForTrip', 
        'selectPoi',
        'findPoisForSegment',
        'findAccommodation',
        'findEvents'
      ]),
      
      async loadTrip() {
        try {
          this.loading = true;

          // Clear existing data first
          await this.$store.dispatch('destinations/setDestinations', []);
          await this.$store.dispatch('routes/setRouteSegments', []);
          
          // Fetch trip with all related data
          const trip = await this.fetchTrip(this.tripId);
          
          // Explicitly set destinations from the loaded trip
          if (trip.destinations) {
            await this.$store.dispatch('destinations/setDestinations', trip.destinations);
          }

          // Set route segments in store
          if (trip.route_segments) {
            await this.setRouteSegments(trip.route_segments);
          }
          
          // Fetch POIs
          await this.fetchPoisForTrip(this.tripId);
          
          // Clear selections
          this.selectedDestinationId = null;
          this.selectedPoiId = null;
        } catch (error) {
          console.error('Error loading trip:', error);
        } finally {
          this.loading = false;
        }
      },
      
      editTrip() {
        this.$router.push(`/trip/${this.tripId}/edit`);
      },
      
      editDestination(destination) {
        this.destinationToEdit = destination;
        this.showDestinationForm = true;
      },
      
      closeDestinationForm() {
        this.showDestinationForm = false;
        this.destinationToEdit = null;
      },
      
      async handleAddDestination(destinationData) {
        try {
          await this.addDestination(destinationData);
          this.closeDestinationForm();
          
          // Recalculate routes if we have at least 2 destinations
          if (this.destinations.length >= 2) {
            await this.calculateRoutes(this.tripId);
          }
        } catch (error) {
          console.error('Error adding destination:', error);
        }
      },
      
      async handleUpdateDestination({ id, data }) {
        try {
          await this.updateDestination({ id, destinationData: data });
          
          // If this was editing a form, close it
          if (this.showDestinationForm) {
            this.closeDestinationForm();
          }
          
          // Recalculate routes if coordinates were changed
          if (data.latitude !== undefined || data.longitude !== undefined) {
            await this.calculateRoutes(this.tripId);
          }
        } catch (error) {
          console.error('Error updating destination:', error);
        }
      },
      
      async handleDeleteDestination(destinationId) {
        try {
          await this.deleteDestination(destinationId);
          
          // Recalculate routes if we still have at least 2 destinations
          if (this.destinations.length >= 2) {
            await this.calculateRoutes(this.tripId);
          }
        } catch (error) {
          console.error('Error deleting destination:', error);
        }
      },
      
      async handleReorderDestinations(updatedDestinations) {
        try {
          await this.reorderDestinations({
            tripId: this.tripId,
            destinations: updatedDestinations
          });
          
          // Recalculate routes
          await this.calculateRoutes(this.tripId);
        } catch (error) {
          console.error('Error reordering destinations:', error);
        }
      },
      
      handleDestinationAdded() {
        // Recalculate routes if we have at least 2 destinations
        if (this.destinations.length >= 2) {
          this.calculateRoutes(this.tripId);
        }
      },
      
      selectDestination(destination) {
        this.selectedDestinationId = destination.id;
        this.selectDestination(destination);
      },
      
      selectPoi(poi) {
        this.selectedPoiId = poi.id;
        this.selectPoi(poi);
      },
      
      findPointsOfInterest() {
        this.showPoiFinder = true;
      },
      
      findAccommodation() {
        this.showAccommodationFinder = true;
      },
      
      findEvents() {
        this.showEventsFinder = true;
      },
      
      handlePoisFound() {
        this.showPoiFinder = false;
        this.showPois = true;
      },
      
      handleAccommodationsFound() {
        this.showAccommodationFinder = false;
      },
      
      handleEventsFound() {
        this.showEventsFinder = false;
      }
    }
  };
  </script>
  
 <style scoped>
.trip-details-page {
  position: relative;
  min-height: 100vh;
}


/* Enhanced modal positioning with better spacing */
.modal {
  animation: fadeIn 0.3s ease-out;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem 1rem; /* Increased padding for better spacing */
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  animation: slideUp 0.3s ease-out;
  position: relative;
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-top: 2rem; /* Add top margin to create space from cards */
  margin-bottom: 2rem; /* Add bottom margin for balance */
}

/* Loading and error states */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  min-height: 50vh;
}

.loading-spinner,
.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #3498db;
}

.error-icon {
  color: #e74c3c;
}

/* Page header */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-info {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  word-break: break-word;
}

.page-subtitle {
  margin: 0.5rem 0 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.btn-text {
  display: none;
}

/* Content layout - Mobile first */
.content-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Map section */
.map-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.map-controls {
  padding: 1rem;
  border-top: 1px solid #eee;
}

/* Toggle switch */
.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 24px;
  background-color: #ddd;
  border-radius: 24px;
  transition: background-color 0.3s;
}

.toggle-switch input {
  display: none;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #3498db;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 0.9375rem;
  color: #555;
}

/* Section styling */
.summary-section,
.destinations-section,
.poi-section,
.actions-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.actions-card {
  padding: 1.5rem;
}

.actions-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

/* Tablet and up */
@media (min-width: 768px) {

  .modal {
    padding: 3rem 2rem; /* Even more padding on larger screens */
  }
  
  .modal-content {
    margin-top: 3rem; /* Increased spacing on larger screens */
    margin-bottom: 3rem;
  }
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .btn-text {
    display: inline;
  }
  
  .content-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 100%;
    margin: 0 auto;
  }
  
  /* Map takes full width */
  .map-section {
    grid-column: 1;
    grid-row: 1;
    min-height: 450px;
  }
  
  /* Summary below map */
  .summary-section {
    grid-column: 1;
    grid-row: 2;
  }
  
  /* Destinations below summary */
  .destinations-section {
    grid-column: 1;
    grid-row: 3;
  }
  
  /* POI section below destinations */
  .poi-section {
    grid-column: 1;
    grid-row: 4;
  }
  
  /* Actions below POI */
  .actions-section {
    grid-column: 1;
    grid-row: 5;
  }
}

@media (max-width: 767px) {
  .modal {
    align-items: flex-start; /* Align to top on mobile */
    padding-top: 4rem; /* Add substantial top padding */
  }
}

/* Desktop - Modified layout */
@media (min-width: 1024px) {
  .page-title {
    font-size: 2rem;
  }
  
  .content-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Map takes full width */
  .map-section {
    grid-column: 1 / -1;
    grid-row: 1;
  }
  
  /* Summary and POI are side by side below map */
  .summary-section {
    grid-column: 1;
    grid-row: 2;
  }
  
  .poi-section {
    grid-column: 2;
    grid-row: 2;
  }
  
  /* Destinations and Actions are below */
  .destinations-section {
    grid-column: 1;
    grid-row: 3;
  }
  
  .actions-section {
    grid-column: 2;
    grid-row: 3;
  }
  
  /* If POI is not shown, summary takes full width */
  .poi-section:empty + .destinations-section {
    grid-column: 1;
    grid-row: 3;
  }
  
  /* Adjust map height for desktop */
  .map-section {
    min-height: 600px;
  }
}

/* Extra large screens */
@media (min-width: 1400px) {
  .content-layout {
    max-width: 1600px;
  }
}
</style>



<!--This file is part of the Vue Front End framework. -->


<!-- src/views/TripDetailsPage.vue -->
