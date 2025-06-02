# Google Maps Setup Guide

## Current Implementation

The ShoreSquad application includes both Google Maps integration and a fallback interactive map system.

### How It Works

1. **Primary**: Google Maps iframe loads by default
2. **Fallback**: If Google Maps fails to load, an interactive custom map takes over
3. **Location-based**: Shows cleanup events based on user's location

### Map Features

- **Interactive markers** showing cleanup events
- **Distance calculation** from user location
- **Event details** with participant count and distance
- **Map controls** for zoom and location finding
- **Responsive design** for mobile devices

### Google Maps Configuration

The current iframe uses a demo location (Pasir Ris Beach, Singapore):
```
Coordinates: 1.3815°N, 103.9556°E
```

### To Enable Full Google Maps Functionality

1. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps Embed API" and "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the key to your domain

2. **Update the iframe src** in `index.html`:
   ```html
   <iframe src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=beach+cleanup+locations"></iframe>
   ```

3. **Add JavaScript API** for interactive features:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
   ```

### Fallback Map Features

When Google Maps is unavailable, the application provides:

- **Location-based cleanup events** around Singapore
- **Distance calculation** using Haversine formula
- **Interactive markers** with hover effects
- **Event filtering** and search functionality
- **Mobile-responsive** controls

### Location-Based Events

The system generates cleanup events for:
- Marina Bay Beach
- Sentosa Siloso Beach
- East Coast Park
- Changi Beach
- Pasir Ris Beach

Each event includes:
- Participant count and limits
- Duration and family-friendliness
- Distance from user location
- Priority level (high/medium)

### Troubleshooting

- **Map not loading**: Check browser console for errors
- **Location not working**: Ensure HTTPS and location permissions
- **Events not showing**: Verify JavaScript console for errors

### Development Notes

- Uses metric units (kilometers) for distances
- Includes accessibility features (ARIA labels)
- Progressive enhancement with fallback
- Mobile-first responsive design