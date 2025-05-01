import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
// Fix Leaflet icon issue
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create Vue app
const app = createApp(App);

// Register global components or properties if needed
app.config.globalProperties.$filters = {
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let formatted = '';
    if (hours > 0) {
      formatted += hours + 'h ';
    }
    formatted += minutes + 'm';
    
    return formatted;
  },
  
  formatDistance(km) {
    return parseFloat(km).toFixed(1) + ' km';
  },
  
  formatFuel(liters) {
    return parseFloat(liters).toFixed(1) + ' L';
  }
};

// Use router and store
app.use(router);
app.use(store);

// Mount the app
app.mount('#app');


//This file is part of the Vue Front End framework.

// src/main.js