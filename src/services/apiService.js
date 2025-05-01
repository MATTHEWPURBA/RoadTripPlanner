import axios from 'axios';

// Create axios instance with base URL and default config
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Identify as an XHR request
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true // Include credentials (cookies) with requests
});




// First, get the CSRF cookie from Laravel
const setupCSRF = async () => {
  try {
    // Change this to your Laravel backend URL
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
      withCredentials: true // Important for cross-domain cookies
    });
  } catch (error) {
    console.error('Error setting up CSRF protection:', error);
  }
};

// Call this when your app initializes
setupCSRF();





// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log errors for debugging
    console.error('API Error:', error);
    
    // Format error message for display
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      
      if (status === 404) {
        errorMessage = 'The requested resource was not found.';
      }
      
      else if (status === 419) {
        errorMessage = 'Your session has expired. Please refresh the page and try again.';
        // Automatically try to refresh CSRF token
        setupCSRF();
      }
      
      else if (status === 422) {
        // Validation errors from Laravel
        const errors = error.response.data.errors;
        if (errors) {
          errorMessage = Object.values(errors)
            .flat()
            .join('\n');
        }
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }


      // Add more detailed error information for developers
      if (process.env.NODE_ENV !== 'production') {
        console.log('Detailed error info:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }


    } else if (error.request) {
      // No response received
      errorMessage = 'No response from server. Please check your connection.';
    }
    
    // Modify the error object to include a friendly message
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default apiClient;



//  This file is part of the Vue Front End framework.

// src/services/apiService.js