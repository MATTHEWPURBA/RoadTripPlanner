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
            <span class="menu-icon"></span>
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
}

/* Mobile-first design */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #3498db;
  color: white;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  font-size: 1.5rem;
  font-weight: 700;
}

.main-nav {
  position: relative;
}

.menu-toggle {
  display: block;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  position: relative;
}

.menu-icon,
.menu-icon::before,
.menu-icon::after {
  display: block;
  position: absolute;
  height: 3px;
  width: 24px;
  background-color: white;
  transition: transform 0.3s;
}

.menu-icon {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  left: 0;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

.nav-links {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #3498db;
  width: 200px;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
  list-style: none;
}

.nav-links.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-links li {
  display: block;
  width: 100%;
}

.nav-links a {
  display: block;
  padding: 1rem;
  color: white;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
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
  margin-top: auto;
}

/* Form elements - mobile-first */
button, 
.btn {
  display: inline-block;
  padding: 0.75rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  text-align: center;
  text-decoration: none;
}

button:hover, 
.btn:hover {
  background-color: #2980b9;
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

input, 
textarea, 
select {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

/* Card component */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Section separation */
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

/* Responsive grid */
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet and desktop styles */
@media (min-width: 768px) {
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
  }
  
  .nav-links li {
    display: inline-block;
    width: auto;
  }
  
  .nav-links a {
    padding: 0.5rem 1rem;
    border-bottom: none;
  }
  
  .logo h1 {
    font-size: 1.75rem;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .app-content {
    padding: 2rem;
  }
}

@media (min-width: 992px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Animation for page transitions */
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