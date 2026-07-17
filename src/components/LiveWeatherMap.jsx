import { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers3, LocateFixed, Pause, Play, Radio } from 'lucide-react'
import fallbackMap from '../assets/nigeria-weather-map.png'
import nigeriaBoundaryUrl from '../data/Nigeria_Boundary.geojson?url'
import {
  alertZones,
  createCorridorTraffic,
  createWeatherCells,
  mapCorridors,
  mapHubs,
  nigeriaBounds,
} from '../data/mapData'

const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark'

const particleThemes = {
  Rainfall: {
    colors: ['rgba(97, 221, 255, .72)', 'rgba(96, 255, 178, .7)', 'rgba(255, 225, 94, .66)'],
    direction: -.36,
    speed: 1.22,
    turbulence: .72,
    lineWidth: 1.05,
    fade: .925,
    density: 930,
  },
  'Wind Speed': {
    colors: ['rgba(222, 246, 255, .8)', 'rgba(91, 196, 255, .78)', 'rgba(173, 135, 255, .7)'],
    direction: -.24,
    speed: 2.05,
    turbulence: .58,
    lineWidth: .9,
    fade: .94,
    density: 710,
  },
  'Cloud Cover': {
    colors: ['rgba(225, 239, 249, .42)', 'rgba(177, 211, 235, .4)', 'rgba(137, 184, 218, .34)'],
    direction: -.08,
    speed: .72,
    turbulence: 1.08,
    lineWidth: 1.35,
    fade: .91,
    density: 1320,
  },
  Visibility: {
    colors: ['rgba(118, 244, 238, .56)', 'rgba(147, 211, 255, .5)', 'rgba(221, 252, 255, .44)'],
    direction: .08,
    speed: .86,
    turbulence: .82,
    lineWidth: 1,
    fade: .915,
    density: 1120,
  },
  Temperature: {
    colors: ['rgba(255, 211, 79, .62)', 'rgba(255, 137, 55, .68)', 'rgba(255, 88, 92, .62)'],
    direction: -.52,
    speed: .94,
    turbulence: 1.22,
    lineWidth: 1.18,
    fade: .91,
    density: 1040,
  },
}

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
    .16, 'rgba(188, 255, 244, .14)',
    .36, 'rgba(58, 177, 211, .42)',
    .58, 'rgba(222, 220, 50, .62)',
    .78, 'rgba(245, 166, 35, .76)',
    1, 'rgba(237, 75, 62, .88)',
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

const factorLegends = {
  Rainfall: {
    title: 'Rainfall intensity',
    unit: 'mm/hr',
    current: '1.2 mm/hr',
    gradient: 'linear-gradient(90deg, #138962, #29be56 28%, #dcd921 52%, #ff850c 76%, #eb3127)',
    ticks: ['0', '1', '5', '20', '50+'],
    descriptors: ['Light', 'Moderate', 'Heavy'],
  },
  'Wind Speed': {
    title: 'Sustained wind speed',
    unit: 'km/h',
    current: '12 km/h NE',
    gradient: 'linear-gradient(90deg, #236fcb, #3daae6 32%, #7165dd 67%, #e05bd5)',
    ticks: ['0', '10', '20', '35', '50+'],
    descriptors: ['Calm', 'Operational', 'Strong'],
  },
  'Cloud Cover': {
    title: 'Total cloud cover',
    unit: '%',
    current: '68%',
    gradient: 'linear-gradient(90deg, #526e84, #839caf 30%, #b3c8d8 65%, #f4f9ff)',
    ticks: ['0', '25', '50', '75', '100'],
    descriptors: ['Clear', 'Broken', 'Overcast'],
  },
  Visibility: {
    title: 'Surface visibility',
    unit: 'km',
    current: '10 km',
    gradient: 'linear-gradient(90deg, #ed4b3e, #f5a623 25%, #dedc32 48%, #3ab8d3 72%, #bcfff4)',
    ticks: ['<1', '3', '5', '10', '15+'],
    descriptors: ['Restricted', 'Reduced', 'Clear'],
  },
  Temperature: {
    title: 'Air temperature',
    unit: '°C',
    current: '26°C',
    gradient: 'linear-gradient(90deg, #55b759, #ebcc27 35%, #f78317 68%, #e6392a)',
    ticks: ['18', '22', '26', '30', '35+'],
    descriptors: ['Cool', 'Warm', 'Hot'],
  },
}

function FactorLegend({ layer, value, frameLabel, compact }) {
  const legend = factorLegends[layer] || factorLegends.Rainfall
  return (
    <section className={`factor-map-legend ${compact ? 'compact' : ''}`} aria-label={`${legend.title} legend`}>
      <header>
        <div><span>{legend.title}</span><strong>{value || legend.current}</strong></div>
        <small>{frameLabel || 'Current conditions'}</small>
      </header>
      <div className="factor-legend-gradient" style={{ background: legend.gradient }} />
      <div className="factor-legend-ticks">
        {legend.ticks.map((tick) => <span key={tick}>{tick}</span>)}
      </div>
      <footer>
        {legend.descriptors.map((descriptor) => <span key={descriptor}>{descriptor}</span>)}
        <i>{legend.unit}</i>
      </footer>
    </section>
  )
}

function WeatherParticleLayer({ layer, paused, visible }) {
  const canvasRef = useRef(null)
  const pausedRef = useRef(paused)

  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visible) return undefined
    const context = canvas.getContext('2d', { alpha: true })
    const theme = particleThemes[layer] || particleThemes.Rainfall
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationFrame
    let resizeObserver
    let particles = []
    let width = 0
    let height = 0
    let previousTime = performance.now()

    const seedParticle = (particle = {}, fromEdge = false) => {
      particle.x = fromEdge ? -12 - Math.random() * width * .12 : Math.random() * width
      particle.y = Math.random() * height
      particle.age = Math.random() * 280
      particle.life = 150 + Math.random() * 230
      particle.speed = .58 + Math.random() * .9
      particle.energy = .38 + Math.random() * .62
      particle.color = theme.colors[Math.floor(Math.random() * theme.colors.length)]
      return particle
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(bounds.width))
      height = Math.max(1, Math.round(bounds.height))
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      const count = Math.max(120, Math.min(1050, Math.round((width * height) / theme.density)))
      particles = Array.from({ length: count }, () => seedParticle())
      context.clearRect(0, 0, width, height)
    }

    const animate = (time) => {
      animationFrame = window.requestAnimationFrame(animate)
      if (pausedRef.current || reduceMotion || !width || !height) {
        previousTime = time
        return
      }

      const delta = Math.min(2.1, Math.max(.45, (time - previousTime) / 16.67))
      const seconds = time * .001
      previousTime = time

      context.globalCompositeOperation = 'destination-in'
      context.fillStyle = `rgba(0, 0, 0, ${theme.fade})`
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'source-over'
      context.lineCap = 'round'

      for (const particle of particles) {
        const previousX = particle.x
        const previousY = particle.y
        const normalizedX = particle.x / Math.max(width, 1)
        const normalizedY = particle.y / Math.max(height, 1)
        const wave = Math.sin(normalizedY * 11 + seconds * .55) * .42
          + Math.cos(normalizedX * 8 - seconds * .32) * .26
          + Math.sin((normalizedX + normalizedY) * 14 + seconds * .2) * .16
        const angle = theme.direction + wave * theme.turbulence
        const velocity = theme.speed * particle.speed * delta

        particle.x += Math.cos(angle) * velocity * 2.05
        particle.y += Math.sin(angle) * velocity
        particle.age += delta

        if (particle.x < -24 || particle.x > width + 24 || particle.y < -24 || particle.y > height + 24 || particle.age > particle.life) {
          seedParticle(particle, true)
          continue
        }

        context.globalAlpha = particle.energy
        context.strokeStyle = particle.color
        context.lineWidth = theme.lineWidth * (.72 + particle.energy * .48)
        context.beginPath()
        context.moveTo(previousX, previousY)
        context.lineTo(particle.x, particle.y)
        context.stroke()
      }

      context.globalAlpha = 1
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()
    animationFrame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      context.clearRect(0, 0, width, height)
    }
  }, [layer, visible])

  if (!visible) return null
  return <canvas ref={canvasRef} className="weather-particle-canvas" aria-hidden="true" />
}

function addOperationalLayers(map, frameIndex = 0) {
  const firstLabel = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id

  map.addSource('nigeria-boundary', { type: 'geojson', data: nigeriaBoundaryUrl })
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

  map.addSource('weather-cells', { type: 'geojson', data: createWeatherCells(frameIndex * .78) })
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

  map.addSource('corridor-traffic', { type: 'geojson', data: createCorridorTraffic(0) })
  map.addLayer({
    id: 'corridor-traffic-glow',
    type: 'circle',
    source: 'corridor-traffic',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['get', 'strength'], .3, 2, 1, 10],
      'circle-color': ['match', ['get', 'status'], 'favorable', '#43d487', 'caution', '#ffd12a', '#ff5b52'],
      'circle-opacity': ['*', ['get', 'strength'], .32],
      'circle-blur': .72,
    },
  })
  map.addLayer({
    id: 'corridor-traffic-tail',
    type: 'circle',
    source: 'corridor-traffic',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['get', 'strength'], .3, 1.2, 1, 3.7],
      'circle-color': ['match', ['get', 'status'], 'favorable', '#43d487', 'caution', '#ffd12a', '#ff5b52'],
      'circle-opacity': ['*', ['get', 'strength'], .9],
    },
  })
  map.addLayer({
    id: 'corridor-traffic-head',
    type: 'circle',
    source: 'corridor-traffic',
    filter: ['==', ['get', 'head'], 1],
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3.4, 7, 5.2],
      'circle-color': ['match', ['get', 'status'], 'favorable', '#43d487', 'caution', '#ffd12a', '#ff5b52'],
      'circle-stroke-color': '#f5fbff',
      'circle-stroke-width': 1.25,
      'circle-opacity': .98,
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
  for (const id of ['corridor-glow', 'corridor-lines', 'corridor-traffic-glow', 'corridor-traffic-tail', 'corridor-traffic-head']) {
    map.setLayoutProperty(id, 'visibility', showCorridors ? 'visible' : 'none')
  }
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
  frameIndex = 0,
  factorValue,
  frameLabel,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const animationRef = useRef(null)
  const pausedRef = useRef(paused)
  const frameIndexRef = useRef(frameIndex)
  const [status, setStatus] = useState('loading')

  pausedRef.current = paused
  frameIndexRef.current = frameIndex

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
    let lastTrafficUpdate = 0
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
        addOperationalLayers(map, frameIndexRef.current)
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
            map.getSource('weather-cells')?.setData(createWeatherCells(phase + frameIndexRef.current * .78))
            const pulse = 14 + Math.sin(phase * 3.1) * 4
            map.setPaintProperty('hub-pulse', 'circle-radius', pulse)
            map.setPaintProperty('hub-pulse', 'circle-opacity', .1 + (Math.sin(phase * 3.1) + 1) * .055)
            lastUpdate = timestamp
          }
          if (!pausedRef.current && timestamp - lastTrafficUpdate > 48) {
            const routeProgress = (timestamp % 5200) / 5200
            map.getSource('corridor-traffic')?.setData(createCorridorTraffic(routeProgress))
            map.setPaintProperty('corridor-lines', 'line-opacity', .76 + Math.sin(timestamp * .006) * .16)
            map.setPaintProperty('corridor-glow', 'line-opacity', .14 + (Math.sin(timestamp * .006) + 1) * .06)
            lastTrafficUpdate = timestamp
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

  useEffect(() => {
    const map = mapRef.current
    if (status !== 'ready' || !map) return
    const strengths = [.72, .82, .94, 1.08, 1.24, 1.14, 1]
    const strength = strengths[frameIndex % strengths.length]
    map.getSource('weather-cells')?.setData(createWeatherCells(frameIndex * .78))
    map.setPaintProperty('weather-heatmap', 'heatmap-intensity', [
      'interpolate', ['linear'], ['zoom'],
      3, .78 * strength,
      7, 1.28 * strength,
    ])
  }, [frameIndex, status])

  return (
    <div className={`live-weather-map ${className} is-${status}`}>
      <img className="live-map-fallback" src={fallbackMap} alt="Nigeria weather map fallback" />
      <div ref={containerRef} className="maplibre-canvas" aria-label="Interactive weather map of Nigeria" />
      <WeatherParticleLayer layer={layer} paused={paused} visible={status === 'ready'} />
      <FactorLegend layer={layer} value={factorValue} frameLabel={frameLabel} compact={!expanded} />

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
          <div className="map-primary-controls">
            <div className="selected-layer"><Layers3 size={14} /> {layer}</div>
            <button type="button" className="motion-toggle" onClick={onToggleMotion} aria-label={paused ? 'Play factor timeline' : 'Pause factor timeline'}>
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>
          <div className="open-map-source"><Layers3 size={12} /> OPENFREEMAP · OSM</div>
        </>
      )}
    </div>
  )
}
