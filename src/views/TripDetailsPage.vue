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
          <div>
            <h2 class="page-title">{{ trip.name }}</h2>
            <p v-if="trip.description" class="page-subtitle">{{ trip.description }}</p>
          </div>
          <div class="page-actions">
            <router-link to="/" class="btn btn-outline">
              <i class="fas fa-arrow-left"></i> Back
            </router-link>
          </div>
        </div>
  
        <!-- Main content grid -->
        <div class="content-grid">
          <!-- Left column - Map and Summary -->
          <div class="map-column">
            <div class="map-container">
              <TripMap 
                :trip-id="tripId" 
                :destinations="destinations" 
                :route-segments="routeSegments" 
                :points-of-interest="showPois ? pointsOfInterest : []"
                height="500px"
                @update-destination="handleUpdateDestination"
                @destination-added="handleDestinationAdded"
              />
            </div>
            
            <div class="toggle-container">
              <label class="toggle-switch">
                <input type="checkbox" v-model="showPois">
                <span class="toggle-slider"></span>
                <span class="toggle-label">Show Points of Interest</span>
              </label>
            </div>
            
            <div class="summary-container">
              <TripSummary 
                :trip="trip" 
                @edit-trip="editTrip"
                @routes-updated="loadTrip" 
              />
            </div>
          </div>
  
          <!-- Right column - Destinations and POIs -->
          <div class="details-column">
            <div class="destinations-container">
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
            
            <div v-if="showPois && pointsOfInterest.length > 0" class="poi-container">
              <PointOfInterestList 
                :points-of-interest="pointsOfInterest"
                :selected-poi-id="selectedPoiId"
                @select-poi="selectPoi"
              />
            </div>
            
            <div v-if="routeSegments.length > 0" class="actions-container">
              <div class="card">
                <h3 class="card-title">Discover</h3>
                <div class="action-buttons">
                  <button @click="findPointsOfInterest" class="btn btn-block">
                    <i class="fas fa-search"></i> Find Points of Interest
                  </button>
                  <button v-if="hasLongSegments" @click="findAccommodation" class="btn btn-block">
                    <i class="fas fa-hotel"></i> Find Places to Stay
                  </button>
                  <button v-if="trip.start_date" @click="findEvents" class="btn btn-block">
                    <i class="fas fa-calendar-alt"></i> Find Events
                  </button>
                </div>
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
        // Check if any route segment is longer than 3 hours (10800 seconds)
        return this.routeSegments.some(segment => segment.duration > 10800);
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
          
          // Fetch trip with all related data
          const trip = await this.fetchTrip(this.tripId);
          
          // Set route segments in store
          if (trip.route_segments) {
            this.setRouteSegments(trip.route_segments);
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
  }
  
  /* Loading and error states */
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
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
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    color: #2c3e50;
  }
  
  .page-subtitle {
    margin: 0;
    color: #7f8c8d;
    font-size: 1rem;
  }
  
  /* Main content grid */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .map-container {
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .toggle-container {
    margin-bottom: 1rem;
  }
  
  .toggle-switch {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
  
  .toggle-slider {
    position: relative;
    width: 44px;
    height: 24px;
    background-color: #ccc;
    border-radius: 24px;
    margin-right: 10px;
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
  }
  
  .toggle-switch input:checked + .toggle-slider {
    background-color: #3498db;
  }
  
  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }
  
  .toggle-label {
    font-size: 0.9rem;
    color: #555;
  }
  
  .summary-container,
  .destinations-container,
  .poi-container,
  .actions-container {
    margin-bottom: 1.5rem;
  }
  
  .card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .card-title {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn-block {
    display: block;
    width: 100%;
    text-align: center;
  }
  
  /* Modal */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: relative;
    z-index: 2001;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .poi-finder-modal {
    max-width: 600px;
  }
  
  /* Responsive layout */
  @media (min-width: 768px) {
    .content-grid {
      grid-template-columns: 3fr 2fr;
    }
  }
  
  @media (max-width: 767px) {
    .page-header {
      flex-direction: column;
    }
    
    .page-actions {
      margin-top: 1rem;
    }
  }
  </style>