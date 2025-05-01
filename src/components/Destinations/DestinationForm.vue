<template>
  <div class="destination-form">
    <div class="form-header">
      <h3>{{ isEdit ? 'Edit Destination' : 'Add Destination' }}</h3>
      <button @click="closeForm" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Destination Name <span class="required">*</span></label>
        <input type="text" id="name" v-model="form.name" placeholder="Enter name" required />
      </div>

      <div class="form-group">
    <label for="address">Address</label>
    <div class="address-input-group">
      <input type="text" id="address" v-model="form.address" placeholder="Enter address" />
      <button type="button" @click="geocodeAddress" class="btn" :disabled="geocoding || !form.address">
        <i class="fas" :class="geocoding ? 'fa-spinner fa-spin' : 'fa-search'"></i>
      </button>
    </div>
    <!-- Debug info section -->
    <div v-if="debugInfo" class="debug-info">
      <p>Debug Info: {{ debugInfo }}</p>
    </div>
  </div>

      <div class="form-row">
        <div class="form-group">
          <label for="latitude">Latitude <span class="required">*</span></label>
          <input type="number" id="latitude" v-model="form.latitude" step="any" min="-90" max="90" required />
        </div>

        <div class="form-group">
          <label for="longitude">Longitude <span class="required">*</span></label>
          <input type="number" id="longitude" v-model="form.longitude" step="any" min="-180" max="180" required />
        </div>
      </div>

      <div class="form-group">
        <label for="order">Order</label>
        <select id="order" v-model="form.order">
          <option v-for="n in maxOrder + 1" :key="n" :value="n - 1">
            {{ n === 1 ? 'First stop' : n === maxOrder + 1 ? 'Last stop' : `Stop #${n}` }}
          </option>
        </select>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-actions">
        <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
          {{ isEdit ? 'Update Destination' : 'Add Destination' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
// import axios from 'axios';
import apiClient from '@/services/apiService'; // Import your configured API client



export default {
  name: 'DestinationForm',

  props: {
    tripId: {
      type: [Number, String],
      required: true,
    },
    destination: {
      type: Object,
      default: null,
    },
    maxOrder: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      form: {
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        order: 0,
      },
      submitting: false,
      geocoding: false,
      errorMessage: '',
      debugInfo: null, // Add this for debugging
    };
  },

  computed: {
    isEdit() {
      return !!this.destination;
    },
  },

  created() {
    this.initForm();
  },

  methods: {
    ...mapActions('destinations', ['geocodeAddress']),

    async geocodeAddress() {
      if (!this.form.address) return;

      try {
        this.errorMessage = '';
        this.geocoding = true;
        this.debugInfo = "Starting geocoding request...";
        // Direct API call as a fallback to see if the issue is with Vuex
        try {
         // Use apiClient instead of axios directly, or use the full URL
         const response = await apiClient.post('/destinations/geocode', { address: this.form.address });
          // OR use the full URL:
          // const response = await axios.post(process.env.VUE_APP_API_URL + '/destinations/geocode', { address: this.form.address });
          
          this.debugInfo = "Direct API call succeeded!";
          
          // Use the response data
          const result = response.data;
          
          // Format coordinates to 6 decimal places (about 11cm precision, which is sufficient)
          this.form.latitude = parseFloat(parseFloat(result.latitude).toFixed(6));
          this.form.longitude = parseFloat(parseFloat(result.longitude).toFixed(6));
          this.form.address = result.formatted_address || this.form.address;
          
          // If name is empty, use the location name from geocoding
          if (!this.form.name && result.name) {
            this.form.name = result.name;
          }
          
          return; // Exit early if direct call succeeds
        } catch (directError) {
          this.debugInfo = `Direct API call failed: ${directError.message}. Trying Vuex action...`;
          // Continue to the Vuex approach if direct call fails
        }

        // Call geocoding service through Vuex
        const result = await this.geocodeAddress(this.form.address);
        this.debugInfo = "Vuex geocoding succeeded!";

        // Update form with returned coordinates
        this.form.latitude = result.latitude;
        this.form.longitude = result.longitude;
        this.form.address = result.formatted_address || this.form.address;

        // If name is empty, use the location name from geocoding
        if (!this.form.name && result.name) {
          this.form.name = result.name;
        }
      } catch (error) {
        this.debugInfo = `Error: ${error.message}`;
        this.errorMessage = 'Could not find location. Please check the address and network connectivity.';
        console.error('Geocoding error:', error);
      } finally {
        this.geocoding = false;
      }
    },

    initForm() {
      if (this.destination) {
        // Edit mode - populate form with destination data
        this.form = {
          name: this.destination.name,
          address: this.destination.address || '',
          latitude: this.destination.latitude,
          longitude: this.destination.longitude,
          order: this.destination.order,
        };
      } else {
        // Add mode - set default values
        this.form.order = this.maxOrder; // Default to last position
      }
    },

    async submitForm() {
      try {
        this.errorMessage = '';
        this.submitting = true;

        // Validate form
        if (!this.form.name || !this.form.latitude || !this.form.longitude) {
          this.errorMessage = 'Please fill in all required fields.';
          return;
        }

        // Validate coordinates
        const lat = parseFloat(this.form.latitude);
        const lng = parseFloat(this.form.longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
          this.errorMessage = 'Latitude must be between -90 and 90.';
          return;
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
          this.errorMessage = 'Longitude must be between -180 and 180.';
          return;
        }

        // Prepare data for submission
        const destinationData = {
          ...this.form,
          trip_id: this.tripId,
          latitude: lat,
          longitude: lng,
        };

        // Emit event based on add or edit mode
        if (this.isEdit) {
          this.$emit('update-destination', {
            id: this.destination.id,
            data: destinationData,
          });
        } else {
          this.$emit('add-destination', destinationData);
        }

        // Close form
        this.closeForm();
      } catch (error) {
        this.errorMessage = error.message || 'An error occurred.';
      } finally {
        this.submitting = false;
      }
    },

    

    closeForm() {
      this.$emit('close');
    },



  },
};
</script>

<style scoped>

.debug-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f0f8ff;
  border: 1px solid #d0e3ff;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}
.destination-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 100%;
}

.form-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-header h3 {
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

form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
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
}

.required {
  color: #e74c3c;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.address-input-group {
  display: flex;
  gap: 0.5rem;
}

.address-input-group input {
  flex: 1;
}

.address-input-group button {
  padding: 0.75rem;
  border-radius: 4px;
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>

<!-- This file is part of the Vue Front End framework. -->
<!-- src/components/Destinations/DestinationForm.vue -->
