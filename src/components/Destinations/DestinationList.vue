<template>
    <div class="destination-list">
      <div class="list-header">
        <h3 class="section-title">{{ title || 'Destinations' }}</h3>
        <div class="list-actions" v-if="!readonly">
          <button @click="addDestination" class="btn btn-sm">
            <i class="fas fa-plus"></i> Add
          </button>
          <button 
            v-if="destinations.length > 1" 
            @click="enableReordering" 
            class="btn btn-sm"
            :class="{ 'active': reorderingActive }"
          >
            <i class="fas fa-sort"></i> Reorder
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
        <p>No destinations added yet.</p>
        <button v-if="!readonly" @click="addDestination" class="btn">
          <i class="fas fa-plus"></i> Add Destination
        </button>
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
          this.reorderingActive = true;
          this.reorderingDestinations = [...this.sortedDestinations];
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
        
        this.$emit('reorder-destinations', updatedDestinations);
        this.reorderingActive = false;
      },
      
      moveUp(destination) {
        const index = this.reorderingDestinations.findIndex(d => d.id === destination.id);
        if (index > 0) {
          // Swap with the previous destination
          const temp = { ...this.reorderingDestinations[index - 1] };
          this.reorderingDestinations[index - 1] = { ...this.reorderingDestinations[index] };
          this.reorderingDestinations[index] = temp;
        }
      },
      
      moveDown(destination) {
        const index = this.reorderingDestinations.findIndex(d => d.id === destination.id);
        if (index < this.reorderingDestinations.length - 1) {
          // Swap with the next destination
          const temp = { ...this.reorderingDestinations[index + 1] };
          this.reorderingDestinations[index + 1] = { ...this.reorderingDestinations[index] };
          this.reorderingDestinations[index] = temp;
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
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .list-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .section-title {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .list-actions {
    display: flex;
    gap: 8px;
  }
  
  .btn-sm {
    padding: 0.4rem 0.7rem;
    font-size: 0.9rem;
  }
  
  .btn.active {
    background-color: #e3f2fd;
    color: #3498db;
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
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .destination-item:last-child {
    border-bottom: none;
  }
  
  .destination-item:hover {
    background-color: #f9f9f9;
  }
  
  .destination-item.selected {
    background-color: #e3f2fd;
  }
  
  .destination-order {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: #3498db;
    color: white;
    border-radius: 50%;
    font-weight: bold;
    margin-right: 1rem;
  }
  
  .destination-content {
    flex: 1;
  }
  
  .destination-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
  }
  
  .address {
    margin: 0;
    font-size: 0.9rem;
    color: #7f8c8d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  
  .distance-info {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #7f8c8d;
  }
  
  .destination-actions {
    display: flex;
    gap: 5px;
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #7f8c8d;
  }
  
  .btn-icon:hover {
    background-color: #f1f1f1;
    color: #333;
  }
  
  .btn-icon.delete:hover {
    color: #e74c3c;
  }
  
  .reorder-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem;
    border-top: 1px solid #eee;
  }
  
  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #7f8c8d;
  }
  
  .empty-state p {
    margin-bottom: 1rem;
  }
  
  .destinations.reordering .destination-item {
    cursor: default;
  }
  
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .modal-body {
    padding: 1.5rem 1rem;
  }
  
  .warning {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .modal-actions {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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
  
  /* Responsive adjustments */
  @media (max-width: 480px) {
    .distance-info {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
  </style>