/**
 * ShoreSquad - Beach Cleanup Community App
 * Interactive JavaScript for enhanced user experience
 */

// ==========================================================================
// Global Configuration and State
// ==========================================================================

const ShoreSquad = {
  // Configuration
  config: {
    weatherAPIKey: 'your_weather_api_key_here', // Replace with actual API key
    mapAPIKey: 'your_map_api_key_here', // Replace with actual API key
    animationDuration: 300,
    debounceDelay: 300
  },
  
  // Application state
  state: {
    currentLocation: null,
    weatherData: null,
    cleanupEvents: [],
    userPosition: null,
    isLoading: false
  },
  
  // DOM elements cache
  elements: {},
  
  // Initialize the application
  init() {
    this.cacheElements();
    this.bindEvents();
    this.initializeComponents();
    this.loadInitialData();
  },
  
  // Cache frequently used DOM elements
  cacheElements() {
    this.elements = {
      // Navigation
      navToggle: document.querySelector('.nav-toggle'),
      navMenu: document.querySelector('.nav-menu'),
      navLinks: document.querySelectorAll('.nav-link'),
      
      // Map section
      mapContainer: document.getElementById('cleanup-map'),
      eventList: document.getElementById('event-list'),
      searchBox: document.querySelector('.search-box input'),
      searchBtn: document.querySelector('.search-btn'),
      filterCheckboxes: document.querySelectorAll('.checkbox-label input[type="checkbox"]'),
      
      // Weather section
      currentLocation: document.getElementById('current-location'),
      currentTemp: document.getElementById('current-temp'),
      currentCondition: document.getElementById('current-condition'),
      weatherForecast: document.getElementById('weather-forecast'),
      
      // Community section
      statNumbers: document.querySelectorAll('.stat-number'),
      activityFeed: document.getElementById('activity-feed'),
      
      // Forms
      newsletterForm: document.querySelector('.newsletter-form'),
      
      // Loading spinner
      loadingSpinner: document.getElementById('loading-spinner')
    };
  },
  
  // Bind event listeners
  bindEvents() {
    // Navigation toggle
    if (this.elements.navToggle) {
      this.elements.navToggle.addEventListener('click', this.toggleMobileNav.bind(this));
    }
    
    // Smooth scrolling for navigation links
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick.bind(this));
    });
    
    // Map search functionality
    if (this.elements.searchBox) {
      this.elements.searchBox.addEventListener('input', 
        this.debounce(this.handleSearch.bind(this), this.config.debounceDelay)
      );
    }
    
    if (this.elements.searchBtn) {
      this.elements.searchBtn.addEventListener('click', this.handleSearchClick.bind(this));
    }
    
    // Filter checkboxes
    this.elements.filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.handleFilterChange.bind(this));
    });
    
    // Newsletter form
    if (this.elements.newsletterForm) {
      this.elements.newsletterForm.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
    }
    
    // Window events
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 100));
    
    // Accessibility: keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  },
  
  // Initialize components
  initializeComponents() {
    this.initializeIntersectionObserver();
    this.initializeCountUpAnimation();
    this.requestLocationPermission();
  },
  
  // Load initial data
  loadInitialData() {
    this.loadMockCleanupEvents();
    this.loadMockActivityFeed();
    // Note: In production, replace with actual API calls
    this.simulateWeatherLoad();
  }
};

// ==========================================================================
// Navigation Functions
// ==========================================================================

ShoreSquad.toggleMobileNav = function() {
  const isActive = this.elements.navMenu.classList.contains('active');
  
  if (isActive) {
    this.elements.navMenu.classList.remove('active');
    this.elements.navToggle.setAttribute('aria-expanded', 'false');
  } else {
    this.elements.navMenu.classList.add('active');
    this.elements.navToggle.setAttribute('aria-expanded', 'true');
  }
};

ShoreSquad.handleNavClick = function(event) {
  const href = event.target.getAttribute('href');
  
  // Only handle internal links
  if (href && href.startsWith('#')) {
    event.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Close mobile nav if open
      this.elements.navMenu.classList.remove('active');
      this.elements.navToggle.setAttribute('aria-expanded', 'false');
      
      // Smooth scroll to target
      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = targetElement.offsetTop - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
};

// ==========================================================================
// Search and Filter Functions
// ==========================================================================

ShoreSquad.handleSearch = function(event) {
  const searchTerm = event.target.value.toLowerCase();
  this.filterEvents(searchTerm);
};

ShoreSquad.handleSearchClick = function() {
  const searchTerm = this.elements.searchBox.value.toLowerCase();
  this.filterEvents(searchTerm);
};

ShoreSquad.handleFilterChange = function() {
  this.applyFilters();
};

ShoreSquad.filterEvents = function(searchTerm = '') {
  const filteredEvents = this.state.cleanupEvents.filter(event => {
    return event.title.toLowerCase().includes(searchTerm) ||
           event.location.toLowerCase().includes(searchTerm);
  });
  
  this.renderEvents(filteredEvents);
};

ShoreSquad.applyFilters = function() {
  const activeFilters = Array.from(this.elements.filterCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.parentElement.textContent.trim());
  
  let filteredEvents = this.state.cleanupEvents;
  
  if (activeFilters.includes('This Weekend')) {
    const weekend = this.getUpcomingWeekend();
    filteredEvents = filteredEvents.filter(event => 
      this.isDateInRange(event.date, weekend.start, weekend.end)
    );
  }
  
  if (activeFilters.includes('Family Friendly')) {
    filteredEvents = filteredEvents.filter(event => event.familyFriendly);
  }
  
  if (activeFilters.includes('Large Groups (20+)')) {
    filteredEvents = filteredEvents.filter(event => event.maxParticipants >= 20);
  }
  
  this.renderEvents(filteredEvents);
};

// ==========================================================================
// Event Rendering Functions
// ==========================================================================

ShoreSquad.renderEvents = function(events) {
  if (!this.elements.eventList) return;
  
  this.elements.eventList.innerHTML = '';
  
  if (events.length === 0) {
    this.elements.eventList.innerHTML = `
      <div class="no-events">
        <p>No cleanup events found. Try adjusting your filters!</p>
      </div>
    `;
    return;
  }
  
  events.forEach(event => {
    const eventElement = this.createEventCard(event);
    this.elements.eventList.appendChild(eventElement);
  });
};

ShoreSquad.createEventCard = function(event) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.innerHTML = `
    <div class="event-header">
      <h5>${event.title}</h5>
      <span class="event-date">${this.formatDate(event.date)}</span>
    </div>
    <div class="event-details">
      <p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${event.location}</p>
      <p><i class="fas fa-users" aria-hidden="true"></i> ${event.participants}/${event.maxParticipants} joined</p>
      <p><i class="fas fa-clock" aria-hidden="true"></i> ${event.duration}</p>
    </div>
    <button class="btn btn-primary btn-sm event-join-btn" 
            data-event-id="${event.id}"
            aria-label="Join ${event.title} cleanup event">
      Join Cleanup
    </button>
  `;
  
  // Add event listener for join button
  const joinBtn = card.querySelector('.event-join-btn');
  joinBtn.addEventListener('click', () => this.handleJoinEvent(event.id));
  
  return card;
};

ShoreSquad.handleJoinEvent = function(eventId) {
  // In production, this would make an API call
  this.showNotification('Successfully joined the cleanup event! 🌊', 'success');
  
  // Update the event in state
  const event = this.state.cleanupEvents.find(e => e.id === eventId);
  if (event && event.participants < event.maxParticipants) {
    event.participants++;
    this.renderEvents(this.state.cleanupEvents);
  }
};

// ==========================================================================
// Weather Functions
// ==========================================================================

ShoreSquad.requestLocationPermission = function() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      this.handleLocationSuccess.bind(this),
      this.handleLocationError.bind(this),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  } else {
    this.handleLocationError({ code: 0, message: 'Geolocation not supported' });
  }
};

ShoreSquad.handleLocationSuccess = function(position) {
  this.state.userPosition = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  
  this.reverseGeocode(position.coords.latitude, position.coords.longitude);
  // In production, load actual weather data here
  this.simulateWeatherLoad();
};

ShoreSquad.handleLocationError = function(error) {
  console.warn('Location access denied or failed:', error);
  
  // Fallback to default location (e.g., San Francisco)
  this.state.currentLocation = 'San Francisco, CA';
  this.elements.currentLocation.textContent = this.state.currentLocation;
  this.simulateWeatherLoad();
};

ShoreSquad.reverseGeocode = function(lat, lng) {
  // In production, use actual geocoding service
  // For demo purposes, we'll simulate
  this.state.currentLocation = 'Current Location';
  this.elements.currentLocation.textContent = this.state.currentLocation;
};

ShoreSquad.simulateWeatherLoad = function() {
  // Simulate weather API call
  setTimeout(() => {
    const mockWeather = {
      temperature: 72,
      condition: 'Sunny',
      icon: 'fas fa-sun',
      forecast: [
        { day: 'Today', temp: 72, condition: 'Sunny', icon: 'fas fa-sun' },
        { day: 'Tomorrow', temp: 68, condition: 'Partly Cloudy', icon: 'fas fa-cloud-sun' },
        { day: 'Friday', temp: 70, condition: 'Clear', icon: 'fas fa-sun' },
        { day: 'Saturday', temp: 74, condition: 'Sunny', icon: 'fas fa-sun' },
        { day: 'Sunday', temp: 69, condition: 'Cloudy', icon: 'fas fa-cloud' }
      ]
    };
    
    this.renderWeather(mockWeather);
  }, 1000);
};

ShoreSquad.renderWeather = function(weather) {
  // Update current weather
  this.elements.currentTemp.textContent = `${weather.temperature}°F`;
  this.elements.currentCondition.textContent = weather.condition;
  
  // Update weather icon
  const weatherIcon = document.querySelector('.weather-icon i');
  if (weatherIcon) {
    weatherIcon.className = weather.icon;
  }
  
  // Render forecast
  if (this.elements.weatherForecast) {
    this.elements.weatherForecast.innerHTML = weather.forecast.map(day => `
      <div class="forecast-day">
        <div class="forecast-day-name">${day.day}</div>
        <div class="forecast-icon">
          <i class="${day.icon}" aria-hidden="true"></i>
        </div>
        <div class="forecast-temp">${day.temp}°</div>
        <div class="forecast-condition">${day.condition}</div>
      </div>
    `).join('');
  }
};

// ==========================================================================
// Animation Functions
// ==========================================================================

ShoreSquad.initializeIntersectionObserver = function() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Trigger count-up animation for stats
        if (entry.target.classList.contains('stat-number')) {
          this.animateCountUp(entry.target);
        }
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.feature-card, .stat-card, .about-text');
  animatedElements.forEach(el => observer.observe(el));
};

ShoreSquad.initializeCountUpAnimation = function() {
  // Add CSS for animation
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
};

ShoreSquad.animateCountUp = function(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000; // 2 seconds
  const step = target / (duration / 16); // 60fps
  let current = 0;
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
};

// ==========================================================================
// Data Loading Functions
// ==========================================================================

ShoreSquad.loadMockCleanupEvents = function() {
  // Mock data for demonstration
  this.state.cleanupEvents = [
    {
      id: 1,
      title: 'Ocean Beach Cleanup',
      location: 'Ocean Beach, San Francisco',
      date: new Date('2025-06-07'),
      participants: 15,
      maxParticipants: 25,
      duration: '3 hours',
      familyFriendly: true
    },
    {
      id: 2,
      title: 'Santa Monica Pier Squad',
      location: 'Santa Monica, CA',
      date: new Date('2025-06-08'),
      participants: 32,
      maxParticipants: 50,
      duration: '4 hours',
      familyFriendly: true
    },
    {
      id: 3,
      title: 'Marin Headlands Adventure',
      location: 'Marin County, CA',
      date: new Date('2025-06-14'),
      participants: 8,
      maxParticipants: 15,
      duration: '2 hours',
      familyFriendly: false
    },
    {
      id: 4,
      title: 'Half Moon Bay Cleanup',
      location: 'Half Moon Bay, CA',
      date: new Date('2025-06-15'),
      participants: 22,
      maxParticipants: 30,
      duration: '3 hours',
      familyFriendly: true
    }
  ];
  
  this.renderEvents(this.state.cleanupEvents);
};

ShoreSquad.loadMockActivityFeed = function() {
  const activities = [
    {
      user: 'Sarah M.',
      action: 'organized a cleanup at Baker Beach',
      time: '2 hours ago',
      icon: 'fas fa-calendar-plus'
    },
    {
      user: 'Team OceanWarriors',
      action: 'collected 45 lbs of trash at Crissy Field',
      time: '5 hours ago',
      icon: 'fas fa-trash'
    },
    {
      user: 'Mike R.',
      action: 'joined the Pacifica cleanup squad',
      time: '1 day ago',
      icon: 'fas fa-users'
    },
    {
      user: 'EcoSquad SF',
      action: 'reached 100 cleanups milestone! 🎉',
      time: '2 days ago',
      icon: 'fas fa-trophy'
    }
  ];
  
  if (this.elements.activityFeed) {
    this.elements.activityFeed.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="${activity.icon}" aria-hidden="true"></i>
        </div>
        <div class="activity-content">
          <p><strong>${activity.user}</strong> ${activity.action}</p>
          <span class="activity-time">${activity.time}</span>
        </div>
      </div>
    `).join('');
  }
};

// ==========================================================================
// Form Handling
// ==========================================================================

ShoreSquad.handleNewsletterSubmit = function(event) {
  event.preventDefault();
  
  const emailInput = event.target.querySelector('input[type="email"]');
  const email = emailInput.value.trim();
  
  if (this.validateEmail(email)) {
    // In production, send to newsletter service
    this.showNotification('Thanks for subscribing! 🌊', 'success');
    emailInput.value = '';
  } else {
    this.showNotification('Please enter a valid email address.', 'error');
  }
};

ShoreSquad.validateEmail = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ==========================================================================
// UI Feedback Functions
// ==========================================================================

ShoreSquad.showNotification = function(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close" aria-label="Close notification">×</button>
    </div>
  `;
  
  // Add styles if not already present
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
      }
      .notification.show {
        transform: translateX(0);
      }
      .notification-success {
        border-left: 4px solid var(--color-accent);
      }
      .notification-error {
        border-left: 4px solid var(--color-secondary);
      }
      .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        margin-left: 12px;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Handle close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
};

ShoreSquad.showLoading = function() {
  this.state.isLoading = true;
  if (this.elements.loadingSpinner) {
    this.elements.loadingSpinner.style.display = 'flex';
  }
};

ShoreSquad.hideLoading = function() {
  this.state.isLoading = false;
  if (this.elements.loadingSpinner) {
    this.elements.loadingSpinner.style.display = 'none';
  }
};

// ==========================================================================
// Scroll and Window Event Handlers
// ==========================================================================

ShoreSquad.handleScroll = function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = 'none';
  }
};

ShoreSquad.handleResize = function() {
  // Close mobile nav on resize to desktop
  if (window.innerWidth > 768) {
    this.elements.navMenu.classList.remove('active');
    this.elements.navToggle.setAttribute('aria-expanded', 'false');
  }
};

ShoreSquad.handleKeyDown = function(event) {
  // Escape key closes mobile nav
  if (event.key === 'Escape') {
    this.elements.navMenu.classList.remove('active');
    this.elements.navToggle.setAttribute('aria-expanded', 'false');
  }
};

// ==========================================================================
// Utility Functions
// ==========================================================================

ShoreSquad.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

ShoreSquad.throttle = function(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

ShoreSquad.formatDate = function(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

ShoreSquad.getUpcomingWeekend = function() {
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilSaturday = (6 - currentDay) % 7;
  
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  
  return { start: saturday, end: sunday };
};

ShoreSquad.isDateInRange = function(date, start, end) {
  return date >= start && date <= end;
};

// ==========================================================================
// Service Worker Registration (Progressive Web App)
// ==========================================================================

ShoreSquad.registerServiceWorker = function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// ==========================================================================
// Initialize Application
// ==========================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ShoreSquad.init());
} else {
  ShoreSquad.init();
}

// Export for potential use in other scripts
window.ShoreSquad = ShoreSquad;
