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
    this.initParallax();
    this.initScrollReveal();
    this.initTypewriter();
    this.initInteractiveMap();
    this.requestLocationPermission();
  },
    // Load initial data
  loadInitialData() {
    this.loadMockCleanupEvents();
    this.loadMockActivityFeed();
    // Load real weather data from NEA APIs
    this.loadWeatherData();
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
  // Load weather data for current location
  this.loadWeatherData();
  
  // Automatically load nearby cleanups based on location
  this.findNearbyCleanups();
  
  this.showNotification('📍 Location detected! Showing cleanups near you.', 'success');
};

ShoreSquad.handleLocationError = function(error) {
  console.warn('Location access denied or failed:', error);
  
  // Fallback to Singapore (since we're using NEA APIs)
  this.state.currentLocation = 'Singapore';
  this.elements.currentLocation.textContent = this.state.currentLocation;
  this.loadWeatherData();
};

ShoreSquad.reverseGeocode = function(lat, lng) {
  // In production, use actual geocoding service
  // For demo purposes, we'll simulate
  this.state.currentLocation = 'Current Location';
  this.elements.currentLocation.textContent = this.state.currentLocation;
};

// Weather API integration with NEA Singapore data
ShoreSquad.loadWeatherData = async function() {
  try {
    // Show loading state
    if (this.elements.currentTemp) this.elements.currentTemp.textContent = 'Loading...';
    if (this.elements.currentCondition) this.elements.currentCondition.textContent = 'Getting weather data...';
    
    this.logWeatherDebug('Starting weather data fetch', 'NEA APIs');

    // Fetch data from multiple NEA APIs with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const [currentTempData, forecastData, todayForecastData] = await Promise.race([
      Promise.all([
        this.fetchCurrentTemperature(),
        this.fetch4DayForecast(),
        this.fetch24HourForecast()
      ]),
      timeoutPromise
    ]);

    this.logWeatherDebug('Raw API responses', {
      temperature: currentTempData,
      forecast: forecastData,
      today: todayForecastData
    });

    // Process and combine the data
    const weatherData = this.processWeatherData(currentTempData, forecastData, todayForecastData);
    
    this.logWeatherDebug('Processed weather data', weatherData);
    
    this.state.weatherData = weatherData;
    this.renderEnhancedWeather(weatherData);
    
    // Add timestamp
    this.updateWeatherTimestamp();
    
    this.logWeatherDebug('Weather display updated successfully', 'Complete');
    
  } catch (error) {
    this.handleSpecificWeatherError(error, 'Weather Load');
    this.handleWeatherError();
  }
};

// Fetch current temperature from NEA API
ShoreSquad.fetchCurrentTemperature = async function() {
  const response = await fetch('https://api.data.gov.sg/v1/environment/air-temperature');
  if (!response.ok) throw new Error('Failed to fetch temperature data');
  return await response.json();
};

// Fetch 4-day weather forecast from NEA API
ShoreSquad.fetch4DayForecast = async function() {
  const response = await fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast');
  if (!response.ok) throw new Error('Failed to fetch forecast data');
  return await response.json();
};

// Fetch 24-hour detailed forecast from NEA API
ShoreSquad.fetch24HourForecast = async function() {
  const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast');
  if (!response.ok) throw new Error('Failed to fetch 24-hour forecast');
  return await response.json();
};

// Process and format weather data from NEA APIs
ShoreSquad.processWeatherData = function(tempData, forecastData, todayData) {
  // Get current temperature (average from available stations)
  const currentTemp = this.getCurrentTemperature(tempData);
  
  // Get current conditions from 24-hour forecast
  const currentCondition = this.getCurrentCondition(todayData);
  
  // Get 4-day forecast
  const forecast = this.process4DayForecast(forecastData);
  
  return {
    location: 'Singapore',
    temperature: currentTemp,
    condition: currentCondition,
    humidity: this.getHumidity(todayData),
    windSpeed: this.getWindSpeed(todayData),
    forecast: forecast
  };
};

// Extract current temperature from NEA temperature data
ShoreSquad.getCurrentTemperature = function(tempData) {
  if (!tempData?.items?.[0]?.readings) return 26; // Default fallback
  
  const readings = tempData.items[0].readings;
  const temperatures = readings.map(r => r.value);
  
  // Return average temperature, rounded to nearest integer
  return Math.round(temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length);
};

// Extract current weather condition from 24-hour forecast
ShoreSquad.getCurrentCondition = function(todayData) {
  if (!todayData?.items?.[0]?.general) return 'Partly Cloudy';
  
  const forecast = todayData.items[0].general.forecast;
  return forecast || 'Partly Cloudy';
};

// Get humidity from 24-hour forecast data
ShoreSquad.getHumidity = function(todayData) {
  if (!todayData?.items?.[0]?.general?.relative_humidity) {
    this.logWeatherDebug('No humidity data found, using default', todayData);
    return 75;
  }
  
  const humidity = todayData.items[0].general.relative_humidity;
  this.logWeatherDebug('Raw humidity data', humidity);
  
  let humidityValue = 75; // Default
  
  // Handle different humidity formats from NEA
  if (typeof humidity === 'object') {
    humidityValue = humidity.high || humidity.low || 75;
  } else if (typeof humidity === 'string') {
    // Handle ranges like "70-85" or single values
    const humidityStr = humidity.toString();
    if (humidityStr.includes('-')) {
      const parts = humidityStr.split('-');
      humidityValue = parseInt(parts[1]) || parseInt(parts[0]) || 75;
    } else {
      humidityValue = parseInt(humidityStr) || 75;
    }
  } else if (typeof humidity === 'number') {
    humidityValue = humidity;
  }
  
  this.logWeatherDebug('Processed humidity', { raw: humidity, processed: humidityValue });
  return Math.min(100, Math.max(0, humidityValue)); // Ensure valid range
};

// Get wind speed from 24-hour forecast data  
ShoreSquad.getWindSpeed = function(todayData) {
  if (!todayData?.items?.[0]?.general?.wind) {
    this.logWeatherDebug('No wind data found, using default', todayData);
    return 12;
  }
  
  const wind = todayData.items[0].general.wind;
  this.logWeatherDebug('Raw wind data', wind);
  
  let windSpeed = 12; // Default in km/h
  
  // Handle different wind formats from NEA
  if (typeof wind === 'object') {
    if (wind.speed) {
      // Extract numeric value from speed description
      const speedMatch = wind.speed.toString().match(/(\d+)/);
      windSpeed = speedMatch ? parseInt(speedMatch[1]) : 12;
    } else if (wind.direction) {
      // Sometimes wind data only has direction, estimate moderate speed
      windSpeed = 15;
    }
  } else if (typeof wind === 'string') {
    // Extract speed from description like "NE 15-25 kmh"
    const speedMatch = wind.match(/(\d+)/);
    windSpeed = speedMatch ? parseInt(speedMatch[1]) : 12;
  }
  
  this.logWeatherDebug('Processed wind speed', { raw: wind, processed: windSpeed });
  return Math.min(50, Math.max(0, windSpeed)); // Reasonable range for Singapore
};

// Process 4-day forecast data into display format
ShoreSquad.process4DayForecast = function(forecastData) {
  if (!forecastData?.items?.[0]?.forecasts) {
    this.logWeatherDebug('No forecast data available, using fallback', forecastData);
    return this.getDefaultForecast();
  }
  
  const forecasts = forecastData.items[0].forecasts;
  this.logWeatherDebug('Processing forecast data', { 
    forecastCount: forecasts.length,
    forecasts: forecasts 
  });
  
  return forecasts.slice(0, 4).map((forecast, index) => {
    const dayName = index === 0 ? 'Today' : 
                   index === 1 ? 'Tomorrow' : 
                   new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' });
    
    const avgTemp = this.extractTemperature(forecast.temperature);
    const condition = forecast.forecast || 'Partly Cloudy';
    const icon = this.getWeatherIcon(condition);
    
    this.logWeatherDebug(`Day ${index + 1} (${dayName})`, {
      date: forecast.date,
      temperature: forecast.temperature,
      avgTemp: avgTemp,
      condition: condition,
      icon: icon
    });
    
    return {
      day: dayName,
      temp: avgTemp,
      condition: condition,
      icon: icon
    };
  });
};

// Extract temperature from NEA temperature object
ShoreSquad.extractTemperature = function(tempObj) {
  if (!tempObj) return 26;
  
  // NEA provides temperature as {low: X, high: Y}
  if (tempObj.high && tempObj.low) {
    return Math.round((tempObj.high + tempObj.low) / 2);
  }
  
  return tempObj.high || tempObj.low || 26;
};

// Map weather conditions to appropriate icons
ShoreSquad.getWeatherIcon = function(condition) {
  if (!condition) return 'fas fa-sun';
  
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return 'fas fa-cloud-rain';
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return 'fas fa-bolt';
  } else if (conditionLower.includes('cloud')) {
    if (conditionLower.includes('partly')) {
      return 'fas fa-cloud-sun';
    }
    return 'fas fa-cloud';
  } else if (conditionLower.includes('sun') || conditionLower.includes('fair') || conditionLower.includes('clear')) {
    return 'fas fa-sun';
  } else if (conditionLower.includes('haze') || conditionLower.includes('mist')) {
    return 'fas fa-smog';
  }
  
  return 'fas fa-cloud-sun'; // Default
};

// Provide default forecast data as fallback
ShoreSquad.getDefaultForecast = function() {
  return [
    { day: 'Today', temp: 26, condition: 'Partly Cloudy', icon: 'fas fa-cloud-sun' },
    { day: 'Tomorrow', temp: 28, condition: 'Sunny', icon: 'fas fa-sun' },
    { day: 'Day 3', temp: 24, condition: 'Light Rain', icon: 'fas fa-cloud-rain' },
    { day: 'Day 4', temp: 27, condition: 'Partly Cloudy', icon: 'fas fa-cloud-sun' }
  ];
};

// Handle weather API errors gracefully
ShoreSquad.handleWeatherError = function() {
  // Show fallback data with error indication
  const fallbackWeather = {
    location: 'Singapore',
    temperature: 26,
    condition: 'Data Unavailable',
    humidity: 75,
    windSpeed: 12,
    forecast: this.getDefaultForecast()
  };
  
  this.state.weatherData = fallbackWeather;
  this.renderEnhancedWeather(fallbackWeather);
  
  // Show error message to user
  if (this.elements.currentCondition) {
    this.elements.currentCondition.textContent = 'Weather data temporarily unavailable';
    this.elements.currentCondition.style.fontSize = '0.9rem';
    this.elements.currentCondition.style.color = '#666';
  }
};

ShoreSquad.renderWeather = function(weather) {
  if (!weather || !this.elements.currentTemp || !this.elements.currentCondition) return;
  
  // Update current weather display with Celsius
  this.elements.currentTemp.textContent = `${weather.temperature}°C`;
  this.elements.currentCondition.textContent = weather.condition;
  
  // Update forecast if element exists
  if (this.elements.weatherForecast && weather.forecast) {
    this.elements.weatherForecast.innerHTML = weather.forecast.map(day => `
      <div class="forecast-day">
        <div class="forecast-day-name">${day.day}</div>
        <div class="forecast-icon">
          <i class="${day.icon}" aria-hidden="true"></i>
        </div>
        <div class="forecast-temp">${day.temp}°C</div>
        <div class="forecast-condition">${day.condition}</div>
      </div>
    `).join('');
  }
};

// ==========================================================================
// Enhanced Interactive Features
// ==========================================================================

// Parallax scrolling effect
ShoreSquad.initParallax = function() {
  const heroBackground = document.querySelector('.hero-background');
  
  if (heroBackground) {
    window.addEventListener('scroll', this.throttle(() => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      heroBackground.style.transform = `translate3d(0, ${parallax}px, 0)`;
    }, 16));
  }
};

// Enhanced scroll reveal animations
ShoreSquad.initScrollReveal = function() {
  const revealElements = document.querySelectorAll('.feature-card, .stat-card, .about-text');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
};

// Typewriter effect for hero title
ShoreSquad.initTypewriter = function() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;
  
  const text = heroTitle.textContent;
  heroTitle.textContent = '';
  heroTitle.style.borderRight = '3px solid white';
  
  let i = 0;
  const typeWriter = () => {
    if (i < text.length) {
      heroTitle.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    } else {
      // Remove cursor after typing is complete
      setTimeout(() => {
        heroTitle.style.borderRight = 'none';
      }, 1000);
    }
  };
  
  // Start typewriter effect after a delay
  setTimeout(typeWriter, 1000);
};

// Enhanced weather widget with more details
ShoreSquad.renderEnhancedWeather = function(weather) {
  this.renderWeather(weather);
  
  // Add weather recommendations
  const recommendations = this.getWeatherRecommendations(weather);
  const weatherWidget = document.querySelector('.weather-widget');
  
  if (weatherWidget && recommendations) {
    // Remove any existing recommendations to prevent duplicates
    const existingRecommendations = weatherWidget.querySelector('.weather-recommendations');
    if (existingRecommendations) {
      existingRecommendations.remove();
    }
    
    const recommendationElement = document.createElement('div');
    recommendationElement.className = 'weather-recommendations';
    recommendationElement.innerHTML = `
      <div class="recommendation-header">
        <h4>Cleanup Recommendations</h4>
      </div>
      <div class="recommendation-content">
        <div class="recommendation-item ${recommendations.suitability}">
          <i class="${recommendations.icon}" aria-hidden="true"></i>
          <span>${recommendations.message}</span>
        </div>
        <div class="recommendation-tips">
          <h5>Tips for today:</h5>
          <ul>
            ${recommendations.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    weatherWidget.appendChild(recommendationElement);
  }
};

ShoreSquad.getWeatherRecommendations = function(weather) {
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();
  const humidity = weather.humidity || 75;
  
  let suitability, icon, message, tips;
  
  // Check for severe weather conditions
  if (condition.includes('thundery') || condition.includes('heavy rain') || condition.includes('storm')) {
    suitability = 'poor';
    icon = 'fas fa-exclamation-triangle';
    message = 'Unsafe conditions - postpone cleanup';
    tips = [
      'Wait for weather to clear completely',
      'Monitor NEA weather updates',
      'Plan for next available date',
      'Consider indoor environmental activities'
    ];
  } 
  // Moderate rain conditions
  else if (condition.includes('shower') || condition.includes('light rain') || condition.includes('rain')) {
    suitability = 'poor';
    icon = 'fas fa-umbrella';
    message = 'Not recommended for beach cleanup';
    tips = [
      'Wet sand can be dangerous for walking',
      'Limited visibility affects safety',
      'Check forecast for tomorrow',
      'Consider rescheduling to a clearer day'
    ];
  }
  // Hazy conditions (common in Singapore)
  else if (condition.includes('haze') || condition.includes('hazy')) {
    suitability = 'moderate';
    icon = 'fas fa-smog';
    message = 'Proceed with caution - Air quality concerns';
    tips = [
      'Wear N95 masks during cleanup',
      'Take frequent breaks indoors',
      'Stay hydrated more than usual',
      'Consider shorter sessions (1-2 hours max)'
    ];
  }
  // Very hot conditions (Singapore can get quite warm)
  else if (temp > 30) {
    suitability = 'moderate';
    icon = 'fas fa-thermometer-three-quarters';
    message = 'Hot conditions - take extra precautions';
    tips = [
      'Start early morning (7-9 AM) or late afternoon (5-7 PM)',
      'Bring extra water and electrolyte drinks',
      'Wear light-colored, long-sleeved shirts',
      'Take shade breaks every 30 minutes'
    ];
  }
  // High humidity (very common in Singapore)
  else if (humidity > 85) {
    suitability = 'moderate';
    icon = 'fas fa-tint';
    message = 'High humidity - plan for comfort';
    tips = [
      'Wear moisture-wicking clothing',
      'Bring cooling towels',
      'Schedule more frequent breaks',
      'Start hydrating well before the event'
    ];
  }
  // Ideal Singapore weather conditions
  else if ((condition.includes('fair') || condition.includes('partly cloudy') || condition.includes('cloudy')) && 
           temp >= 24 && temp <= 30 && humidity <= 85) {
    suitability = 'excellent';
    icon = 'fas fa-thumbs-up';
    message = 'Perfect Singapore weather for cleanup!';
    tips = [
      'Great conditions for outdoor activity',
      'Bring sunscreen (SPF 30+) - UV can be strong',
      'Perfect for team photos and social media',
      'Ideal weather for longer cleanup sessions'
    ];
  }
  // Good but not perfect conditions
  else {
    suitability = 'good';
    icon = 'fas fa-check';
    message = 'Good conditions for beach cleanup';
    tips = [
      'Weather is suitable for outdoor work',
      'Bring standard sun protection',
      'Stay hydrated throughout the event',
      'Monitor weather for any changes'
    ];
  }
  
  return { suitability, icon, message, tips };
};

// Interactive map simulation with animations
ShoreSquad.initInteractiveMap = function() {
  const mapContainer = document.getElementById('cleanup-map');
  if (!mapContainer) {
    console.log('Map container not found');
    return;
  }
  
  console.log('Initializing interactive map...');
    // Check if iframe exists and is loading properly
  const iframe = mapContainer.querySelector('iframe');
  if (iframe) {
    console.log('Google Maps iframe found, setting up monitoring...');
    
    // Track if iframe has successfully loaded
    let iframeLoaded = false;
    
    // Add load event listener to iframe
    iframe.addEventListener('load', () => {
      console.log('Google Maps iframe loaded successfully');
      iframeLoaded = true;
      this.addInteractiveMapControls();
    });
    
    // Add error handler for iframe (only for actual errors)
    iframe.addEventListener('error', () => {
      console.log('Google Maps failed to load, switching to interactive map');
      this.loadInteractiveMapFallback();
    });
    
    // More reliable fallback check - only if iframe hasn't loaded after reasonable time
    // and src is actually invalid or network error occurred
    setTimeout(() => {
      // Only switch to fallback if iframe genuinely hasn't loaded
      // We can't reliably check contentDocument due to CORS, so check other indicators
      if (!iframeLoaded && !iframe.src.includes('google.com/maps')) {
        console.log('Google Maps appears to have invalid src, using fallback');
        this.loadInteractiveMapFallback();
      } else if (!iframeLoaded) {
        // If iframe hasn't triggered load event but has valid src, just add controls
        console.log('Google Maps may still be loading, adding controls');
        this.addInteractiveMapControls();
      }
    }, 8000); // Increased timeout to 8 seconds for slower connections
  } else {
    // No iframe found, load interactive map directly
    console.log('No iframe found, loading interactive map fallback');
    this.loadInteractiveMapFallback();
  }
};

// Add interactive controls overlay to existing map
ShoreSquad.addInteractiveMapControls = function() {
  const mapContainer = document.getElementById('cleanup-map');
  if (!mapContainer) {
    console.log('Map container not found for controls');
    return;
  }
  
  // Check if controls already exist to prevent duplicates
  const existingControls = mapContainer.querySelector('.map-controls-overlay');
  if (existingControls) {
    console.log('Map controls already exist, skipping...');
    return;
  }
  
  console.log('Adding interactive map controls...');
  
  // Add overlay controls without replacing the iframe
  const controlsOverlay = document.createElement('div');
  controlsOverlay.className = 'map-controls-overlay';
  controlsOverlay.innerHTML = `
    <div class="map-overlay">
      <button class="map-control locate" aria-label="Find cleanups near me" onclick="ShoreSquad.findNearbyCleanups()">
        <i class="fas fa-crosshairs" aria-hidden="true"></i>
      </button>
      <button class="map-control refresh" aria-label="Refresh cleanup locations" onclick="ShoreSquad.refreshCleanupLocations()">
        <i class="fas fa-sync-alt" aria-hidden="true"></i>
      </button>
      <button class="map-control filter" aria-label="Filter cleanups" onclick="ShoreSquad.toggleMapFilters()">
        <i class="fas fa-filter" aria-hidden="true"></i>
      </button>
    </div>
  `;
  
  mapContainer.appendChild(controlsOverlay);
  console.log('Interactive map controls added successfully');
};

// Fallback interactive map when Google Maps fails
ShoreSquad.loadInteractiveMapFallback = function() {
  const mapContainer = document.getElementById('cleanup-map');
  if (!mapContainer) {
    console.log('Map container not found for fallback');
    return;
  }
  
  console.log('Loading interactive map fallback...');
  
  const mapContent = document.createElement('div');
  mapContent.className = 'map-content';
  mapContent.innerHTML = `
    <div class="map-background">
      <div class="map-title">
        <h4><i class="fas fa-map-marked-alt"></i> Cleanup Locations</h4>
        <p>Interactive map showing beach cleanup events near you</p>
      </div>
    </div>
    <div class="map-markers">
      ${this.generateLocationBasedCleanups().map((event, index) => `
        <div class="map-marker" 
             style="top: ${20 + index * 15}%; left: ${25 + index * 20}%;"
             data-event-id="${event.id}">
          <div class="marker-icon">
            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
          </div>
          <div class="marker-popup">
            <h6>${event.title}</h6>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p><i class="fas fa-users"></i> ${event.participants}/${event.maxParticipants} joined</p>
            <p><i class="fas fa-route"></i> ${event.distance || 'Unknown'} away</p>
            <button class="btn btn-small btn-primary" onclick="ShoreSquad.showEventDetails(${event.id})">
              View Details
            </button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="map-overlay">
      <button class="map-control zoom-in" aria-label="Zoom in" onclick="ShoreSquad.zoomIn()">
        <i class="fas fa-plus" aria-hidden="true"></i>
      </button>
      <button class="map-control zoom-out" aria-label="Zoom out" onclick="ShoreSquad.zoomOut()">
        <i class="fas fa-minus" aria-hidden="true"></i>
      </button>
      <button class="map-control locate" aria-label="Find my location" onclick="ShoreSquad.findNearbyCleanups()">
        <i class="fas fa-crosshairs" aria-hidden="true"></i>
      </button>
    </div>
  `;
  
  mapContainer.innerHTML = '';
  mapContainer.appendChild(mapContent);
  
  console.log('Interactive map fallback loaded successfully');
  
  // Add marker interactions
  this.addMarkerInteractions();
};

// Add marker interactions
ShoreSquad.addMarkerInteractions = function() {
  const markers = document.querySelectorAll('.map-marker');
  console.log(`Adding interactions to ${markers.length} markers`);
  
  markers.forEach((marker, index) => {
    marker.addEventListener('click', (e) => {
      const eventId = parseInt(e.currentTarget.getAttribute('data-event-id'));
      console.log(`Marker ${index + 1} clicked, event ID: ${eventId}`);
      this.showEventDetails(eventId);
    });
    
    marker.addEventListener('mouseenter', (e) => {
      const popup = e.currentTarget.querySelector('.marker-popup');
      if (popup) {
        popup.style.display = 'block';
        console.log(`Showing popup for marker ${index + 1}`);
      }
    });
    
    marker.addEventListener('mouseleave', (e) => {
      const popup = e.currentTarget.querySelector('.marker-popup');
      if (popup) {
        popup.style.display = 'none';
        console.log(`Hiding popup for marker ${index + 1}`);
      }
    });
  });
  
  console.log('Marker interactions setup complete');
};

// Generate cleanup events based on user location
ShoreSquad.generateLocationBasedCleanups = function() {
  const userLat = this.state.userPosition?.lat || 1.3521; // Default to Singapore
  const userLng = this.state.userPosition?.lng || 103.8198;
  
  // Base cleanup events with location-based data
  const locationBasedEvents = [
    {
      id: 101,
      title: 'Marina Bay Beach Cleanup',
      location: 'Marina Bay, Singapore',
      lat: 1.2830,
      lng: 103.8607,
      participants: 18,
      maxParticipants: 30,
      duration: '3 hours',
      familyFriendly: true,
      distance: this.calculateDistance(userLat, userLng, 1.2830, 103.8607),
      date: new Date('2025-06-08'),
      priority: 'high'
    },
    {
      id: 102,
      title: 'Sentosa Siloso Beach Squad',
      location: 'Sentosa Island, Singapore',
      lat: 1.2494,
      lng: 103.8303,
      participants: 25,
      maxParticipants: 40,
      duration: '4 hours',
      familyFriendly: true,
      distance: this.calculateDistance(userLat, userLng, 1.2494, 103.8303),
      date: new Date('2025-06-09'),
      priority: 'medium'
    },
    {
      id: 103,
      title: 'East Coast Park Cleanup',
      location: 'East Coast Park, Singapore',
      lat: 1.3006,
      lng: 103.9128,
      participants: 12,
      maxParticipants: 25,
      duration: '2.5 hours',
      familyFriendly: true,
      distance: this.calculateDistance(userLat, userLng, 1.3006, 103.9128),
      date: new Date('2025-06-14'),
      priority: 'high'
    },
    {
      id: 104,
      title: 'Changi Beach Conservation',
      location: 'Changi Beach, Singapore',
      lat: 1.3905,
      lng: 103.9856,
      participants: 8,
      maxParticipants: 20,
      duration: '3 hours',
      familyFriendly: false,
      distance: this.calculateDistance(userLat, userLng, 1.3905, 103.9856),
      date: new Date('2025-06-15'),
      priority: 'medium'
    },
    {
      id: 105,
      title: 'Pasir Ris Beach Adventure',
      location: 'Pasir Ris Beach, Singapore',
      lat: 1.3815,
      lng: 103.9556,
      participants: 20,
      maxParticipants: 35,
      duration: '3.5 hours',
      familyFriendly: true,
      distance: this.calculateDistance(userLat, userLng, 1.3815, 103.9556),
      date: new Date('2025-06-16'),
      priority: 'high'
    }
  ];
  
  // Sort by distance (nearest first)
  return locationBasedEvents.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Calculate distance between two coordinates (Haversine formula)
ShoreSquad.calculateDistance = function(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
};

// Find nearby cleanups based on user location
ShoreSquad.findNearbyCleanups = function() {
  this.showNotification('📍 Finding cleanups near your location...', 'info');
  
  // Request location if not already available
  if (!this.state.userPosition) {
    this.requestLocationPermission();
    return;
  }
  
  // Generate location-based events
  const nearbyEvents = this.generateLocationBasedCleanups();
  
  // Update the main events list with location-based events
  this.state.cleanupEvents = nearbyEvents;
  this.renderEvents(nearbyEvents);
  
  // Refresh map if in fallback mode
  const mapContainer = document.getElementById('cleanup-map');
  if (mapContainer && mapContainer.querySelector('.map-content')) {
    this.loadInteractiveMapFallback();
  }
  
  this.showNotification(`🌊 Found ${nearbyEvents.length} beach cleanups near you!`, 'success');
};

// Refresh cleanup locations
ShoreSquad.refreshCleanupLocations = function() {
  this.showNotification('🔄 Refreshing cleanup locations...', 'info');
  
  // Simulate data refresh
  setTimeout(() => {
    this.findNearbyCleanups();
  }, 1000);
};

// Toggle map filters
ShoreSquad.toggleMapFilters = function() {
  const sidebar = document.querySelector('.map-sidebar');
  if (sidebar) {
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    this.showNotification('🔧 Use the sidebar filters to customize your view', 'info');
  }
};

// Map zoom functions
ShoreSquad.zoomIn = function() {
  this.showNotification('🔍 Zoom in - View more details', 'info');
  // In a real implementation, this would interact with the map API
};

ShoreSquad.zoomOut = function() {
  this.showNotification('🔍 Zoom out - View broader area', 'info');
  // In a real implementation, this would interact with the map API
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
  console.log('Loading initial cleanup events...');
  
  // Start with location-based events by default
  if (this.state.userPosition) {
    // User location is available, load nearby events
    this.state.cleanupEvents = this.generateLocationBasedCleanups();
  } else {
    // Fallback to default Singapore events while waiting for location
    this.state.cleanupEvents = [
      {
        id: 1,
        title: 'Marina Bay Beach Cleanup',
        location: 'Marina Bay, Singapore',
        date: new Date('2025-06-08'),
        participants: 18,
        maxParticipants: 30,
        duration: '3 hours',
        familyFriendly: true,
        distance: 'TBD'
      },
      {
        id: 2,
        title: 'Sentosa Siloso Beach Squad',
        location: 'Sentosa Island, Singapore',
        date: new Date('2025-06-09'),
        participants: 25,
        maxParticipants: 40,
        duration: '4 hours',
        familyFriendly: true,
        distance: 'TBD'
      },
      {
        id: 3,
        title: 'East Coast Park Cleanup',
        location: 'East Coast Park, Singapore',
        date: new Date('2025-06-14'),
        participants: 12,
        maxParticipants: 25,
        duration: '2.5 hours',
        familyFriendly: true,
        distance: 'TBD'
      },
      {
        id: 4,
        title: 'Pasir Ris Beach Adventure',
        location: 'Pasir Ris Beach, Singapore',
        date: new Date('2025-06-16'),
        participants: 20,
        maxParticipants: 35,
        duration: '3.5 hours',
        familyFriendly: true,
        distance: 'TBD'
      }
    ];
  }
    console.log(`Loaded ${this.state.cleanupEvents.length} cleanup events`);
  this.renderEvents(this.state.cleanupEvents);
};

ShoreSquad.loadMockActivityFeed = function() {
  const activities = [
    {
      user: 'Sarah M.',
      action: 'organized a cleanup at Baker Beach',
      time: '2 hours ago',
      icon: 'fas fa-calendar-plus'
    },    {
      user: 'Team OceanWarriors',
      action: 'collected 20 kg of trash at Crissy Field',
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

// ==========================================================================
// Weather Data Debugging and Utilities
// ==========================================================================

// Add debug logging for weather data (development only)
ShoreSquad.logWeatherDebug = function(step, data) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`🌤️ Weather Debug - ${step}:`, data);
  }
};

// Add last updated timestamp to weather display  
ShoreSquad.updateWeatherTimestamp = function() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-SG', { 
    hour12: true, 
    hour: 'numeric', 
    minute: '2-digit' 
  });
  
  // Add timestamp to current location if element exists
  if (this.elements.currentLocation) {
    const originalText = this.elements.currentLocation.textContent.split(' • ')[0];
    this.elements.currentLocation.textContent = `${originalText} • Updated ${timeString}`;
    this.elements.currentLocation.style.fontSize = '1rem';
  }
};

// Enhanced error handling with user-friendly messages
ShoreSquad.handleSpecificWeatherError = function(error, apiType) {
  console.error(`Weather API Error (${apiType}):`, error);
  
  // Determine error type and show appropriate message
  let errorMessage = 'Weather data temporarily unavailable';
  
  if (error.message?.includes('fetch')) {
    errorMessage = 'Network issue - showing cached data';
  } else if (error.message?.includes('JSON')) {
    errorMessage = 'Data format issue - using fallback';
  }
  
  // Show brief notification to user
  this.showNotification(`🌤️ ${errorMessage}`, 'warning', 3000);
  
  return errorMessage;
};
