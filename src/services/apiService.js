import axios from 'axios';

// Create axios instance with base URL and default config
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

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
      } else if (status === 422) {
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