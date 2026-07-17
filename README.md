# Zipline Nigeria Weather Intelligence

Responsive React dashboard recreated from the supplied 1610×977 reference image.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

The interface includes:

- Reference-matched desktop layout plus compact-height laptop mode
- Tablet and mobile layouts
- A real, interactive [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) vector map
- Free [OpenFreeMap](https://openfreemap.org/) tiles with OpenStreetMap attribution and no API key
- Windy-style particle animation for rainfall, wind, cloud cover, visibility, and temperature
- Animated storm cells, hubs, alert zones, and moving traffic along geographic flight corridors
- High-resolution Nigeria boundary rendering from the supplied CRS84 GeoJSON
- Map pan/zoom, reset, animation controls, popups, and weather-layer selection
- Adaptive factor legends plus a playable, pausable, and scrubbable 10-minute weather timeline
- Deep-linked forecast, alert, corridor, map, hub, report, and settings pages
- Browser back/forward support through URL hash routes
- An automatic cached-image fallback if the external map style is unavailable

The included operational weather values and animated weather cells are demonstration data. Connect a production weather API or weather-tile provider before using the dashboard for real flight decisions.

To use another MapLibre-compatible style, set `VITE_MAP_STYLE_URL` before starting or building the app.
