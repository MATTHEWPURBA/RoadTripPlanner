<template>
  <div class="events-finder">
    <div class="finder-header">
      <h3>Find Events</h3>
      <button @click="$emit('close')" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="finder-content">
      <div v-if="!searching && !events.length">
        <form @submit.prevent="searchEvents">
          <div class="form-group">
            <label>Trip Dates</label>
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
            <label>Event Types</label>
            <div class="event-types">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.eventTypes" value="music" />
                <i class="fas fa-music"></i> Music
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.eventTypes" value="festival" />
                <i class="fas fa-glass-cheers"></i> Festivals
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.eventTypes" value="sports" />
                <i class="fas fa-football-ball"></i> Sports
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.eventTypes" value="arts" />
                <i class="fas fa-palette"></i> Arts
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.eventTypes" value="food" />
                <i class="fas fa-utensils"></i> Food
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
              <p v-if="event.venue" class="event-venue"><i class="fas fa-map-marker-alt"></i> {{ event.venue }}</p>
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
          <button @click="resetSearch" class="btn btn-outline"><i class="fas fa-search"></i> New Search</button>
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

.date-range {
  display: flex;
  gap: 1rem;
}

.date-input {
  flex: 1;
}

.date-input label {
  font-weight: normal;
  font-size: 0.9rem;
  color: #7f8c8d;
}

input[type='date'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.event-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.checkbox-label i {
  margin-right: 0.5rem;
  color: #3498db;
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

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.event-card {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.event-date {
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #3498db;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  text-align: center;
}

.date-badge .month {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
}

.date-badge .day {
  font-size: 1.5rem;
  font-weight: bold;
}

.event-details {
  padding: 0.75rem;
  flex: 1;
}

.event-details h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.event-venue {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.event-description {
  margin: 0;
  font-size: 0.85rem;
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
  .date-range {
    flex-direction: column;
    gap: 0.75rem;
  }

  .event-types {
    grid-template-columns: 1fr;
  }
}
</style>



<!-- This file is part of the Vue Front End framework. -->

<!-- src/components/RouteDetails/EventsFinderForm.vue -->
