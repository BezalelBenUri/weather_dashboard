import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import {
  Bell,
  CalendarDays,
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  FileText,
  Gauge,
  Home,
  Map as MapIcon,
  MapPin,
  Plane,
  Settings,
  SlidersHorizontal,
  Thermometer,
  Wind,
} from 'lucide-react'
import mapReference from './assets/nigeria-weather-map.png'
import './styles.css'

const navItems = [
  { label: 'Overview', icon: Home },
  { label: 'Weather Map', icon: MapIcon },
  { label: 'Forecast', icon: CalendarDays },
  { label: 'Alerts', icon: Bell },
  { label: 'Flight Corridors', icon: SlidersHorizontal },
  { label: 'Airports & Hubs', icon: MapPin },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
]

const alerts = [
  { title: 'Moderate Rainfall', place: 'Kaduna, Kano, Jigawa', time: 'Until 14:00 WAT', level: 'caution' },
  { title: 'Strong Winds', place: 'Borno, Yobe', time: 'Until 16:00 WAT', level: 'warning' },
  { title: 'Thunderstorms', place: 'Cross River, Akwa Ibom', time: 'Until 13:00 WAT', level: 'caution' },
]

const forecasts = [
  { day: 'Thu, 8 May', type: 'rain', temperature: '24°C / 31°C', text: 'Light Rain', level: 'caution' },
  { day: 'Fri, 9 May', type: 'cloudy', temperature: '23°C / 30°C', text: 'Cloudy', level: 'favorable' },
  { day: 'Sat, 10 May', type: 'partly', temperature: '24°C / 32°C', text: 'Partly Cloudy', level: 'favorable' },
  { day: 'Sun, 11 May', type: 'rain', temperature: '24°C / 30°C', text: 'Light Rain', level: 'caution' },
]

const parameters = [
  { label: 'Wind Speed', value: '12 km/h NE', icon: Wind },
  { label: 'Wind Gust', value: '24 km/h', icon: Wind },
  { label: 'Precipitation', value: '1.2 mm/hr', icon: CloudRain },
  { label: 'Cloud Cover', value: '68%', icon: Cloud },
  { label: 'Visibility', value: '10 km', icon: Eye },
  { label: 'Temperature', value: '26°C', icon: Thermometer },
  { label: 'Dew Point', value: '22°C', icon: Droplets },
]

const hubs = [
  { name: 'Kaduna Hub', type: 'rain', temperature: '24°C', weather: 'Light Rain', wind: '10 km/h NE', visibility: '10 km', status: 'favorable' },
  { name: 'Bayelsa Hub', type: 'cloudy', temperature: '26°C', weather: 'Cloudy', wind: '8 km/h SE', visibility: '10 km', status: 'favorable' },
  { name: 'Cross River Hub', type: 'storm', temperature: '25°C', weather: 'Thunderstorms', wind: '18 km/h E', visibility: '8 km', status: 'caution' },
  { name: 'Kano (Potential)', type: 'rain', temperature: '23°C', weather: 'Moderate Rain', wind: '15 km/h NE', visibility: '9 km', status: 'caution' },
  { name: 'Maiduguri (Potential)', type: 'storm', temperature: '22°C', weather: 'Strong Winds', wind: '28 km/h NE', visibility: '6 km', status: 'unfavorable' },
]

function BrandMark({ compact = false }) {
  return (
    <div className={`brand-mark ${compact ? 'compact' : ''}`} aria-label="Zipline">
      {!compact && (
        <svg viewBox="0 0 66 44" aria-hidden="true">
          <path d="M4 3.8h55.8L48.7 15.5H17.5z" fill="url(#logoFill)" />
          <path d="M18.5 17.8h23.2L29.1 29.4l-6.9-6.1 7.1-.1z" fill="url(#logoFill)" />
          <path d="M32.1 30.4l9.2-8.3 12.1 17.3-12.6-7.5-8.7 8.1z" fill="url(#logoFill)" />
          <path d="M13 32.5l7.3-6.2 5.7 5.1-8.1 7.1z" fill="url(#logoFill)" />
          <defs>
            <linearGradient id="logoFill" x1="33" y1="3" x2="33" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f8fbff" />
              <stop offset="1" stopColor="#bac8d9" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {compact ? <span>zipline</span> : null}
    </div>
  )
}

function WeatherIcon({ type = 'cloudy', size = 54 }) {
  const showRain = type === 'rain' || type === 'storm'
  const showSun = type === 'partly'
  const showBolt = type === 'storm'
  return (
    <svg className="weather-glyph" width={size} height={Math.round(size * 0.72)} viewBox="0 0 76 55" aria-hidden="true">
      <defs>
        <linearGradient id="cloudFill" x1="38" y1="8" x2="38" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#edf6ff" />
          <stop offset=".45" stopColor="#c8daec" />
          <stop offset="1" stopColor="#8ea9c4" />
        </linearGradient>
        <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#68bdff" />
          <stop offset="1" stopColor="#1678df" />
        </linearGradient>
      </defs>
      {showSun && (
        <g className="sun-rays" stroke="#ffbd00" strokeWidth="3" strokeLinecap="round">
          <circle cx="43" cy="19" r="10" fill="#ffbd00" stroke="none" />
          <path d="M43 2v5M43 31v5M26 19h5M55 19h5M31 7l4 4M51 27l4 4M55 7l-4 4" />
        </g>
      )}
      <path d="M19 42h38c9.4 0 16-5.2 16-12.7 0-7.1-6-12.2-13.5-12.7C56.7 8.8 49.7 4 41.1 4 31.5 4 23.5 10.2 21 19c-1.1-.2-2.3-.3-3.5-.3C8.4 18.7 2 23.9 2 30.8 2 37.5 8.9 42 19 42Z" fill="url(#cloudFill)" />
      {showRain && (
        <g stroke="url(#rainFill)" strokeWidth="4" strokeLinecap="round">
          <path d="M22 47l-3 5" /><path d="M39 47l-3 5" /><path d="M56 47l-3 5" />
        </g>
      )}
      {showBolt && <path d="M47 34h12l-8 10h7L43 55l4-12h-6z" fill="#ffc400" stroke="#ff9d00" strokeWidth=".6" />}
    </svg>
  )
}

function StatusBadge({ level, children }) {
  return <span className={`status-badge ${level}`}>{children || level}</span>
}

function Card({ className = '', children }) {
  return <section className={`card ${className}`}>{children}</section>
}

function CardHeading({ title, subtitle, action }) {
  return (
    <header className="card-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <button type="button" className="text-action">{action}</button>}
    </header>
  )
}

function Donut({ value, label, variant = 'favorable' }) {
  return (
    <div className={`donut ${variant}`} style={{ '--value': `${value * 3.6}deg` }}>
      <div className="donut-center">
        <strong>{value}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="topbar">
      <div className="product-brand">
        <BrandMark />
        <div>
          <h1>ZIPLINE NIGERIA <i /> <span>WEATHER INTELLIGENCE</span></h1>
          <p>Real-time Weather Monitoring &amp; Forecasting for Drone Operations</p>
        </div>
      </div>
      <div className="topbar-meta">
        <div className="meta-block source">
          <span>DATA SOURCE</span>
          <strong>Open-Meteo, NOAA, ECMWF</strong>
        </div>
        <div className="meta-block updated">
          <span>LAST UPDATED</span>
          <strong>8 May 2025, 10:30 WAT</strong>
        </div>
        <div className="meta-block system">
          <span>€ SYSTEM STATUS</span>
          <strong className="operational"><i /> OPERATIONAL</strong>
        </div>
        <div className="mapbox-brand" aria-label="Mapbox">
          <span className="mapbox-pin">◆</span>
          <strong>mapbox</strong>
        </div>
      </div>
    </header>
  )
}

function Sidebar() {
  const [active, setActive] = useState('Overview')
  return (
    <aside className="sidebar">
      <nav aria-label="Dashboard navigation">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            type="button"
            className={`nav-item ${active === label ? 'active' : ''}`}
            onClick={() => setActive(label)}
            key={label}
            aria-current={active === label ? 'page' : undefined}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <BrandMark compact />
    </aside>
  )
}

function WeatherOverview() {
  return (
    <Card className="weather-overview">
      <CardHeading title="WEATHER OVERVIEW" subtitle="Nigeria Summary" />
      <div className="overview-main">
        <WeatherIcon type="rain" size={72} />
        <div className="temperature-block">
          <strong>26°C</strong>
          <span>Light Rain</span>
        </div>
      </div>
      <div className="overview-metrics">
        <div><span>Feels like</span><strong>28°C</strong></div>
        <div><span>Humidity</span><strong>78%</strong></div>
        <div><span>Wind</span><strong>12 km/h NE</strong></div>
        <div><span>Visibility</span><strong>10 km</strong></div>
      </div>
    </Card>
  )
}

function OperationalImpact() {
  return (
    <Card className="operational-impact">
      <CardHeading title="OPERATIONAL IMPACT" subtitle="Current Conditions" />
      <div className="impact-content">
        <Donut value={86} label="Favorable" />
        <div className="impact-legend">
          <div><i className="legend-dot green" /><strong>86%</strong><span>Favorable</span></div>
          <div><i className="legend-dot yellow" /><strong>10%</strong><span>Caution</span></div>
          <div><i className="legend-dot red" /><strong>4%</strong><span>Unfavorable</span></div>
        </div>
      </div>
    </Card>
  )
}

function ActiveAlerts() {
  return (
    <Card className="active-alerts">
      <CardHeading title="ACTIVE ALERTS" subtitle="Nigeria" action="View all" />
      <div className="alert-list">
        {alerts.map((alert) => (
          <div className="alert-row" key={alert.title}>
            <span className={`warning-symbol ${alert.level}`}>!</span>
            <div className="alert-copy">
              <strong>{alert.title}</strong>
              <span>{alert.place}</span>
              <small>{alert.time}</small>
            </div>
            <StatusBadge level={alert.level} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function MapPanel() {
  return (
    <section className="map-panel" aria-label="Live weather map of Nigeria">
      <img src={mapReference} alt="Weather radar over Nigeria with rainfall and wind speed layers" />
      <div className="map-hit-controls" aria-hidden="true">
        <button type="button" title="Zoom in">+</button>
        <button type="button" title="Zoom out">−</button>
      </div>
    </section>
  )
}

function Forecast() {
  return (
    <Card className="forecast-card">
      <CardHeading title="WEATHER FORECAST" subtitle="Next 48 Hours" action="View full forecast" />
      <div className="forecast-list">
        {forecasts.map((item) => (
          <div className="forecast-row" key={item.day}>
            <strong className="forecast-day">{item.day}</strong>
            <WeatherIcon type={item.type} size={44} />
            <div className="forecast-detail">
              <strong>{item.temperature}</strong>
              <span>{item.text}</span>
            </div>
            <StatusBadge level={item.level} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function WeatherParameters() {
  return (
    <Card className="parameters-card">
      <CardHeading title="WEATHER PARAMETERS" subtitle="Nigeria (Live)" />
      <div className="parameter-list">
        {parameters.map(({ label, value, icon: Icon }) => (
          <div className="parameter-row" key={label}>
            <Icon size={17} strokeWidth={1.55} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}

function HubStatus() {
  return (
    <Card className="hub-status">
      <CardHeading title="HUB WEATHER STATUS" subtitle="Real-time" />
      <div className="hub-grid">
        {hubs.map((hub) => (
          <article className="hub-card" key={hub.name}>
            <div className="hub-name-row">
              <strong>{hub.name}</strong><span>•</span>
              <StatusBadge level={hub.status} />
            </div>
            <div className="hub-weather">
              <WeatherIcon type={hub.type} size={58} />
              <div><strong>{hub.temperature}</strong><span>{hub.weather}</span></div>
            </div>
            <div className="hub-metrics">
              <span><Wind size={15} />{hub.wind}</span>
              <span><Eye size={15} />{hub.visibility}</span>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}

function CorridorRisk() {
  return (
    <Card className="corridor-risk">
      <CardHeading title="FLIGHT CORRIDOR RISK" subtitle="Current Conditions" action="View all" />
      <div className="risk-content">
        <Donut value={72} label="Low Risk" variant="risk" />
        <div className="risk-legend">
          <div><i className="legend-dot green" /><strong>72%</strong><span>Low</span></div>
          <div><i className="legend-dot yellow" /><strong>20%</strong><span>Moderate</span></div>
          <div><i className="legend-dot red" /><strong>8%</strong><span>High</span></div>
        </div>
      </div>
    </Card>
  )
}

function App() {
  return (
    <div className="app-frame">
      <Header />
      <div className="app-shell">
        <Sidebar />
        <main className="dashboard">
          <div className="left-stack">
            <WeatherOverview />
            <OperationalImpact />
            <ActiveAlerts />
          </div>
          <MapPanel />
          <div className="right-stack">
            <Forecast />
            <WeatherParameters />
          </div>
          <HubStatus />
          <CorridorRisk />
        </main>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
