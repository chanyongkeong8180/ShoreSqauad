// Final Weather System Validation Script
// This script validates the complete weather integration

console.log('🌤️ Starting Final Weather System Validation...');

// Test if ShoreSquad object is available
if (typeof window.ShoreSquad !== 'undefined') {
    console.log('✅ ShoreSquad object is available');
    
    // Test weather data loading
    if (typeof window.ShoreSquad.loadWeatherData === 'function') {
        console.log('✅ loadWeatherData function exists');
        
        // Test weather recommendations
        if (typeof window.ShoreSquad.getWeatherRecommendations === 'function') {
            console.log('✅ getWeatherRecommendations function exists');
            
            // Test a sample weather recommendation
            const testWeather = {
                temperature: 28,
                condition: 'partly cloudy',
                humidity: 80
            };
            
            const recommendations = window.ShoreSquad.getWeatherRecommendations(testWeather);
            console.log('✅ Weather recommendations test:', recommendations);
            
        } else {
            console.log('❌ getWeatherRecommendations function not found');
        }
        
        // Test API functions
        const apiFunctions = [
            'fetchCurrentTemperature',
            'fetch4DayForecast', 
            'fetch24HourForecast',
            'processWeatherData'
        ];
        
        apiFunctions.forEach(funcName => {
            if (typeof window.ShoreSquad[funcName] === 'function') {
                console.log(`✅ ${funcName} function exists`);
            } else {
                console.log(`❌ ${funcName} function not found`);
            }
        });
        
    } else {
        console.log('❌ loadWeatherData function not found');
    }
    
    // Test weather elements
    const weatherElements = [
        'currentLocation',
        'currentTemp', 
        'currentCondition',
        'weatherForecast'
    ];
    
    console.log('🔍 Checking weather DOM elements:');
    weatherElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ Element #${elementId} found:`, element.textContent || 'Empty');
        } else {
            console.log(`❌ Element #${elementId} not found`);
        }
    });
    
    // Test weather refresh button
    const refreshBtn = document.querySelector('.weather-refresh-btn');
    if (refreshBtn) {
        console.log('✅ Weather refresh button found');
        console.log('🔄 Button onclick:', refreshBtn.getAttribute('onclick'));
    } else {
        console.log('❌ Weather refresh button not found');
    }
    
} else {
    console.log('❌ ShoreSquad object not available');
}

// Test NEA APIs directly
console.log('🌐 Testing NEA APIs directly...');

async function testNEAAPIs() {
    const apis = [
        {
            name: 'Temperature',
            url: 'https://api.data.gov.sg/v1/environment/air-temperature'
        },
        {
            name: '4-Day Forecast',
            url: 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast'
        },
        {
            name: '24-Hour Forecast', 
            url: 'https://api.data.gov.sg/v1/environment/24-hour-weather-forecast'
        }
    ];
    
    for (const api of apis) {
        try {
            console.log(`🔄 Testing ${api.name} API...`);
            const response = await fetch(api.url);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${api.name} API successful:`, data.items ? `${data.items.length} items` : 'Data received');
            } else {
                console.log(`❌ ${api.name} API failed: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${api.name} API error:`, error.message);
        }
    }
}

// Run API tests
testNEAAPIs();

console.log('🎯 Weather System Validation Complete');
console.log('💡 Check browser console and weather section for results');
