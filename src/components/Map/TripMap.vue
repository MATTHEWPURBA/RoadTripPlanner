<template>
    <div class="trip-map-container">
      <div class="map-controls" v-if="!readonly">
        <div class="map-control-panel">
          <button 
            @click="toggleMapClick" 
            :class="['map-control-btn', { active: mapClickActive }]"
            title="Click on map to add destination"
          >
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <button 
            @click="centerMap" 
            class="map-control-btn"
            title="Center map on all destinations"
          >
            <i class="fas fa-crosshairs"></i>
          </button>
        </div>
        <div class="map-instructions" v-if="mapClickActive">
          Click on the map to add a new destination
        </div>
      </div>
      
      <div ref="mapContainer" class="map-container"></div>
      
      <div v-if="temporaryDestination" class="temp-destination-panel">
        <div class="panel-header">
          <h3>Add New Destination</h3>
          <button @click="cancelTemporaryDestination" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="panel-body">
          <div class="form-group">
            <label for="dest-name">Name</label>
            <input 
              type="text" 
              id="dest-name" 
              v-model="temporaryDestination.name"
              placeholder="Enter destination name"
            >
          </div>
          <div class="form-group">
            <label>Location</label>
            <p class="coordinates">
              {{ formatCoordinates(temporaryDestination.latitude, temporaryDestination.longitude) }}
            </p>
          </div>
          <div class="panel-actions">
            <button @click="cancelTemporaryDestination" class="btn btn-outline">Cancel</button>
            <button @click="saveTemporaryDestination" class="btn btn-primary">Add Destination</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import mapService from '@/services/mapService';
  import L from 'leaflet';
  
  export default {
    name: 'TripMap',
    
    props: {
      tripId: {
        type: [Number, String],
        required: true
      },
      destinations: {
        type: Array,
        default: () => []
      },
      routeSegments: {
        type: Array,
        default: () => []
      },
      pointsOfInterest: {
        type: Array,
        default: () => []
      },
      readonly: {
        type: Boolean,
        default: false
      },
      height: {
        type: String,
        default: '400px'
      }
    },
    
    data() {
      return {
        map: null,
        destinationMarkers: [],
        routeLines: [],
        poiMarkers: [],
        mapClickActive: false,
        tempMarker: null,
      };
    },
    
    computed: {
      ...mapGetters('destinations', ['temporaryDestination']),
      
      sortedDestinations() {
        return [...this.destinations].sort((a, b) => a.order - b.order);
      }
    },
    
    watch: {
      // Watch for changes in destinations to update map
      destinations: {
        handler() {
          this.renderDestinations();
        },
        deep: true
      },
      
      // Watch for changes in route segments to update map
      routeSegments: {
        handler() {
          this.renderRoutes();
        },
        deep: true
      },
      
      // Watch for changes in POIs to update map
      pointsOfInterest: {
        handler() {
          this.renderPointsOfInterest();
        },
        deep: true
      }
    },
    
    mounted() {
      // Initialize map
      this.initMap();
    },
    
    beforeUnmount() {
      // Clean up map when component is destroyed
      if (this.map) {
        this.map.remove();
      }
    },
    
    methods: {
      ...mapActions('destinations', [
        'setTemporaryDestination', 
        'clearTemporaryDestination',
        'addDestination'
      ]),
      
      initMap() {
        // Set the map container height from prop
        this.$refs.mapContainer.style.height = this.height;
        
        // Create map
        this.map = mapService.createMap(this.$refs.mapContainer, {
          center: [40, -95], // Default center (US)
          zoom: 4
        });
        
        // Add click listener if not readonly
        if (!this.readonly) {
          this.map.on('click', this.handleMapClick);
        }
        
        // Render map elements
        this.renderDestinations();
        this.renderRoutes();
        this.renderPointsOfInterest();
      },
      
      renderDestinations() {
        // Clear existing markers
        this.clearDestinationMarkers();
        
        if (!this.sortedDestinations.length) return;
        
        // Add markers for each destination
        this.sortedDestinations.forEach((destination, index) => {
          const position = [destination.latitude, destination.longitude];
          
          // Create marker options with label showing order
          const options = {
            title: destination.name,
            draggable: !this.readonly
          };
          
          // Create marker with popup
          const popupContent = `
            <div class="destination-popup">
              <h3>${destination.name}</h3>
              <p>${destination.address || ''}</p>
              <p class="coordinates">${this.formatCoordinates(destination.latitude, destination.longitude)}</p>
              ${index > 0 ? 
                `<p class="distance-info">
                  <i class="fas fa-road"></i> Distance from previous: 
                  ${this.getDistanceFromPrevious(destination)}
                </p>` : ''
              }
            </div>
          `;
          
          const marker = mapService.addMarkerWithPopup(this.map, position, popupContent, options);
          
          // Add event listeners for draggable markers
          if (!this.readonly) {
            marker.on('dragend', (event) => {
              this.handleMarkerDrag(event, destination);
            });
          }
          
          // Store marker reference
          this.destinationMarkers.push(marker);
        });
        
        // Fit map to show all destinations
        this.centerMap();
      },
      
      renderRoutes() {
        // Clear existing routes
        this.clearRouteLines();
        
        if (!this.routeSegments.length) return;
        
        // Add route lines for each segment
        this.routeSegments.forEach((segment) => {
          // If GeoJSON polyline exists, use it
          if (segment.polyline) {
            const options = {
              color: '#3388ff',
              weight: 5,
              opacity: 0.7
            };
            
            const routeLine = mapService.addRoute(this.map, segment.polyline, options);
            
            // Store route line reference
            this.routeLines.push(routeLine);
          } 
          // Otherwise create a simple straight line
          else if (segment.origin && segment.destination) {
            const origin = [segment.origin.latitude, segment.origin.longitude];
            const destination = [segment.destination.latitude, segment.destination.longitude];
            
            const options = {
              color: '#3388ff',
              weight: 5,
              opacity: 0.7,
              dashArray: '10, 10' // Dashed line for estimated routes
            };
            
            const routeLine = L.polyline([origin, destination], options).addTo(this.map);
            
            // Store route line reference
            this.routeLines.push(routeLine);
          }
        });
      },
      
      renderPointsOfInterest() {
        // Clear existing POI markers
        this.clearPoiMarkers();
        
        if (!this.pointsOfInterest.length) return;
        
        // Add markers for each POI
        this.pointsOfInterest.forEach((poi) => {
          const marker = mapService.addPoiMarker(this.map, poi);
          
          // Store marker reference
          this.poiMarkers.push(marker);
        });
      },
      
      clearDestinationMarkers() {
        // Remove all destination markers from map
        this.destinationMarkers.forEach(marker => {
          marker.remove();
        });
        this.destinationMarkers = [];
      },
      
      clearRouteLines() {
        // Remove all route lines from map
        this.routeLines.forEach(line => {
          line.remove();
        });
        this.routeLines = [];
      },
      
      clearPoiMarkers() {
        // Remove all POI markers from map
        this.poiMarkers.forEach(marker => {
          marker.remove();
        });
        this.poiMarkers = [];
      },
      
      centerMap() {
        // Fit map to show all destination markers
        if (this.destinationMarkers.length > 0) {
          mapService.fitMapToMarkers(this.map, this.destinationMarkers);
        }
      },
      
      toggleMapClick() {
        this.mapClickActive = !this.mapClickActive;
        
        // Change cursor style based on active state
        if (this.mapClickActive) {
          this.$refs.mapContainer.style.cursor = 'crosshair';
        } else {
          this.$refs.mapContainer.style.cursor = '';
        }
      },
      
      handleMapClick(e) {
        // Only handle clicks if map click mode is active
        if (!this.mapClickActive) return;
        
        const { lat, lng } = e.latlng;
        
        // Set temporary destination for confirmation
        this.setTemporaryDestination({
          trip_id: this.tripId,
          name: 'New Destination',
          latitude: lat,
          longitude: lng,
          order: this.destinations.length
        });
        
        // Add temporary marker
        if (this.tempMarker) {
          this.tempMarker.remove();
        }
        
        this.tempMarker = mapService.addMarker(this.map, [lat, lng], {
          draggable: false,
          opacity: 0.7,
          zIndexOffset: 1000
        });
      },
      
      handleMarkerDrag(event, destination) {
        // Update destination coordinates when marker is dragged
        const marker = event.target;
        const position = marker.getLatLng();
        
        // Emit event to parent for updating destination
        this.$emit('update-destination', {
          id: destination.id,
          data: {
            latitude: position.lat,
            longitude: position.lng
          }
        });
      },
      
      cancelTemporaryDestination() {
        // Clear temporary destination and remove marker
        if (this.tempMarker) {
          this.tempMarker.remove();
          this.tempMarker = null;
        }
        
        this.clearTemporaryDestination();
        this.mapClickActive = false;
        this.$refs.mapContainer.style.cursor = '';
      },
      
      async saveTemporaryDestination() {
        // Create a new destination from temporary data
        if (this.temporaryDestination) {
          try {
            await this.addDestination(this.temporaryDestination);
            
            // Clear temporary state
            if (this.tempMarker) {
              this.tempMarker.remove();
              this.tempMarker = null;
            }
            
            this.clearTemporaryDestination();
            
            // Disable map click mode
            this.mapClickActive = false;
            this.$refs.mapContainer.style.cursor = '';
            
            // Emit event to parent for recalculating routes
            this.$emit('destination-added');
          } catch (error) {
            console.error('Failed to add destination:', error);
          }
        }
      },
      
      formatCoordinates(lat, lng) {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      },
      
      getDistanceFromPrevious(destination) {
        // Find previous destination
        const index = this.sortedDestinations.findIndex(d => d.id === destination.id);
        if (index <= 0) return '';
        
        const prevDestination = this.sortedDestinations[index - 1];
        
        // Find route segment between these destinations
        const segment = this.routeSegments.find(s => 
          s.origin_id === prevDestination.id && s.destination_id === destination.id
        );
        
        if (segment && segment.distance) {
          return `${segment.distance.toFixed(1)} km`;
        }
        
        // If no segment found, calculate straight line distance
        const from = [prevDestination.latitude, prevDestination.longitude];
        const to = [destination.latitude, destination.longitude];
        const distance = mapService.calculateDistance(from, to);
        
        return `~${distance.toFixed(1)} km (straight line)`;
      }
    }
  };
  </script>
  
  <style scoped>
  .trip-map-container {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .map-container {
    width: 100%;
    min-height: 300px;
    z-index: 1;
  }
  
  .map-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  
  .map-control-panel {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 5px;
    display: flex;
    gap: 5px;
  }
  
  .map-control-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #333;
  }
  
  .map-control-btn:hover {
    background-color: #f5f5f5;
  }
  
  .map-control-btn.active {
    background-color: #e3f2fd;
    color: #3498db;
  }
  
  .map-instructions {
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 0.9rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .temp-destination-panel {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: calc(100% - 40px);
    max-width: 400px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }
  
  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: #777;
  }
  
  .panel-body {
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .coordinates {
    background-color: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    color: #333;
  }
  
  .panel-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 1rem;
  }
  
  .btn-outline {
    background-color: transparent;
    border: 1px solid #ddd;
    color: #333;
  }
  
  /* Destination popup style (applied through global CSS) */
  :global(.destination-popup) {
    padding: 5px;
  }
  
  :global(.destination-popup h3) {
    margin: 0 0 5px 0;
    font-size: 1rem;
  }
  
  :global(.destination-popup p) {
    margin: 5px 0;
    font-size: 0.9rem;
  }
  
  :global(.coordinates) {
    font-family: monospace;
    font-size: 0.8rem;
    color: #666;
  }
  
  :global(.distance-info) {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
  }
  
  /* Responsive adjustments */
  @media (min-width: 768px) {
    .temp-destination-panel {
      width: 400px;
    }
  }
  </style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/Map/TripMap.vue -->
