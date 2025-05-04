<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <h1>Road Trip Planner</h1>
        </router-link>
        <nav class="main-nav">
          <button 
            class="menu-toggle" 
            @click="isMenuOpen = !isMenuOpen"
            aria-label="Toggle menu"
          >
            <span class="menu-icon" :class="{ 'open': isMenuOpen }"></span>
          </button>
          <ul class="nav-links" :class="{ 'open': isMenuOpen }">
            <li><router-link to="/" @click="isMenuOpen = false">Home</router-link></li>
            <li><router-link to="/trip/new" @click="isMenuOpen = false">New Trip</router-link></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="app-content">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>&copy; 2025 Road Trip Planner</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isMenuOpen: false
    };
  }
};
</script>

<style>
/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Mobile-first design */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: -webkit-fill-available; /* Better mobile viewport handling */
}

.app-header {
  background-color: #3498db;
  color: white;
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1100; /* Increased from 1000 to be above map controls */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  text-decoration: none;
  color: white;
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.main-nav {
  position: relative;
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  width: 44px; /* Larger touch target */
  height: 44px;
  padding: 10px;
  margin: -10px; /* Compensate for padding */
}

.menu-icon {
  position: relative;
  display: block;
  width: 24px;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  left: 0;
  width: 24px;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

.menu-icon.open {
  background-color: transparent;
}

.menu-icon.open::before {
  top: 0;
  transform: rotate(45deg);
}

.menu-icon.open::after {
  bottom: 0;
  transform: rotate(-45deg);
}

.nav-links {
  position: absolute;
  top: calc(100% + 8px);
  right: -16px; /* Align with screen edge */
  background-color: #3498db;
  width: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  list-style: none;
  padding: 0.5rem 0;
  z-index: 1001;
}

.nav-links.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-links li {
  display: block;
}

.nav-links a {
  display: block;
  padding: 0.75rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-size: 1rem;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-content {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
}

/* Form elements - mobile-first */
button, 
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px; /* Touch-friendly */
  padding: 0.75rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.2s ease;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  gap: 0.5rem;
}

button:hover, 
.btn:hover {
  background-color: #2980b9;
}

button:disabled,
.btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid #3498db;
  color: #3498db;
}

.btn-outline:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.btn-danger {
  background-color: #e74c3c;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-success {
  background-color: #2ecc71;
}

.btn-success:hover {
  background-color: #27ae60;
}

.btn-sm {
  min-height: 36px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

input, 
textarea, 
select {
  width: 100%;
  min-height: 44px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  background-color: white;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
}

/* Card component */
.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Section separation */
.section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
}

/* Responsive grid */
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .app-header {
    padding: 1rem 1.5rem;
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
  
  .menu-toggle {
    display: none;
  }
  
  .nav-links {
    position: static;
    display: flex;
    width: auto;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    background-color: transparent;
    padding: 0;
  }
  
  .nav-links li {
    display: inline-block;
  }
  
  .nav-links a {
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }
  
  .app-content {
    padding: 1.5rem;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .app-header {
    padding: 1rem 2rem;
  }
  
  .logo h1 {
    font-size: 1.75rem;
  }
  
  .app-content {
    padding: 2rem;
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Utilities */
.text-center {
  text-align: center;
}

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.gap-1 { gap: 0.5rem; }
.gap-2 { gap: 1rem; }
.gap-3 { gap: 1.5rem; }

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>



<!--This file is part of the Vue Front End framework. -->

<!-- src/App.vue -->