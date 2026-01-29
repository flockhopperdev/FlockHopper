# FlockHopper

A privacy-focused route planning application that helps users navigate while minimizing exposure to Automatic License Plate Reader (ALPR) cameras across the United States.

## About

FlockHopper empowers drivers, cyclists, and pedestrians to maintain their privacy by planning routes that avoid surveillance networks operated by law enforcement and private companies. The application visualizes ALPR camera locations and calculates alternative routes that minimize camera exposure.

## Features

- **Camera-Aware Routing**: Plan routes that actively avoid or minimize exposure to ALPR cameras
- **Interactive Map**: Visualize 62,000+ ALPR camera locations across the US
- **Multiple Travel Modes**: Support for car, bicycle, and pedestrian routing
- **Route Comparison**: Compare standard routes vs privacy-optimized alternatives
- **Custom Waypoints**: Add intermediate stops to your route
- **GPX Export**: Export routes for use in GPS devices and navigation apps
- **Privacy-First Design**: All data processing happens locally; no tracking or analytics

## Prerequisites

- [Node.js](https://nodejs.org/) 18.0 or higher
- [Java](https://adoptium.net/) 11 or higher (for GraphHopper)
- 32GB RAM recommended (for full US routing data)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flockhopperdev/FlockHopper.git
   cd flockhopper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Set up GraphHopper routing server**

   See [graphhopper/README.md](./graphhopper/README.md) for detailed instructions on setting up the routing backend.

   Quick start:
   ```bash
   cd graphhopper

   # Download GraphHopper
   wget https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/9.1/graphhopper-web-9.1.jar

   # Download OSM data (Ohio for testing, ~300MB)
   wget https://download.geofabrik.de/north-america/us/ohio-latest.osm.pbf

   # Update config.yml to use ohio-latest.osm.pbf
   # Then start the server
   ./start.sh
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

## Usage

1. Open the application in your browser
2. Enter your starting point and destination
3. View the suggested route and camera exposure analysis
4. Toggle between standard routing and privacy-optimized routing
5. Add waypoints if needed
6. Export your route as GPX for navigation

## Project Structure

```
flockhopper/
├── src/
│   ├── components/     # React UI components
│   │   ├── landing/    # Landing page components
│   │   ├── map/        # Map visualization
│   │   ├── panels/     # Route control panels
│   │   └── ui/         # Generic UI components
│   ├── pages/          # Page-level routes
│   ├── services/       # API and data services
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
├── public/
│   ├── cameras-us.json # ALPR camera database
│   └── zipcodes-us.json
├── graphhopper/        # Routing server setup
└── ...
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL, Leaflet
- **Routing Engine**: GraphHopper
- **Geospatial**: Turf.js

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Configuration

Environment variables (set in `.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GRAPHHOPPER_ENDPOINT` | GraphHopper API URL | `http://localhost:8989` |

## Data Sources

- **Camera Data**: Compiled from public records, FOIA requests, and community contributions
- **Map Data**: OpenStreetMap via GraphHopper
- **Geocoding**: Photon (OpenStreetMap-based)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Disclaimer

FlockHopper is provided for educational and privacy advocacy purposes. Camera location data may not be complete or up-to-date. Users are responsible for complying with all applicable laws while using this software.
