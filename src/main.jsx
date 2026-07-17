import React, { lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  Clock3,
  Droplets,
  Eye,
  FileText,
  Gauge,
  Home,
  Layers3,
  Map as MapIcon,
  MapPin,
  Navigation,
  Pause,
  Plane,
  Play,
  Route,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react'
import mapReference from './assets/nigeria-weather-map.png'
import './styles.css'

const LiveWeatherMap = lazy(() => import('./components/LiveWeatherMap'))

const navItems = [
  { label: 'Overview', page: 'overview', icon: Home },
  { label: 'Weather Map', page: 'map', icon: MapIcon },
  { label: 'Forecast', page: 'forecast', icon: CalendarDays },
  { label: 'Alerts', page: 'alerts', icon: Bell },
  { label: 'Flight Corridors', page: 'corridors', icon: SlidersHorizontal },
  { label: 'Airports & Hubs', page: 'hubs', icon: MapPin },
  { label: 'Reports', page: 'reports', icon: FileText },
  { label: 'Settings', page: 'settings', icon: Settings },
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

const hourlyForecast = [
  { time: 'Now', type: 'rain', temp: '26°C', rain: '68%', wind: '12 km/h' },
  { time: '12 PM', type: 'rain', temp: '27°C', rain: '72%', wind: '14 km/h' },
  { time: '2 PM', type: 'storm', temp: '25°C', rain: '84%', wind: '19 km/h' },
  { time: '4 PM', type: 'storm', temp: '24°C', rain: '78%', wind: '22 km/h' },
  { time: '6 PM', type: 'rain', temp: '24°C', rain: '61%', wind: '16 km/h' },
  { time: '8 PM', type: 'cloudy', temp: '23°C', rain: '32%', wind: '10 km/h' },
  { time: '10 PM', type: 'cloudy', temp: '23°C', rain: '18%', wind: '8 km/h' },
  { time: '12 AM', type: 'partly', temp: '22°C', rain: '12%', wind: '7 km/h' },
]

const extendedForecast = [
  ...forecasts,
  { day: 'Mon, 12 May', type: 'storm', temperature: '23°C / 29°C', text: 'Thunderstorms', level: 'caution' },
  { day: 'Tue, 13 May', type: 'partly', temperature: '24°C / 32°C', text: 'Partly Cloudy', level: 'favorable' },
  { day: 'Wed, 14 May', type: 'cloudy', temperature: '24°C / 31°C', text: 'Cloudy', level: 'favorable' },
]

const alertDetails = [
  { ...alerts[0], area: 'North Central', impact: 'Reduced visibility below 8 km', action: 'Allow +6 min route buffer', affected: '3 hubs' },
  { ...alerts[1], area: 'North East', impact: 'Crosswinds above flight threshold', action: 'Hold Borno corridor departures', affected: '2 corridors' },
  { ...alerts[2], area: 'South South', impact: 'Convective cells moving south-west', action: 'Use coastal alternate route', affected: '2 hubs' },
  { title: 'Low Cloud Ceiling', place: 'Plateau, Bauchi', time: 'Until 18:30 WAT', level: 'caution', area: 'Central', impact: 'Cloud base near 900 m AGL', action: 'Maintain low-altitude protocol', affected: '1 corridor' },
  { title: 'Conditions Improving', place: 'Lagos, Ogun', time: 'Updated 10:20 WAT', level: 'favorable', area: 'South West', impact: 'Visibility restored above 10 km', action: 'Normal operations approved', affected: '2 hubs' },
]

const corridors = [
  { code: 'KAD–ABV', from: 'Kaduna Hub', to: 'Abuja', risk: 18, level: 'favorable', weather: 'Light rain', wind: '12 km/h NE', eta: '42 min' },
  { code: 'BYL–CBR', from: 'Bayelsa Hub', to: 'Calabar', risk: 42, level: 'caution', weather: 'Rain cells', wind: '18 km/h E', eta: '56 min' },
  { code: 'KAN–MDG', from: 'Kano', to: 'Maiduguri', risk: 74, level: 'unfavorable', weather: 'Strong winds', wind: '28 km/h NE', eta: 'On hold' },
  { code: 'LOS–IBD', from: 'Lagos', to: 'Ibadan', risk: 12, level: 'favorable', weather: 'Cloudy', wind: '8 km/h SE', eta: '31 min' },
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

function CardHeading({ title, subtitle, action, onAction }) {
  return (
    <header className="card-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <button type="button" className="text-action" onClick={onAction}>{action}</button>}
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
          <strong>OpenFreeMap, Open-Meteo</strong>
        </div>
        <div className="meta-block updated">
          <span>LAST UPDATED</span>
          <strong>8 May 2025, 10:30 WAT</strong>
        </div>
        <div className="meta-block system">
          <span>€ SYSTEM STATUS</span>
          <strong className="operational"><i /> OPERATIONAL</strong>
        </div>
        <div className="mapbox-brand" aria-label="MapLibre">
          <span className="mapbox-pin">◆</span>
          <strong>maplibre</strong>
        </div>
      </div>
    </header>
  )
}

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav aria-label="Dashboard navigation">
        {navItems.map(({ label, page, icon: Icon }) => (
          <button
            type="button"
            className={`nav-item ${activePage === page ? 'active' : ''}`}
            onClick={() => onNavigate(page)}
            key={label}
            aria-current={activePage === page ? 'page' : undefined}
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

function ActiveAlerts({ onOpen }) {
  return (
    <Card className="active-alerts">
      <CardHeading title="ACTIVE ALERTS" subtitle="Nigeria" action="View all" onAction={onOpen} />
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

function MapPanel({ expanded = false, paused = false, onToggleMotion, mode = 'overview', layer = 'Rainfall', interactive = true }) {
  return (
    <section className={`map-panel ${expanded ? 'expanded' : ''}`} aria-label="Live weather map of Nigeria">
      <Suspense fallback={<img className="map-panel-fallback" src={mapReference} alt="Loading interactive map of Nigeria" />}>
        <LiveWeatherMap mode={mode} layer={layer} expanded={expanded} paused={paused} onToggleMotion={onToggleMotion} interactive={interactive} />
      </Suspense>
    </section>
  )
}

function Forecast({ onOpen }) {
  return (
    <Card className="forecast-card">
      <CardHeading title="WEATHER FORECAST" subtitle="Next 48 Hours" action="View full forecast" onAction={onOpen} />
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

function CorridorRisk({ onOpen }) {
  return (
    <Card className="corridor-risk">
      <CardHeading title="FLIGHT CORRIDOR RISK" subtitle="Current Conditions" action="View all" onAction={onOpen} />
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

function PageFrame({ eyebrow, title, description, onBack, children }) {
  return (
    <main className="detail-page page-enter">
      <header className="detail-header">
        <div className="detail-title-wrap">
          <button type="button" className="page-back" onClick={onBack} aria-label="Back to overview">
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="page-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="detail-live"><i /> LIVE · UPDATED 10:30 WAT</div>
      </header>
      <div className="detail-body">{children}</div>
    </main>
  )
}

function KpiCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <span className="kpi-icon"><Icon size={18} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  )
}

function ForecastPage({ onBack }) {
  return (
    <PageFrame
      eyebrow="FORECAST CENTER"
      title="7-Day Weather Forecast"
      description="National outlook and operational flying windows across all active hubs."
      onBack={onBack}
    >
      <div className="kpi-grid">
        <KpiCard icon={Thermometer} label="Current" value="26°C" detail="Feels like 28°C" />
        <KpiCard icon={CloudRain} label="Rain probability" value="68%" detail="Peak at 14:00" tone="cyan" />
        <KpiCard icon={Wind} label="Peak wind" value="24 km/h" detail="North-east" tone="yellow" />
        <KpiCard icon={ShieldCheck} label="Best flight window" value="18:00–21:00" detail="Low corridor risk" tone="green" />
      </div>

      <div className="forecast-detail-grid">
        <section className="detail-card temperature-trend">
          <div className="section-title">
            <div><span>TEMPERATURE TREND</span><p>Next 24 hours · National average</p></div>
            <strong>22°–28°C</strong>
          </div>
          <div className="trend-chart" aria-label="Temperature trend chart">
            <svg viewBox="0 0 720 220" preserveAspectRatio="none" role="img">
              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2f91ff" stopOpacity=".4" />
                  <stop offset="1" stopColor="#2f91ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="chart-grid"><path d="M20 35H700M20 90H700M20 145H700M20 200H700" /></g>
              <path className="trend-area" d="M20 156 C90 128 130 70 205 82 S320 150 390 126 S500 42 570 68 S650 136 700 105 L700 205 L20 205Z" />
              <path className="trend-line" d="M20 156 C90 128 130 70 205 82 S320 150 390 126 S500 42 570 68 S650 136 700 105" />
              {[['20','156'],['205','82'],['390','126'],['570','68'],['700','105']].map(([x,y]) => <circle key={x} cx={x} cy={y} r="5" />)}
            </svg>
            <div className="chart-labels"><span>10 AM</span><span>2 PM</span><span>6 PM</span><span>10 PM</span><span>2 AM</span></div>
          </div>
        </section>

        <section className="detail-card operations-window">
          <div className="section-title"><div><span>OPERATIONS OUTLOOK</span><p>Recommended windows</p></div></div>
          <div className="window-score"><Donut value={82} label="Go probability" /></div>
          <div className="window-list">
            <div><i className="legend-dot green" /><span>18:00–21:00</span><strong>Optimal</strong></div>
            <div><i className="legend-dot yellow" /><span>10:30–13:00</span><strong>Monitor</strong></div>
            <div><i className="legend-dot red" /><span>13:00–17:00</span><strong>Avoid</strong></div>
          </div>
        </section>
      </div>

      <section className="detail-card hourly-card">
        <div className="section-title"><div><span>HOURLY CONDITIONS</span><p>Temperature, precipitation and wind</p></div></div>
        <div className="hourly-strip">
          {hourlyForecast.map((hour, index) => (
            <article className={index === 0 ? 'current' : ''} key={hour.time}>
              <span>{hour.time}</span><WeatherIcon type={hour.type} size={43} /><strong>{hour.temp}</strong>
              <small><Droplets size={11} />{hour.rain}</small><small><Wind size={11} />{hour.wind}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-card week-card">
        <div className="section-title"><div><span>EXTENDED OUTLOOK</span><p>Seven-day operational forecast</p></div></div>
        <div className="week-grid">
          {extendedForecast.map((day) => (
            <article key={day.day}>
              <strong>{day.day}</strong><WeatherIcon type={day.type} size={46} />
              <span>{day.temperature}</span><small>{day.text}</small><StatusBadge level={day.level} />
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  )
}

function AlertsPage({ onBack }) {
  const [filter, setFilter] = useState('all')
  const visibleAlerts = filter === 'all' ? alertDetails : alertDetails.filter((alert) => alert.level === filter)
  return (
    <PageFrame
      eyebrow="ALERT OPERATIONS"
      title="Active Weather Alerts"
      description="Live advisories, affected operations, and recommended response actions."
      onBack={onBack}
    >
      <div className="kpi-grid alert-kpis">
        <KpiCard icon={Bell} label="Active alerts" value="5" detail="Across Nigeria" tone="yellow" />
        <KpiCard icon={Zap} label="Warnings" value="1" detail="Action required" tone="red" />
        <KpiCard icon={Route} label="Affected corridors" value="4" detail="1 temporarily held" />
        <KpiCard icon={CheckCircle2} label="Acknowledged" value="3 / 5" detail="Operations control" tone="green" />
      </div>

      <div className="alerts-layout">
        <section className="alert-feed">
          <div className="filter-bar">
            <div><strong>Alert feed</strong><span>{visibleAlerts.length} advisories</span></div>
            <div className="filter-buttons">
              {['all', 'warning', 'caution', 'favorable'].map((item) => (
                <button type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>
              ))}
            </div>
          </div>
          <div className="alert-detail-list">
            {visibleAlerts.map((alert) => (
              <article className={`alert-detail-card ${alert.level}`} key={alert.title}>
                <span className={`warning-symbol ${alert.level}`}>!</span>
                <div className="alert-detail-main">
                  <div className="alert-detail-title"><div><strong>{alert.title}</strong><span>{alert.area} · {alert.place}</span></div><StatusBadge level={alert.level} /></div>
                  <div className="alert-facts">
                    <span><Clock3 size={13} />{alert.time}</span><span><Plane size={13} />{alert.affected}</span>
                  </div>
                  <p>{alert.impact}</p>
                  <div className="recommended-action"><ShieldCheck size={14} /><span>Recommended:</span><strong>{alert.action}</strong></div>
                </div>
                <ChevronRight size={18} className="alert-chevron" />
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-card alert-map-card">
          <div className="section-title"><div><span>ALERT DISTRIBUTION</span><p>Live affected regions</p></div></div>
          <div className="mini-map">
            <Suspense fallback={<img src={mapReference} alt="Loading alert map" />}>
              <LiveWeatherMap mode="alerts" interactive={false} className="mini-live-map" />
            </Suspense>
          </div>
          <div className="map-alert-legend"><span><i className="legend-dot red" /> Warning</span><span><i className="legend-dot yellow" /> Caution</span><span><i className="legend-dot green" /> Clear</span></div>
        </aside>
      </div>
    </PageFrame>
  )
}

function CorridorsPage({ onBack }) {
  return (
    <PageFrame
      eyebrow="FLIGHT OPERATIONS"
      title="Flight Corridor Risk"
      description="Route-level weather exposure and operational clearance across the network."
      onBack={onBack}
    >
      <div className="kpi-grid">
        <KpiCard icon={Route} label="Monitored routes" value="18" detail="12 currently active" />
        <KpiCard icon={ShieldCheck} label="Low risk" value="72%" detail="13 corridors" tone="green" />
        <KpiCard icon={Gauge} label="Moderate risk" value="20%" detail="4 corridors" tone="yellow" />
        <KpiCard icon={Bell} label="High risk" value="8%" detail="1 corridor held" tone="red" />
      </div>

      <div className="corridor-layout">
        <section className="corridor-map-wrap">
          <MapPanel mode="corridors" />
          <div className="route-map-label"><Navigation size={14} /> 18 corridors monitored in real time</div>
        </section>

        <section className="corridor-list detail-card">
          <div className="section-title"><div><span>CORRIDOR STATUS</span><p>Sorted by operational risk</p></div></div>
          {corridors.map((corridor) => (
            <article className="corridor-row" key={corridor.code}>
              <div className="corridor-code"><Route size={17} /><div><strong>{corridor.code}</strong><span>{corridor.from} <ArrowRight size={10} /> {corridor.to}</span></div></div>
              <div className="corridor-risk-line"><span><i style={{ width: `${corridor.risk}%` }} className={corridor.level} /></span><strong>{corridor.risk}</strong></div>
              <div className="corridor-weather"><span><CloudSun size={13} />{corridor.weather}</span><span><Wind size={13} />{corridor.wind}</span></div>
              <div className="corridor-footer"><StatusBadge level={corridor.level} /><strong>{corridor.eta}</strong></div>
            </article>
          ))}
        </section>
      </div>
    </PageFrame>
  )
}

function WeatherMapPage({ onBack }) {
  const [paused, setPaused] = useState(false)
  const [layer, setLayer] = useState('Rainfall')
  return (
    <PageFrame
      eyebrow="LIVE MAP"
      title="National Weather Map"
      description="Animated precipitation, wind, cloud, and operational weather layers."
      onBack={onBack}
    >
      <div className="map-page-layout">
        <aside className="detail-card map-layer-panel">
          <div className="section-title"><div><span>MAP LAYERS</span><p>Select live overlay</p></div></div>
          {['Rainfall', 'Wind Speed', 'Cloud Cover', 'Visibility', 'Temperature'].map((item, index) => {
            const Icon = [CloudRain, Wind, Cloud, Eye, Thermometer][index]
            return <button type="button" className={layer === item ? 'active' : ''} onClick={() => setLayer(item)} key={item}><Icon size={16} /><span>{item}</span><i /></button>
          })}
          <div className="layer-divider" />
          <div className="animation-state"><Activity size={15} /><div><strong>Animation</strong><span>{paused ? 'Paused' : 'Live · 10 min loop'}</span></div><button type="button" onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />}</button></div>
        </aside>
        <div className={`expanded-map-wrap layer-${layer.toLowerCase().replace(' ', '-')}`}>
          <MapPanel mode="weather" layer={layer} expanded paused={paused} onToggleMotion={() => setPaused(!paused)} />
          <div className="selected-layer"><Layers3 size={14} /> {layer}</div>
          <div className="map-timeline"><button type="button"><Play size={13} /></button><span>09:30</span><div><i /></div><strong>10:30 WAT</strong></div>
        </div>
      </div>
    </PageFrame>
  )
}

function HubsPage({ onBack }) {
  return (
    <PageFrame eyebrow="NETWORK STATUS" title="Airports & Hubs" description="Live weather and operating readiness at every active and proposed location." onBack={onBack}>
      <div className="kpi-grid">
        <KpiCard icon={MapPin} label="Total locations" value="5" detail="3 active · 2 proposed" />
        <KpiCard icon={CheckCircle2} label="Operating normally" value="2" detail="Kaduna and Bayelsa" tone="green" />
        <KpiCard icon={Gauge} label="Under caution" value="2" detail="Enhanced monitoring" tone="yellow" />
        <KpiCard icon={Bell} label="Restricted" value="1" detail="Maiduguri potential" tone="red" />
      </div>
      <div className="detail-hub-grid">
        {hubs.map((hub, index) => (
          <article className="detail-hub-card" key={hub.name}>
            <div className="hub-card-top"><span><MapPin size={15} />{index < 3 ? 'ACTIVE HUB' : 'POTENTIAL SITE'}</span><StatusBadge level={hub.status} /></div>
            <div className="detail-hub-weather"><WeatherIcon type={hub.type} size={78} /><div><h3>{hub.name}</h3><strong>{hub.temperature}</strong><span>{hub.weather}</span></div></div>
            <div className="hub-data-grid"><span><Wind size={14} /><small>Wind</small><strong>{hub.wind}</strong></span><span><Eye size={14} /><small>Visibility</small><strong>{hub.visibility}</strong></span><span><CloudRain size={14} /><small>Rainfall</small><strong>{index === 2 ? '3.8 mm/hr' : '1.2 mm/hr'}</strong></span></div>
            <button type="button">View hub detail <ChevronRight size={14} /></button>
          </article>
        ))}
      </div>
    </PageFrame>
  )
}

function ReportsPage({ onBack }) {
  const reports = [
    ['Daily Flight Weather Brief', '8 May 2025 · 10:30 WAT', '12 pages', 'READY'],
    ['Corridor Risk Summary', '8 May 2025 · 09:00 WAT', '8 pages', 'READY'],
    ['Weekly Hub Performance', '5–11 May 2025', '24 pages', 'SCHEDULED'],
    ['Severe Weather Incident Log', 'April 2025', '17 pages', 'ARCHIVED'],
  ]
  return (
    <PageFrame eyebrow="REPORTING" title="Weather Intelligence Reports" description="Operational briefs, risk summaries, and archived weather intelligence." onBack={onBack}>
      <div className="report-grid">
        {reports.map(([name, date, pages, status], index) => (
          <article className="report-card" key={name}><span className="report-icon"><FileText size={24} /></span><div><span>REPORT {String(index + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{date}</p></div><footer><small>{pages}</small><strong>{status}</strong><button type="button">Open <ChevronRight size={13} /></button></footer></article>
        ))}
      </div>
    </PageFrame>
  )
}

function SettingsPage({ onBack }) {
  const [options, setOptions] = useState({ alerts: true, animation: true, autoRefresh: true, compact: false })
  const toggle = (key) => setOptions((current) => ({ ...current, [key]: !current[key] }))
  return (
    <PageFrame eyebrow="SYSTEM" title="Dashboard Settings" description="Personalize alerts, map behavior, refresh intervals, and display density." onBack={onBack}>
      <div className="settings-grid">
        <section className="detail-card settings-card"><div className="section-title"><div><span>NOTIFICATIONS</span><p>Operational alert preferences</p></div></div>{[['alerts','Critical weather alerts','Show warning and caution notifications'],['autoRefresh','Automatic data refresh','Refresh live data every 10 minutes']].map(([key,title,text]) => <div className="setting-row" key={key}><div><strong>{title}</strong><span>{text}</span></div><button type="button" className={`switch ${options[key] ? 'on' : ''}`} onClick={() => toggle(key)}><i /></button></div>)}</section>
        <section className="detail-card settings-card"><div className="section-title"><div><span>DISPLAY</span><p>Map and dashboard behavior</p></div></div>{[['animation','Animated weather layers','Display moving wind and storm cells'],['compact','Compact information density','Reduce spacing on large displays']].map(([key,title,text]) => <div className="setting-row" key={key}><div><strong>{title}</strong><span>{text}</span></div><button type="button" className={`switch ${options[key] ? 'on' : ''}`} onClick={() => toggle(key)}><i /></button></div>)}</section>
      </div>
    </PageFrame>
  )
}

function Dashboard({ onNavigate }) {
  return (
    <main className="dashboard page-enter">
      <div className="left-stack">
        <WeatherOverview />
        <OperationalImpact />
        <ActiveAlerts onOpen={() => onNavigate('alerts')} />
      </div>
      <MapPanel />
      <div className="right-stack">
        <Forecast onOpen={() => onNavigate('forecast')} />
        <WeatherParameters />
      </div>
      <HubStatus />
      <CorridorRisk onOpen={() => onNavigate('corridors')} />
    </main>
  )
}

function AppPage({ page, onBack }) {
  if (page === 'forecast') return <ForecastPage onBack={onBack} />
  if (page === 'alerts') return <AlertsPage onBack={onBack} />
  if (page === 'corridors') return <CorridorsPage onBack={onBack} />
  if (page === 'map') return <WeatherMapPage onBack={onBack} />
  if (page === 'hubs') return <HubsPage onBack={onBack} />
  if (page === 'reports') return <ReportsPage onBack={onBack} />
  if (page === 'settings') return <SettingsPage onBack={onBack} />
  return null
}

function App() {
  const validPages = new Set(navItems.map((item) => item.page))
  const pageFromHash = () => {
    const requested = window.location.hash.replace('#', '')
    return validPages.has(requested) ? requested : 'overview'
  }
  const [page, setPage] = useState(pageFromHash)

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (nextPage) => {
    setPage(nextPage)
    const nextHash = nextPage === 'overview' ? '' : `#${nextPage}`
    if (window.location.hash !== nextHash) window.location.hash = nextHash
  }

  return (
    <div className="app-frame">
      <Header />
      <div className="app-shell">
        <Sidebar activePage={page} onNavigate={navigate} />
        {page === 'overview' ? <Dashboard onNavigate={navigate} /> : <AppPage key={page} page={page} onBack={() => navigate('overview')} />}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
