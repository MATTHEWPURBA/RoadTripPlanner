<template>
  <div class="destination-list">
    <div class="list-header">
      <h3 class="section-title">{{ title || 'Destinations' }}</h3>
      <div class="list-actions" v-if="!readonly">
        <button @click="addDestination" class="btn btn-sm">
          <i class="fas fa-plus"></i>
          <span class="btn-text">Add</span>
        </button>
        <button 
          v-if="destinations.length > 1" 
          @click="enableReordering" 
          class="btn btn-sm"
          :class="{ 'active': reorderingActive }"
        >
          <i class="fas fa-sort"></i>
          <span class="btn-text">Reorder</span>
        </button>
      </div>
    </div>
    
    <transition-group 
      name="destinations-list"
      tag="ul"
      class="destinations"
      :class="{ 'reordering': reorderingActive }"
    >
      <li 
        v-for="(destination, index) in sortedDestinations" 
        :key="destination.id"
        class="destination-item"
        :class="{ 'selected': selectedDestinationId === destination.id }"
        @click="selectDestination(destination)"
      >
        <div class="destination-order">{{ index + 1 }}</div>
        <div class="destination-content">
          <h4>{{ destination.name }}</h4>
          <p v-if="destination.address" class="address">{{ destination.address }}</p>
          <div v-if="showDistances && index > 0" class="distance-info">
            <span class="distance">
              <i class="fas fa-road"></i> {{ formatDistance(getDistanceFromPrevious(destination)) }}
            </span>
            <span class="duration">
              <i class="fas fa-clock"></i> {{ formatDuration(getDurationFromPrevious(destination)) }}
            </span>
          </div>
        </div>
        
        <div class="destination-actions">
          <button 
            v-if="reorderingActive && index > 0" 
            @click.stop="moveUp(destination)" 
            class="btn-icon"
            title="Move up"
          >
            <i class="fas fa-arrow-up"></i>
          </button>
          <button 
            v-if="reorderingActive && index < destinations.length - 1" 
            @click.stop="moveDown(destination)" 
            class="btn-icon"
            title="Move down"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
          <button 
            v-if="!readonly && !reorderingActive" 
            @click.stop="editDestination(destination)" 
            class="btn-icon"
            title="Edit"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            v-if="!readonly && !reorderingActive" 
            @click.stop="confirmDelete(destination)" 
            class="btn-icon delete"
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </li>
    </transition-group>
    
    <div v-if="reorderingActive" class="reorder-actions">
      <button @click="cancelReordering" class="btn btn-outline">Cancel</button>
      <button @click="saveReordering" class="btn btn-primary">Save Order</button>
    </div>
    
    <div v-if="destinations.length === 0" class="empty-state">
      <i class="fas fa-map-marker-alt"></i>
      <p>No destinations added yet</p>
    </div>
      





      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirm Deletion</h3>
            <button @click="cancelDelete" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the destination: <strong>{{ destinationToDelete?.name }}</strong>?</p>
            <p class="warning">This action cannot be undone.</p>
          </div>
          <div class="modal-actions">
            <button @click="cancelDelete" class="btn btn-outline">Cancel</button>
            <button @click="deleteDestination" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>




    </div>
  </template>
  
  <script>
  export default {
    name: 'DestinationList',
    
    watch: {
      destinations: {
        handler(newVal) {
          console.log('Destinations prop changed:', newVal);
        },
        deep: true,
        immediate: true
      }
    },

    props: {
      destinations: {
        type: Array,
        required: true
      },
      routeSegments: {
        type: Array,
        default: () => []
      },
      selectedDestinationId: {
        type: [Number, String],
        default: null
      },
      tripId: {
        type: [Number, String],
        required: true
      },
      title: {
        type: String,
        default: ''
      },
      readonly: {
        type: Boolean,
        default: false
      },
      showDistances: {
        type: Boolean,
        default: true
      }
    },
    
    data() {
      return {
        reorderingActive: false,
        reorderingDestinations: [],
        showDeleteModal: false,
        destinationToDelete: null
      };
    },
    
    computed: {
      sortedDestinations() {
        console.log('Computing sortedDestinations');
        console.log('Reordering active:', this.reorderingActive);
        console.log('Reordering destinations:', this.reorderingDestinations);
        console.log('Original destinations:', this.destinations);
        if (this.reorderingActive) {
          return this.reorderingDestinations;
        }
        
        return [...this.destinations].sort((a, b) => a.order - b.order);
      }
    },
    
    methods: {
      selectDestination(destination) {
        if (!this.reorderingActive) {
          this.$emit('select-destination', destination);
        }
      },
      
      addDestination() {
        this.$emit('add-destination');
      },
      
      editDestination(destination) {
        this.$emit('edit-destination', destination);
      },
      
      confirmDelete(destination) {
        this.destinationToDelete = destination;
        this.showDeleteModal = true;
      },
      
      cancelDelete() {
        this.destinationToDelete = null;
        this.showDeleteModal = false;
      },
      
      deleteDestination() {
        if (this.destinationToDelete) {
          this.$emit('delete-destination', this.destinationToDelete.id);
          this.showDeleteModal = false;
          this.destinationToDelete = null;
        }
      },
      
      enableReordering() {
        if (this.reorderingActive) {
          this.cancelReordering();
        } else {
        // Create a copy of sorted destinations BEFORE setting reorderingActive
        const sortedCopy = [...this.destinations].sort((a, b) => a.order - b.order);

        // Deep copy each destination object
        this.reorderingDestinations = sortedCopy.map(dest => ({
          id: dest.id,
          name: dest.name,
          address: dest.address,
          order: dest.order,
          latitude: dest.latitude,
          longitude: dest.longitude,
          trip_id: dest.trip_id
        }));


        // Now set reorderingActive
        this.reorderingActive = true;
        // Verify the copy worked
        console.log('Reordering destinations after copy:', this.reorderingDestinations);
        console.log('Number of destinations:', this.reorderingDestinations.length);


        }
      },
      
      cancelReordering() {
        this.reorderingActive = false;
        this.reorderingDestinations = [];
      },
      
      saveReordering() {
        // Create a new array with updated order values
        const updatedDestinations = this.reorderingDestinations.map((dest, index) => ({
          ...dest,
          order: index
        }));

        console.log('Emitting reorder-destinations with:', updatedDestinations);
        
        this.$emit('reorder-destinations', updatedDestinations);
        this.reorderingActive = false;
      },
      
      // Update moveUp and moveDown to properly update the array
      moveUp(destination) {
        const index = this.reorderingDestinations.findIndex(d => d.id === destination.id);
        if (index > 0) {
          // Create a new array to ensure reactivity
          const newArray = [...this.reorderingDestinations];
          // Swap elements
          [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
          this.reorderingDestinations = newArray;
        }
      },
      
      moveDown(destination) {
        const index = this.reorderingDestinations.findIndex(d => d.id === destination.id);
        if (index < this.reorderingDestinations.length - 1) {
          // Create a new array to ensure reactivity
          const newArray = [...this.reorderingDestinations];
          // Swap elements
          [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
          this.reorderingDestinations = newArray;
        }
      },
      
      getDistanceFromPrevious(destination) {
        // Find previous destination
        const sortedList = this.reorderingActive ? this.reorderingDestinations : this.sortedDestinations;
        const index = sortedList.findIndex(d => d.id === destination.id);
        if (index <= 0) return 0;
        
        const prevDestination = sortedList[index - 1];
        
        // Find route segment between these destinations
        const segment = this.routeSegments.find(s => 
          s.origin_id === prevDestination.id && s.destination_id === destination.id
        );
        
        return segment ? segment.distance : 0;
      },
      
      getDurationFromPrevious(destination) {
        // Find previous destination
        const sortedList = this.reorderingActive ? this.reorderingDestinations : this.sortedDestinations;
        const index = sortedList.findIndex(d => d.id === destination.id);
        if (index <= 0) return 0;
        
        const prevDestination = sortedList[index - 1];
        
        // Find route segment between these destinations
        const segment = this.routeSegments.find(s => 
          s.origin_id === prevDestination.id && s.destination_id === destination.id
        );
        
        return segment ? segment.duration : 0;
      },
      
      formatDistance(distance) {
        return distance ? `${parseFloat(distance).toFixed(1)} km` : '0 km';
      },
      
      formatDuration(seconds) {
        if (!seconds) return '0m';
        
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
.destination-list {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
}

.list-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-text {
  display: none;
  margin-left: 0.25rem;
}

.destinations {
  list-style: none;
  padding: 0;
  margin: 0;
}

.destination-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f1f2f3;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 1rem;
}

.destination-item:last-child {
  border-bottom: none;
}

.destination-item:hover {
  background-color: #f8f9fa;
}

.destination-item.selected {
  background-color: #e3f2fd;
}

.destination-order {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #3498db;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.destination-content {
  flex: 1;
  min-width: 0;
}

.destination-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 500;
  word-break: break-word;
}

.address {
  margin: 0;
  font-size: 0.875rem;
  color: #7f8c8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.distance-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #7f8c8d;
}

.distance, .duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.destination-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f1f2f3;
  color: #333;
}

.btn-icon.delete:hover {
  color: #e74c3c;
  background-color: #fef5f5;
}

.reorder-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
}

/* Tablet and up */
@media (min-width: 640px) {
  .btn-text {
    display: inline;
  }
  
  .list-header {
    padding: 1rem 1.5rem;
  }
  
  .destination-item {
    padding: 1rem 1.5rem;
  }
  
  .destination-order {
    width: 36px;
    height: 36px;
    font-size: 0.9375rem;
  }
  
  .destination-content h4 {
    font-size: 1.0625rem;
  }
  
  .distance-info {
    gap: 1.5rem;
    flex-wrap: nowrap; /* Prevent wrapping on tablet */
  }
}

/* Tablet specific adjustments for better content flow */
@media (min-width: 768px) {
  .destination-list {
    min-width: 100%;
  }
  
  .destination-content {
    padding-right: 1rem; /* Prevent content from touching actions */
  }
  
  .destination-actions {
    margin-left: auto; /* Ensure actions stay to the right */
  }
}

/* List animations */
.destinations-list-move {
  transition: transform 0.5s;
}

.destinations-list-enter-active,
.destinations-list-leave-active {
  transition: all 0.5s;
}

.destinations-list-enter-from,
.destinations-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/Destinations/DestinationList.vue -->
