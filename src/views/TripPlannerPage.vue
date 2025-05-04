<template>
  <div class="trip-planner-page">
    <div class="page-header">
      <h2 class="page-title">{{ isEditMode ? 'Edit Trip' : 'Plan New Trip' }}</h2>
      <div class="page-actions">
        <router-link to="/" class="btn btn-outline"> <i class="fas fa-arrow-left"></i> Back </router-link>
      </div>
    </div>

    <div class="trip-form">
      <form @submit.prevent="saveTrip">
        <div class="form-group">
          <label for="trip-name">Trip Name <span class="required">*</span></label>
          <input type="text" id="trip-name" v-model="form.name" placeholder="Enter trip name" required autofocus />
        </div>

        <div class="form-group">
          <label for="trip-description">Description</label>
          <textarea id="trip-description" v-model="form.description" placeholder="Enter trip description" rows="3"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="start-date">Start Date</label>
            <input type="date" id="start-date" v-model="form.start_date" />
          </div>

          <div class="form-group">
            <label for="end-date">End Date</label>
            <input type="date" id="end-date" v-model="form.end_date" :min="form.start_date" />
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="button" @click="cancel" class="btn btn-outline">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ isEditMode ? 'Update Trip' : 'Create Trip' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'TripPlannerPage',

  props: {
    id: {
      type: [String, Number],
      default: null,
    },
  },

  data() {
    return {
      form: {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
      },
      saving: false,
      errorMessage: '',
    };
  },

  computed: {
    ...mapGetters('trips', ['tripById']),

    isEditMode() {
      return !!this.id;
    },
  },

  created() {
    this.initForm();
  },

  methods: {
    ...mapActions('trips', ['createTrip', 'updateTrip', 'fetchTrips']),

    async initForm() {
      try {
        if (this.isEditMode) {
          // Edit mode - load trip data
          // First check if trip exists in store
          let trip = this.tripById(this.id);

          // If not found, fetch all trips
          if (!trip) {
            await this.fetchTrips();
            trip = this.tripById(this.id);
          }

          if (trip) {
            this.form = {
              name: trip.name,
              description: trip.description || '',
              start_date: this.formatDateForInput(trip.start_date) || '',
              end_date: this.formatDateForInput(trip.end_date) || '',
            };
          } else {
            this.$router.push('/trip/new');
          }
        }
      } catch (error) {
        this.errorMessage = 'Failed to load trip data.';
        console.error('Error loading trip:', error);
      }
    },

    formatDateForInput(dateStr) {
      if (!dateStr) return '';

      // Parse the date string and format it as YYYY-MM-DD
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    },

    async saveTrip() {
      try {
        this.errorMessage = '';
        this.saving = true;

        // Validate form
        if (!this.form.name) {
          this.errorMessage = 'Trip name is required.';
          return;
        }

        // Validate dates if both are provided
        if (this.form.start_date && this.form.end_date) {
          const startDate = new Date(this.form.start_date);
          const endDate = new Date(this.form.end_date);

          if (endDate < startDate) {
            this.errorMessage = 'End date cannot be earlier than start date.';
            return;
          }
        }

        // Process dates
        const tripData = {
          ...this.form,
        };

        let trip;

        if (this.isEditMode) {
          // Update existing trip
          trip = await this.updateTrip({
            id: this.id,
            tripData,
          });
        } else {
          // Create new trip
          trip = await this.createTrip(tripData);
        }

        // Navigate to trip details page
        this.$router.push(`/trip/${trip.id}`);
      } catch (error) {
        this.errorMessage = error.userMessage || 'Failed to save trip.';
        console.error('Error saving trip:', error);
      } finally {
        this.saving = false;
      }
    },

    cancel() {
      if (this.isEditMode) {
        // Return to trip details
        this.$router.push(`/trip/${this.id}`);
      } else {
        // Return to home page
        this.$router.push('/');
      }
    },
  },
};
</script>

<style scoped>
.trip-planner-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.trip-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.required {
  color: #e74c3c;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

textarea {
  resize: vertical;
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

.btn-outline {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #333;
}

.btn-outline:hover {
  background-color: #f5f5f5;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .trip-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
}
</style>

<!--This file is part of the Vue Front End framework. -->

<!-- src/views/TripPlannerPage.vue -->
