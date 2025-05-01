<template>
    <div class="poi-list">
      <div class="list-header">
        <h3 class="section-title">Points of Interest</h3>
        <div class="list-filter">
          <label for="filter-type">Filter:</label>
          <select id="filter-type" v-model="filterType">
            <option value="all">All Types</option>
            <option v-for="(pois, type) in groupedPois" :key="type" :value="type">
              {{ formatType(type) }} ({{ pois.length }})
            </option>
          </select>
        </div>
      </div>
      
      <ul class="pois-list">
        <li 
          v-for="poi in filteredPois" 
          :key="poi.id"
          class="poi-item"
          :class="{ 'selected': selectedPoiId === poi.id }"
          @click="selectPoi(poi)"
        >
          <div class="poi-icon">
            <i :class="getIconClass(poi.type)"></i>
          </div>
          <div class="poi-content">
            <h4>{{ poi.name }}</h4>
            <p v-if="poi.description" class="description">{{ truncateText(poi.description, 80) }}</p>
            <div class="poi-type">{{ formatType(getMainType(poi.type)) }}</div>
          </div>
        </li>
      </ul>
      
      <div v-if="filteredPois.length === 0" class="empty-state">
        <p v-if="filterType !== 'all'">No points of interest found for this type. Try a different filter.</p>
        <p v-else>No points of interest found for this trip.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PointOfInterestList',
    
    props: {
      pointsOfInterest: {
        type: Array,
        required: true
      },
      selectedPoiId: {
        type: [Number, String],
        default: null
      }
    },
    
    data() {
      return {
        filterType: 'all'
      };
    },
    
    computed: {
      groupedPois() {
        const grouped = {};
        
        this.pointsOfInterest.forEach(poi => {
          const mainType = this.getMainType(poi.type);
          
          if (!grouped[mainType]) {
            grouped[mainType] = [];
          }
          
          grouped[mainType].push(poi);
        });
        
        return grouped;
      },
      
      filteredPois() {
        if (this.filterType === 'all') {
          return this.pointsOfInterest;
        }
        
        return this.pointsOfInterest.filter(poi => {
          return this.getMainType(poi.type) === this.filterType;
        });
      }
    },
    
    methods: {
      selectPoi(poi) {
        this.$emit('select-poi', poi);
      },
      
      getMainType(typeString) {
        // Get the first type from comma-separated list
        return (typeString || '').split(',')[0].trim();
      },
      
      formatType(type) {
        if (!type) return 'Unknown';
        
        // Format the type string for display
        const formattedType = type
          .replace(/\./g, ' ')
          .replace(/(^|\s)\S/g, t => t.toUpperCase());
        
        return formattedType;
      },
      
      getIconClass(typeString) {
        const mainType = this.getMainType(typeString);
        
        // Map types to Font Awesome icons
        const iconMap = {
          'tourism.attraction': 'fas fa-landmark',
          'tourism.sights': 'fas fa-monument',
          'tourism.museum': 'fas fa-museum',
          'natural': 'fas fa-mountain',
          'natural.water': 'fas fa-water',
          'leisure.park': 'fas fa-tree',
          'catering.restaurant': 'fas fa-utensils',
          'catering.cafe': 'fas fa-coffee',
          'entertainment': 'fas fa-theater-masks',
          'accommodation.hotel': 'fas fa-bed',
          'accommodation.motel': 'fas fa-bed'
        };
        
        return iconMap[mainType] || 'fas fa-map-marker-alt';
      },
      
      truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + '...';
      }
    }
  };
  </script>
  
  <style scoped>
  .poi-list {
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
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .section-title {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .list-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .list-filter label {
    font-size: 0.9rem;
    color: #7f8c8d;
  }
  
  .list-filter select {
    padding: 0.35rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .pois-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .poi-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .poi-item:last-child {
    border-bottom: none;
  }
  
  .poi-item:hover {
    background-color: #f9f9f9;
  }
  
  .poi-item.selected {
    background-color: #e3f2fd;
  }
  
  .poi-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #f0f5f9;
    color: #3498db;
    border-radius: 50%;
    margin-right: 1rem;
    font-size: 1rem;
  }
  
  .poi-content {
    flex: 1;
  }
  
  .poi-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
  }
  
  .description {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #7f8c8d;
  }
  
  .poi-type {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    background-color: #f0f5f9;
    color: #3498db;
    border-radius: 12px;
    margin-top: 0.25rem;
  }
  
  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #7f8c8d;
  }
  </style>



<!-- This file is part of the Vue Front End framework. -->


<!-- src/components/RouteDetails/PointOfInterestList.vue -->
