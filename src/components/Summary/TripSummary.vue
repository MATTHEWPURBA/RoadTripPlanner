<template>
  <div class="trip-summary">
    <div class="summary-header">
      <h3 class="summary-title">Trip Summary</h3>
      <div v-if="!readonly" class="summary-actions">
        <button @click="recalculateRoutes" class="btn btn-sm" :disabled="calculating">
          <i :class="calculating ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
          <span class="btn-text">Recalculate</span>
        </button>
      </div>
    </div>
    
    <div class="summary-content">
      <div class="summary-stats">
        <!-- First row: Distance and Duration -->
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-road"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formattedDistance }}</div>
              <div class="stat-label">Total Distance</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formattedDuration }}</div>
              <div class="stat-label">Total Duration</div>
            </div>
          </div>
        </div>
        
        <!-- Second row: Fuel and Stops -->
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-gas-pump"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formattedFuel }}</div>
              <div class="stat-label">Fuel</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ trip.destinations ? trip.destinations.length : 0 }}</div>
              <div class="stat-label">{{ trip.destinations && trip.destinations.length === 1 ? 'Stop' : 'Stops' }}</div>
            </div>
          </div>
        </div>
      </div>







      
      <div class="trip-details">
        <div class="detail-row">
          <div class="detail-label">Trip Name</div>
          <div class="detail-value">{{ trip.name }}</div>
        </div>
        
        <div v-if="trip.description" class="detail-row">
          <div class="detail-label">Description</div>
          <div class="detail-value">{{ trip.description }}</div>
        </div>
        
        <div v-if="trip.start_date" class="detail-row">
          <div class="detail-label">Dates</div>
          <div class="detail-value">
            {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
            <span v-if="trip.start_date && trip.end_date" class="date-duration">
              ({{ getDaysBetween(trip.start_date, trip.end_date) }} days)
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="!readonly" class="trip-actions">
        <button @click="$emit('edit-trip')" class="btn btn-block">
          <i class="fas fa-edit"></i>
          Edit Trip Details
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'TripSummary',
    
    props: {
      trip: {
        type: Object,
        required: true
      },
      readonly: {
        type: Boolean,
        default: false
      }
    },
    
    data() {
      return {
        calculating: false
      };
    },
    
    computed: {
      formattedDistance() {
        if (!this.trip.total_distance) return '0 km';
        return `${parseFloat(this.trip.total_distance).toFixed(1)} km`;
      },
      
      formattedDuration() {
        if (!this.trip.total_duration) return '0m';
        
        const totalSeconds = this.trip.total_duration;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        let formatted = '';
        if (days > 0) {
          formatted += days + 'd ';
        }
        if (hours > 0 || days > 0) {
          formatted += hours + 'h ';
        }
        formatted += minutes + 'm';
        
        return formatted;
      },
      
      formattedFuel() {
        if (!this.trip.fuel_consumption) return '0 L';
        return `${parseFloat(this.trip.fuel_consumption).toFixed(1)} L`;
      }
    },
    
    methods: {
      ...mapActions('trips', ['calculateRoutes']),
      
      async recalculateRoutes() {
        if (this.calculating) return;
        
        try {
          this.calculating = true;
          await this.calculateRoutes(this.trip.id);
          this.$emit('routes-updated');
        } catch (error) {
          console.error('Error recalculating routes:', error);
        } finally {
          this.calculating = false;
        }
      },
      
      formatDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      },
      
      getDaysBetween(startDateStr, endDateStr) {
        if (!startDateStr || !endDateStr) return 0;
        
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // Set to noon to avoid DST issues
        startDate.setHours(12, 0, 0, 0);
        endDate.setHours(12, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = endDate - startDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        
        return diffDays;
      }
    }
  };
  </script>
  












  <style scoped>
.trip-summary {
  background-color: white;
  border-radius: 12px;
  overflow: visible;
  min-height: min-content;
  height: auto;
}

.summary-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.summary-title {
  margin: 0;
  font-size: 1.125rem;
  color: #2c3e50;
  font-weight: 600;
}

.btn-text {
  display: none;
  margin-left: 0.5rem;
}

.summary-content {
  padding: 1rem;
  min-height: min-content;
  height: auto;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  min-height: min-content;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 0.875rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  gap: 0.75rem;
  min-height: min-content;
  height: auto;
  overflow: visible; /* Ensure content isn't clipped */
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3498db;
  color: white;
  border-radius: 8px;
  flex-shrink: 0;
  font-size: 1rem;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.75rem;
  color: #7f8c8d;
  white-space: nowrap;
}

.trip-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f2f3;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #555;
  font-size: 0.9375rem;
  word-break: break-word;
}

.date-duration {
  font-size: 0.875rem;
  color: #95a5a6;
  margin-left: 0.5rem;
  white-space: nowrap;
}

.trip-actions {
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* Responsive adjustments */
@media (min-width: 640px) {
  .btn-text {
    display: inline;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.125rem;
  }
  
  .stat-value {
    font-size: 1.125rem;
  }
  
  .stat-label {
    font-size: 0.8125rem;
  }
}

@media (min-width: 1024px) {
  .summary-header {
    padding: 1.25rem 1.5rem;
  }
  
  .summary-content {
    padding: 1.5rem;
  }
  
  .summary-title {
    font-size: 1.25rem;
  }
  
  .detail-row {
    display: flex;
    padding: 0.75rem 0;
  }
  
  .detail-label {
    width: 120px;
    margin-bottom: 0;
  }
  
  .detail-value {
    flex: 1;
  }
}
</style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/Summary/TripSummary.vue -->
