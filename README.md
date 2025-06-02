# 🌊 ShoreSquad - Beach Cleanup Community

Rally your crew, track weather, and hit the next beach cleanup with our dope map app!

## 🚀 Project Overview

ShoreSquad is a modern web application designed to mobilize young people to clean beaches by combining cutting-edge technology with social connection. Our platform makes it easy to find cleanup events, check weather conditions, rally friends, and track environmental impact.

## 🎯 Key Features

- **🗺️ Interactive Maps**: Find beach cleanup events near you with smart filtering
- **☀️ Weather Tracking**: Real-time weather updates for perfect cleanup planning
- **👥 Squad Building**: Connect with like-minded people and form cleanup crews
- **📊 Impact Tracking**: Monitor your environmental impact with detailed statistics
- **📱 Mobile-First Design**: Optimized for mobile devices with responsive design
- **♿ Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support

## 🎨 Design System

### Color Palette
- **Ocean Blue**: `#0077be` - Primary brand color representing the sea
- **Light Ocean Blue**: `#4a90e2` - Secondary blue for gradients
- **Coral Orange**: `#ff6b6b` - Energy and youth, call-to-action buttons
- **Environmental Green**: `#2ecc71` - Sustainability and success states
- **Sandy Beige**: `#f4e4bc` - Beach vibes and warm backgrounds
- **Clean White**: `#ffffff` - Modern, clean interface

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300 (Light), 400 (Normal), 500 (Medium), 600 (Semibold), 700 (Bold)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Variables, Flexbox, Grid
- **Icons**: Font Awesome 6
- **Development**: Live Server for local development
- **Version Control**: Git

## 🚀 Quick Start

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension (recommended)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/shoresquad.git
   cd shoresquad
   ```

2. **Open with Live Server**
   - Open the project in VS Code
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - Or use the "Go Live" button in the status bar

3. **Alternative: Direct browser opening**
   - Simply open `index.html` in your web browser
   - Note: Some features may require a server environment

### Development Scripts

If you have Node.js installed, you can use these npm scripts:

```bash
# Install dependencies (optional)
npm install

# Start development server
npm run start

# Development with file watching
npm run dev

# Lint JavaScript
npm run lint

# Format code
npm run format

# Validate HTML
npm run validate
```

## 📁 Project Structure

```
shoresquad/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── app.js             # Main JavaScript application
├── .vscode/
│   └── settings.json      # VS Code Live Server configuration
├── .gitignore             # Git ignore file
├── package.json           # Project configuration
└── README.md             # This file
```

## 🎨 Features Overview

### Navigation
- Fixed navigation with smooth scrolling
- Mobile-responsive hamburger menu
- Accessibility-focused keyboard navigation

### Hero Section
- Animated wave background
- Clear call-to-action buttons
- Responsive typography

### Interactive Map
- Cleanup event discovery
- Location-based filtering
- Event details and join functionality

### Weather Integration
- Current weather display
- 5-day forecast
- Location-based weather data

### Community Features
- Real-time statistics
- Activity feed
- Social engagement elements

### About Section
- Mission statement
- Team information
- Contact forms

## 🔧 Customization

### Colors
Modify CSS custom properties in `css/styles.css`:
```css
:root {
  --color-primary: #0077be;
  --color-secondary: #ff6b6b;
  /* ... other colors */
}
```

### Content
- Update text content in `index.html`
- Modify mock data in `js/app.js`
- Replace placeholder images with actual photos

### Features
- Add real API integrations for weather and maps
- Implement user authentication
- Add database connectivity for events and users

## 🌐 API Integration

The application is designed to work with external APIs:

### Weather API
- Replace `your_weather_api_key_here` in `js/app.js`
- Recommended: OpenWeatherMap, WeatherAPI

### Maps API
- Replace `your_map_api_key_here` in `js/app.js`
- Recommended: Google Maps, Mapbox

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences
- Focus indicators
- Minimum touch target sizes (44px)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 TODO / Roadmap

- [ ] Integrate real weather API
- [ ] Add Google Maps or Mapbox integration
- [ ] Implement user authentication
- [ ] Add database for events and users
- [ ] Create mobile app version
- [ ] Add push notifications
- [ ] Implement offline functionality (PWA)
- [ ] Add social media sharing
- [ ] Create admin dashboard
- [ ] Add payment integration for donations

## 🐛 Known Issues

- Weather data is currently mocked
- Map functionality uses placeholder content
- Events are stored in local state (not persistent)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

ShoreSquad Team - Making beach cleanups fun, social, and impactful!

## 📞 Contact

- Email: hello@shoresquad.com
- Website: [shoresquad.com](https://shoresquad.com)
- Social: @ShoreSquad

---

**Made with 💙 for our oceans** 🌊

*Join the movement to make beach cleanups the coolest way to spend your weekend!*
