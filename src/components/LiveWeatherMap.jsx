import { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers3, LocateFixed, Pause, Play, Radio } from 'lucide-react'
import fallbackMap from '../assets/nigeria-weather-map.png'
import {
  alertZones,
  createWeatherCells,
  mapCorridors,
  mapHubs,
  nigeriaBoundary,
  nigeriaBounds,
} from '../data/mapData'

const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark'

const windStreaks = Array.from({ length: 24 }, (_, index) => ({
  x: (index * 17 + 8) % 94,
  y: (index * 29 + 11) % 86,
  delay: -((index * .37) % 4),
  duration: 3.2 + (index % 5) * .38,
}))

const layerPalettes = {
  Rainfall: [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(4, 27, 43, 0)',
    .16, 'rgba(18, 137, 98, .18)',
    .34, 'rgba(41, 190, 86, .58)',
    .56, 'rgba(220, 217, 33, .76)',
    .76, 'rgba(255, 133, 12, .84)',
    1, 'rgba(235, 49, 39, .94)',
  ],
  'Wind Speed': [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(3, 21, 41, 0)',
    .2, 'rgba(35, 111, 203, .16)',
    .46, 'rgba(61, 170, 230, .52)',
    .7, 'rgba(113, 101, 221, .68)',
    1, 'rgba(224, 91, 213, .82)',
  ],
  'Cloud Cover': [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(7, 26, 43, 0)',
    .24, 'rgba(115, 149, 176, .16)',
    .5, 'rgba(171, 197, 216, .44)',
    .75, 'rgba(210, 225, 237, .65)',
    1, 'rgba(244, 249, 255, .78)',
  ],
  Visibility: [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(4, 25, 43, 0)',
    .22, 'rgba(43, 114, 163, .11)',
    .52, 'rgba(58, 177, 211, .34)',
    .78, 'rgba(89, 219, 216, .48)',
    1, 'rgba(188, 255, 244, .65)',
  ],
  Temperature: [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(15, 39, 44, 0)',
    .2, 'rgba(85, 183, 89, .18)',
    .46, 'rgba(235, 204, 39, .46)',
    .7, 'rgba(247, 131, 23, .68)',
    1, 'rgba(230, 57, 42, .84)',
  ],
}

function WindOverlay({ paused, visible }) {
  if (!visible) return null
  return (
    <div className={`map-motion live-wind-overlay ${paused ? 'paused' : ''}`} aria-hidden="true">
      <div className="wind-field">
        {windStreaks.map((streak, index) => (
          <i
            key={index}
            style={{ '--x': `${streak.x}%`, '--y': `${streak.y}%`, '--delay': `${streak.delay}s`, '--duration': `${streak.duration}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function addOperationalLayers(map) {
  const firstLabel = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id

  map.addSource('nigeria-boundary', { type: 'geojson', data: nigeriaBoundary })
  map.addLayer({
    id: 'nigeria-focus',
    type: 'fill',
    source: 'nigeria-boundary',
    paint: { 'fill-color': '#0a3342', 'fill-opacity': .19 },
  }, firstLabel)
  map.addLayer({
    id: 'nigeria-outline-glow',
    type: 'line',
    source: 'nigeria-boundary',
    paint: { 'line-color': '#7ec5e6', 'line-width': 5, 'line-opacity': .18, 'line-blur': 4 },
  })
  map.addLayer({
    id: 'nigeria-outline',
    type: 'line',
    source: 'nigeria-boundary',
    paint: { 'line-color': '#d4e5ee', 'line-width': 1.8, 'line-opacity': .92 },
  })

  map.addSource('weather-cells', { type: 'geojson', data: createWeatherCells(0) })
  map.addLayer({
    id: 'weather-heatmap',
    type: 'heatmap',
    source: 'weather-cells',
    maxzoom: 9,
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, .78, 7, 1.28],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 25, 7, 48],
      'heatmap-opacity': .82,
      'heatmap-color': layerPalettes.Rainfall,
    },
  }, firstLabel)
  map.addLayer({
    id: 'weather-cores',
    type: 'circle',
    source: 'weather-cells',
    minzoom: 4,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['get', 'intensity'], 0, 2, 1, 7],
      'circle-color': ['interpolate', ['linear'], ['get', 'intensity'], 0, '#2bbd71', .6, '#e5d928', .8, '#ff8915', 1, '#ed3e35'],
      'circle-opacity': .34,
      'circle-blur': .72,
    },
  }, firstLabel)

  map.addSource('flight-corridors', { type: 'geojson', data: mapCorridors })
  map.addLayer({
    id: 'corridor-glow',
    type: 'line',
    source: 'flight-corridors',
    layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
    paint: {
      'line-color': ['match', ['get', 'status'], 'favorable', '#36c578', 'caution', '#ffc20a', '#ef4b43'],
      'line-width': 8,
      'line-opacity': .18,
      'line-blur': 5,
    },
  })
  map.addLayer({
    id: 'corridor-lines',
    type: 'line',
    source: 'flight-corridors',
    layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
    paint: {
      'line-color': ['match', ['get', 'status'], 'favorable', '#43d487', 'caution', '#ffd12a', '#ff5b52'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.8, 7, 3.4],
      'line-opacity': .92,
      'line-dasharray': [2, 2.2],
    },
  })

  map.addSource('alert-zones', { type: 'geojson', data: alertZones })
  map.addLayer({
    id: 'alert-zone-glow',
    type: 'circle',
    source: 'alert-zones',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, ['*', ['get', 'radius'], .62], 7, ['get', 'radius']],
      'circle-color': ['match', ['get', 'status'], 'unfavorable', '#ef4b43', '#ffc20a'],
      'circle-opacity': .13,
      'circle-stroke-color': ['match', ['get', 'status'], 'unfavorable', '#ff665d', '#ffd02b'],
      'circle-stroke-width': 1.5,
      'circle-stroke-opacity': .75,
    },
  })
  map.addLayer({
    id: 'alert-zone-labels',
    type: 'symbol',
    source: 'alert-zones',
    layout: {
      visibility: 'none',
      'text-field': ['get', 'title'],
      'text-font': ['Noto Sans Regular'],
      'text-size': 10,
      'text-offset': [0, 2.1],
      'text-allow-overlap': false,
    },
    paint: { 'text-color': '#f7e8bd', 'text-halo-color': '#061522', 'text-halo-width': 1.2 },
  })

  map.addSource('operational-hubs', { type: 'geojson', data: mapHubs })
  map.addLayer({
    id: 'hub-pulse',
    type: 'circle',
    source: 'operational-hubs',
    paint: {
      'circle-radius': 15,
      'circle-color': ['match', ['get', 'status'], 'favorable', '#3094ff', 'caution', '#ffc20a', '#ef4b43'],
      'circle-opacity': .16,
      'circle-blur': .18,
    },
  })
  map.addLayer({
    id: 'hub-markers',
    type: 'circle',
    source: 'operational-hubs',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 5.5, 7, 8],
      'circle-color': ['match', ['get', 'status'], 'favorable', '#277df0', 'caution', '#d99c00', '#d84038'],
      'circle-stroke-color': '#ecf6ff',
      'circle-stroke-width': 1.6,
      'circle-opacity': .96,
    },
  })
  map.addLayer({
    id: 'hub-labels',
    type: 'symbol',
    source: 'operational-hubs',
    layout: {
      'text-field': ['get', 'shortName'],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 4, 9, 7, 11],
      'text-offset': [0, 1.35],
      'text-anchor': 'top',
      'text-allow-overlap': false,
    },
    paint: { 'text-color': '#eef7ff', 'text-halo-color': '#051522', 'text-halo-width': 1.5 },
  })
}

function setLayerVisibility(map, mode) {
  if (!map.getLayer('corridor-lines')) return
  const showCorridors = mode === 'corridors' || mode === 'weather'
  const showAlerts = mode === 'alerts'
  for (const id of ['corridor-glow', 'corridor-lines']) map.setLayoutProperty(id, 'visibility', showCorridors ? 'visible' : 'none')
  for (const id of ['alert-zone-glow', 'alert-zone-labels']) map.setLayoutProperty(id, 'visibility', showAlerts ? 'visible' : 'none')
}

function setWeatherPalette(map, layer) {
  if (!map.getLayer('weather-heatmap')) return
  map.setPaintProperty('weather-heatmap', 'heatmap-color', layerPalettes[layer] || layerPalettes.Rainfall)
  map.setPaintProperty('weather-heatmap', 'heatmap-opacity', layer === 'Visibility' ? .44 : layer === 'Cloud Cover' ? .58 : .82)
  map.setLayoutProperty('weather-cores', 'visibility', layer === 'Rainfall' || layer === 'Temperature' ? 'visible' : 'none')
}

export default function LiveWeatherMap({
  mode = 'overview',
  layer = 'Rainfall',
  expanded = false,
  interactive = true,
  paused = false,
  onToggleMotion,
  className = '',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const animationRef = useRef(null)
  const pausedRef = useRef(paused)
  const [status, setStatus] = useState('loading')

  pausedRef.current = paused

  const fitNigeria = useCallback((animated = true) => {
    mapRef.current?.fitBounds(nigeriaBounds, {
      padding: expanded ? 44 : 20,
      duration: animated ? 650 : 0,
      maxZoom: expanded ? 5.9 : 5.55,
    })
  }, [expanded])

  useEffect(() => {
    if (!containerRef.current) return undefined

    let resizeObserver
    let loadTimer
    let lastUpdate = 0
    let phase = 0
    let initialized = false

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: import.meta.env.VITE_MAP_STYLE_URL || OPEN_FREE_MAP_STYLE,
        center: [8.4, 9.1],
        zoom: 5.05,
        minZoom: 3.5,
        maxZoom: 11,
        maxPitch: 55,
        attributionControl: true,
        interactive,
        dragRotate: false,
        pitchWithRotate: false,
        fadeDuration: 180,
      })

      mapRef.current = map

      map.on('styleimagemissing', ({ id }) => {
        if (map.hasImage(id)) return
        const size = 16
        const pixels = new Uint8Array(size * size * 4)
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            if (Math.hypot(x - 7.5, y - 7.5) > 4.5) continue
            const offset = (y * size + x) * 4
            pixels[offset] = 173
            pixels[offset + 1] = 190
            pixels[offset + 2] = 198
            pixels[offset + 3] = 180
          }
        }
        map.addImage(id, { width: size, height: size, data: pixels })
      })

      if (interactive) {
        map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right')
      }

      loadTimer = window.setTimeout(() => {
        if (!initialized) setStatus('fallback')
      }, 12000)

      map.once('style.load', () => {
        if (initialized) return
        initialized = true
        window.clearTimeout(loadTimer)
        addOperationalLayers(map)
        setLayerVisibility(map, mode)
        setWeatherPalette(map, layer)
        fitNigeria(false)
        setStatus('ready')

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 12, className: 'weather-map-popup' })

        map.on('mouseenter', 'hub-markers', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'hub-markers', () => { map.getCanvas().style.cursor = '' })
        map.on('click', 'hub-markers', (event) => {
          const feature = event.features?.[0]
          if (!feature) return
          const properties = feature.properties
          popup
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`<div class="map-popup-content"><span>OPERATIONAL HUB</span><strong>${properties.name}</strong><p>${properties.temperature} · ${properties.weather}</p><i class="${properties.status}">${properties.status}</i></div>`)
            .addTo(map)
        })

        map.on('mouseenter', 'corridor-lines', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'corridor-lines', () => { map.getCanvas().style.cursor = '' })
        map.on('click', 'corridor-lines', (event) => {
          const feature = event.features?.[0]
          if (!feature) return
          popup
            .setLngLat(event.lngLat)
            .setHTML(`<div class="map-popup-content"><span>FLIGHT CORRIDOR</span><strong>${feature.properties.code}</strong><p>${feature.properties.label}</p><i class="${feature.properties.status}">${feature.properties.risk}% risk</i></div>`)
            .addTo(map)
        })

        const animate = (timestamp) => {
          if (!pausedRef.current && timestamp - lastUpdate > 160) {
            phase += .045
            map.getSource('weather-cells')?.setData(createWeatherCells(phase))
            const pulse = 14 + Math.sin(phase * 3.1) * 4
            map.setPaintProperty('hub-pulse', 'circle-radius', pulse)
            map.setPaintProperty('hub-pulse', 'circle-opacity', .1 + (Math.sin(phase * 3.1) + 1) * .055)
            lastUpdate = timestamp
          }
          animationRef.current = window.requestAnimationFrame(animate)
        }
        animationRef.current = window.requestAnimationFrame(animate)
      })

      map.on('error', (event) => {
        console.warn('[LiveWeatherMap]', event.error?.message || 'Map resource failed to load')
        if (!map.isStyleLoaded()) setStatus((current) => current === 'ready' ? current : 'loading')
      })

      resizeObserver = new ResizeObserver(() => map.resize())
      resizeObserver.observe(containerRef.current)
    } catch {
      setStatus('fallback')
    }

    return () => {
      window.clearTimeout(loadTimer)
      window.cancelAnimationFrame(animationRef.current)
      resizeObserver?.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [interactive])

  useEffect(() => {
    const map = mapRef.current
    if (status !== 'ready' || !map) return
    setLayerVisibility(map, mode)
  }, [mode, status])

  useEffect(() => {
    const map = mapRef.current
    if (status !== 'ready' || !map) return
    setWeatherPalette(map, layer)
  }, [layer, status])

  return (
    <div className={`live-weather-map ${className} is-${status}`}>
      <img className="live-map-fallback" src={fallbackMap} alt="Nigeria weather map fallback" />
      <div ref={containerRef} className="maplibre-canvas" aria-label="Interactive weather map of Nigeria" />
      <WindOverlay paused={paused} visible={layer === 'Wind Speed' || mode === 'overview'} />

      {status === 'loading' && <div className="map-loading"><i /><span>Loading live basemap</span></div>}
      {status === 'fallback' && <div className="map-fallback-notice"><span>Map temporarily offline</span><small>Showing cached weather view</small></div>}

      {interactive && (
        <button type="button" className="live-map-home" onClick={() => fitNigeria()} title="Reset to Nigeria" aria-label="Reset map to Nigeria">
          <LocateFixed size={16} />
        </button>
      )}

      {expanded && (
        <>
          <div className="map-live-chip"><Radio size={13} /> INTERACTIVE MAP</div>
          <button type="button" className="motion-toggle" onClick={onToggleMotion} aria-label={paused ? 'Play weather animation' : 'Pause weather animation'}>
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <div className="open-map-source"><Layers3 size={12} /> OPENFREEMAP · OSM</div>
        </>
      )}
    </div>
  )
}
