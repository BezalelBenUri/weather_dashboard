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
- Animated wind, storm-cell, hub, alert-zone, and geographic flight-corridor layers
- Map pan/zoom, reset, animation controls, popups, and weather-layer selection
- Deep-linked forecast, alert, corridor, map, hub, report, and settings pages
- Browser back/forward support through URL hash routes
- An automatic cached-image fallback if the external map style is unavailable

The included operational weather values and animated weather cells are demonstration data. Connect a production weather API or weather-tile provider before using the dashboard for real flight decisions.

To use another MapLibre-compatible style, set `VITE_MAP_STYLE_URL` before starting or building the app.
