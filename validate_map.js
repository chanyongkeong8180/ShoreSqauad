// Map Validation Script for ShoreSquad
// This script tests the map functionality and logs detailed information

console.log('🧪 Starting ShoreSquad Map Validation...');

// Wait for the application to initialize
setTimeout(() => {
    console.log('🔍 Checking map implementation...');
    
    const mapContainer = document.getElementById('cleanup-map');
    if (!mapContainer) {
        console.error('❌ Map container not found');
        return;
    }
    
    console.log('✅ Map container found:', mapContainer);
    
    const iframe = mapContainer.querySelector('iframe');
    if (iframe) {
        console.log('✅ Google Maps iframe found:', iframe.src);
        console.log('📏 Iframe dimensions:', {
            width: iframe.width,
            height: iframe.height,
            style: iframe.style.cssText
        });
        
        // Test if iframe is actually visible
        const rect = iframe.getBoundingClientRect();
        console.log('📍 Iframe position:', rect);
        
        if (rect.width > 0 && rect.height > 0) {
            console.log('✅ Iframe is visible and has dimensions');
        } else {
            console.warn('⚠️ Iframe has no visible dimensions');
        }
        
        // Monitor for changes
        let checkCount = 0;
        const monitorInterval = setInterval(() => {
            checkCount++;
            const currentIframe = mapContainer.querySelector('iframe');
            
            if (currentIframe === iframe) {
                console.log(`✅ [${checkCount * 2}s] Google Maps iframe still present`);
            } else if (currentIframe) {
                console.warn(`⚠️ [${checkCount * 2}s] Iframe was replaced!`);
                console.log('New iframe:', currentIframe);
                clearInterval(monitorInterval);
            } else {
                console.error(`❌ [${checkCount * 2}s] Iframe was removed!`);
                console.log('Map container content:', mapContainer.innerHTML);
                clearInterval(monitorInterval);
            }
            
            // Stop monitoring after 20 seconds
            if (checkCount >= 10) {
                console.log('🎉 Map persistence test completed - iframe remained stable');
                clearInterval(monitorInterval);
            }
        }, 2000);
        
    } else {
        console.log('ℹ️ No iframe found - checking for fallback map');
        const fallbackMap = mapContainer.querySelector('.map-content');
        if (fallbackMap) {
            console.log('✅ Fallback interactive map is active');
        } else {
            console.error('❌ No map implementation found');
        }
    }
    
    // Check for map controls
    const controls = mapContainer.querySelector('.map-controls-overlay');
    if (controls) {
        console.log('✅ Map controls overlay found');
    } else {
        console.log('ℹ️ No map controls overlay found');
    }
    
    // Test ShoreSquad object
    if (typeof ShoreSquad !== 'undefined') {
        console.log('✅ ShoreSquad object available');
        console.log('📊 ShoreSquad state:', ShoreSquad.state);
        
        // Test map functions
        const mapFunctions = [
            'initInteractiveMap',
            'addInteractiveMapControls', 
            'loadInteractiveMapFallback',
            'addMarkerInteractions',
            'generateLocationBasedCleanups'
        ];
        
        mapFunctions.forEach(func => {
            if (typeof ShoreSquad[func] === 'function') {
                console.log(`✅ ${func} function available`);
            } else {
                console.error(`❌ ${func} function missing`);
            }
        });
    } else {
        console.error('❌ ShoreSquad object not available');
    }
    
}, 1000);

// Add this script to the browser console or run it from here
console.log('📋 Map validation script loaded. Results will appear in 1 second...');
