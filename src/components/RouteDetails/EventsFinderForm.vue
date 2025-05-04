<template>
  <div class="events-finder">
    <div class="finder-header">
      <h3>Find Events</h3>
      <button @click="$emit('close')" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="finder-content">
      <div v-if="!searching && !hasSearched">
        <form @submit.prevent="searchEvents">
          <div class="form-group">
            <label class="form-label">Trip Dates</label>
            <div class="date-range">
              <div class="date-input">
                <label for="start-date">From</label>
                <input type="date" id="start-date" v-model="form.startDate" required />
              </div>
              <div class="date-input">
                <label for="end-date">To</label>
                <input type="date" id="end-date" v-model="form.endDate" :min="form.startDate" required />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Event Types</label>
            <div class="event-types">
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.eventTypes" value="music" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  <i class="fas fa-music"></i> Music
                </span>
              </label>
              
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.eventTypes" value="festival" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  <i class="fas fa-glass-cheers"></i> Festivals
                </span>
              </label>
              
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.eventTypes" value="sports" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  <i class="fas fa-football-ball"></i> Sports
                </span>
              </label>
              
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.eventTypes" value="arts" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  <i class="fas fa-palette"></i> Arts
                </span>
              </label>
              
              <label class="checkbox-item">
                <input type="checkbox" v-model="form.eventTypes" value="food" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  <i class="fas fa-utensils"></i> Food
                </span>
              </label>
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Find Events</button>
          </div>
        </form>
      </div>

      <div v-else-if="searching" class="searching-state">
        <div class="spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Searching for events during your trip...</p>
      </div>

      <div v-else>
        <h4 class="results-title">Events During Your Trip</h4>

        <div class="events-timeline">
          <div v-for="(event, index) in events" :key="index" class="event-card">
            <div class="event-date">
              <div class="date-badge">
                <span class="month">{{ formatMonth(event.date) }}</span>
                <span class="day">{{ formatDay(event.date) }}</span>
              </div>
            </div>
            <div class="event-details">
              <h5>{{ event.name }}</h5>
              <p v-if="event.venue" class="event-venue">
                <i class="fas fa-map-marker-alt"></i> {{ event.venue }}
              </p>
              <p v-if="event.description" class="event-description">
                {{ truncateText(event.description, 100) }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="events.length === 0" class="empty-results">
          <p>No events found during your trip dates.</p>
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
  name: 'EventsFinderForm',

  props: {
    tripId: {
      type: [Number, String],
      required: true,
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      form: {
        startDate: this.startDate || this.getDefaultStartDate(),
        endDate: this.endDate || this.getDefaultEndDate(),
        eventTypes: ['music', 'festival', 'sports'],
      },
      searching: false,
      errorMessage: '',
      hasSearched: false,
    };
  },

  computed: {
    ...mapGetters('pois', ['allEvents']),

    events() {
      return this.allEvents;
    },
  },

  methods: {
    ...mapActions('pois', ['findEvents']),

    getDefaultStartDate() {
      const date = new Date();
      return date.toISOString().split('T')[0];
    },

    getDefaultEndDate() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Default to a week later
      return date.toISOString().split('T')[0];
    },

    formatMonth(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { month: 'short' });
    },

    formatDay(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.getDate();
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;

      return text.substring(0, maxLength) + '...';
    },

    validateDates() {
      if (!this.form.startDate || !this.form.endDate) {
        this.errorMessage = 'Please select both start and end dates.';
        return false;
      }

      const start = new Date(this.form.startDate);
      const end = new Date(this.form.endDate);

      if (end < start) {
        this.errorMessage = 'End date cannot be earlier than start date.';
        return false;
      }

      return true;
    },

    async searchEvents() {
      if (!this.validateDates()) {
        return;
      }

      if (this.form.eventTypes.length === 0) {
        this.errorMessage = 'Please select at least one event type.';
        return;
      }

      try {
        this.errorMessage = '';
        this.searching = true;

        await this.findEvents({
          tripId: this.tripId,
          options: {
            start_date: this.form.startDate,
            end_date: this.form.endDate,
            event_types: this.form.eventTypes.join(','),
          },
        });

        this.hasSearched = true;
      } catch (error) {
        this.errorMessage = error.message || 'Failed to find events.';
      } finally {
        this.searching = false;
      }
    },

    resetSearch() {
      this.hasSearched = false;
      this.form.startDate = this.startDate || this.getDefaultStartDate();
      this.form.endDate = this.endDate || this.getDefaultEndDate();
      this.form.eventTypes = ['music', 'festival', 'sports'];
    },
  },
};
</script>

<style scoped>
.events-finder {
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

/* Date range styling */
.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.date-input {
  display: flex;
  flex-direction: column;
}

.date-input label {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.date-input input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
}

.date-input input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* Event types grid */
.event-types {
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

/* Error message */
.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

/* Form actions */
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

.btn-primary:hover {
  background-color: #2980b9;
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

/* Searching state */
.searching-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 1rem;
}

/* Results */
.results-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.2s;
}

.event-card:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-date {
  flex-shrink: 0;
}

.date-badge {
  background-color: #3498db;
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  min-width: 60px;
}

.month {
  display: block;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.day {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
}

.event-details h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #2c3e50;
}

.event-venue {
  font-size: 0.9375rem;
  color: #7f8c8d;
  margin: 0 0 0.5rem 0;
}

.event-venue i {
  color: #3498db;
  margin-right: 0.5rem;
}

.event-description {
  font-size: 0.9375rem;
  color: #555;
  margin: 0;
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
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .event-types {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .date-range {
    grid-template-columns: 1fr;
  }
  
  .event-types {
    grid-template-columns: 1fr;
  }
  
  .finder-content {
    padding: 1rem;
  }
}
</style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/RouteDetails/EventsFinderForm.vue -->
