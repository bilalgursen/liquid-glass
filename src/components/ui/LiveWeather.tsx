import { useEffect, useState } from 'react'

// Apple Weather's small widget, filled with the visitor's own weather: the city comes from
// BigDataCloud (IP lookup, or precise coordinates when location access is already granted)
// and the forecast from Open-Meteo. Both are keyless and CORS-enabled.

type Sky = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder'

export type WeatherNow = {
  city: string
  temperature: number
  high: number
  low: number
  code: number
  isDay: boolean
}

const FALLBACK_PLACE = { city: 'Istanbul', latitude: 41.01, longitude: 28.98, countryCode: 'TR' }
// Countries that read the temperature in Fahrenheit.
const FAHRENHEIT = new Set(['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'FM', 'MH'])
const CACHE_KEY = 'live-weather'
const CACHE_MS = 30 * 60 * 1000

function describe(code: number, isDay: boolean): { sky: Sky; label: string } {
  if (code === 0) return { sky: 'clear', label: isDay ? 'Sunny' : 'Clear' }
  if (code === 1) return { sky: 'clear', label: isDay ? 'Mostly Sunny' : 'Mostly Clear' }
  if (code === 2) return { sky: 'partly', label: 'Partly Cloudy' }
  if (code === 3) return { sky: 'cloudy', label: 'Cloudy' }
  if (code === 45 || code === 48) return { sky: 'fog', label: 'Foggy' }
  if (code >= 51 && code <= 57) return { sky: 'drizzle', label: 'Drizzle' }
  if (code >= 80 && code <= 82) return { sky: 'rain', label: 'Showers' }
  if (code >= 61 && code <= 67) return { sky: 'rain', label: 'Rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { sky: 'snow', label: 'Snow' }
  if (code >= 95) return { sky: 'thunder', label: 'Thunderstorms' }
  return { sky: 'cloudy', label: 'Cloudy' }
}

function readCache(): WeatherNow | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw) as { at: number; data: WeatherNow }
    return Date.now() - at < CACHE_MS ? data : null
  } catch {
    return null
  }
}

function writeCache(data: WeatherNow) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // Storage can be unavailable (private mode); the card just refetches next time.
  }
}

// Precise coordinates only when the visitor already allowed it; never prompts.
async function grantedPosition(): Promise<GeolocationCoordinates | null> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' })
    if (status?.state !== 'granted') return null
    return await new Promise((resolve) =>
      navigator.geolocation.getCurrentPosition(
        (p) => resolve(p.coords),
        () => resolve(null),
        { timeout: 5000, maximumAge: CACHE_MS },
      ),
    )
  } catch {
    return null
  }
}

async function locate(signal: AbortSignal) {
  try {
    const coords = await grantedPosition()
    const query = coords ? `latitude=${coords.latitude}&longitude=${coords.longitude}&` : ''
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}localityLanguage=en`, { signal })
    const geo = await res.json()
    const city = geo.city || geo.locality || geo.principalSubdivision
    if (!res.ok || !city || typeof geo.latitude !== 'number') return FALLBACK_PLACE
    return { city, latitude: geo.latitude, longitude: geo.longitude, countryCode: geo.countryCode }
  } catch (error) {
    if (signal.aborted) throw error
    return FALLBACK_PLACE
  }
}

async function fetchWeather(signal: AbortSignal): Promise<WeatherNow> {
  const place = await locate(signal)
  const unit = FAHRENHEIT.has(place.countryCode) ? 'fahrenheit' : 'celsius'
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=${unit}&timezone=auto&forecast_days=1`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const data = await res.json()
  return {
    city: place.city,
    temperature: Math.round(data.current.temperature_2m),
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
  }
}

export function useLiveWeather() {
  const [weather, setWeather] = useState<WeatherNow | null>(null)
  useEffect(() => {
    const cached = readCache()
    if (cached) return setWeather(cached)
    const controller = new AbortController()
    fetchWeather(controller.signal)
      .then((data) => {
        setWeather(data)
        writeCache(data)
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.warn('Live weather unavailable', error)
      })
    return () => controller.abort()
  }, [])
  return weather
}

const SUN = '#FFD60A'
const RAIN = '#40C8E0'

// Multicolour glyphs after SF Symbols: yellow sun, cloud in the text colour, cyan rain.
function Cloud({ y = 0 }: { y?: number }) {
  return <path transform={`translate(0 ${y})`} fill="currentColor" d="M6.5 19h11a4.5 4.5 0 0 0 .6-8.96A6 6 0 0 0 6.4 11.2 4 4 0 0 0 6.5 19z" />
}

function Sun({ cx = 12, cy = 12, r = 4.5, rays = true }: { cx?: number; cy?: number; r?: number; rays?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SUN} />
      {rays &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1={cx}
            y1={cy - r - 2}
            x2={cx}
            y2={cy - r - 4}
            stroke={SUN}
            strokeWidth={2}
            strokeLinecap="round"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
    </g>
  )
}

function WeatherIcon({ sky, isDay }: { sky: Sky; isDay: boolean }) {
  const drops = (color: string, count: number) =>
    Array.from({ length: count }, (_, i) => (
      <line key={i} x1={8 + i * 4} y1={18.5} x2={7 + i * 4} y2={21.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ))
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      {sky === 'clear' &&
        (isDay ? <Sun /> : <path fill="currentColor" d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />)}
      {sky === 'partly' && (
        <>
          {isDay ? <Sun cx={9} cy={8} r={3.5} rays={false} /> : <path fill="currentColor" opacity={0.6} d="M13 9a5 5 0 0 1-6-6 5 5 0 1 0 6 6z" />}
          <Cloud y={1} />
        </>
      )}
      {sky === 'cloudy' && <Cloud />}
      {sky === 'fog' && (
        <>
          <Cloud y={-3} />
          <line x1={5} y1={19.5} x2={19} y2={19.5} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={7} y1={22.5} x2={17} y2={22.5} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
      {(sky === 'drizzle' || sky === 'rain') && (
        <>
          <Cloud y={-3.5} />
          {drops(RAIN, sky === 'rain' ? 3 : 2)}
        </>
      )}
      {sky === 'snow' && (
        <>
          <Cloud y={-3.5} />
          {[8, 12, 16].map((x) => (
            <circle key={x} cx={x} cy={20} r={1.3} fill="currentColor" />
          ))}
        </>
      )}
      {sky === 'thunder' && (
        <>
          <Cloud y={-3.5} />
          <path fill={SUN} d="M12.5 15 9 20.5h2.6L10.5 24l4-5.6h-2.6l1.1-3.4z" />
        </>
      )}
    </svg>
  )
}

const muted = 'text-neutral-900/60 dark:text-white/60'

/** Card content: city with a location arrow, big temperature, then sky, condition and highs/lows. */
export function LiveWeather({ className = '' }: { className?: string }) {
  const weather = useLiveWeather()
  const sky = weather ? describe(weather.code, weather.isDay) : null
  return (
    <div className={`flex h-full w-full flex-col justify-between p-4 ${className}`}>
      <div>
        <p className="flex items-center gap-1 text-[15px] leading-5 font-medium">
          <span className="truncate">{weather?.city ?? 'Locating…'}</span>
          <svg viewBox="0 0 24 24" width={11} height={11} aria-hidden="true" className="shrink-0">
            <path fill="currentColor" d="M21 3 3 10.4l7.6 2.9L13.6 21z" />
          </svg>
        </p>
        <p className="mt-0.5 text-[44px] leading-none font-light tracking-[-0.02em]">{weather ? `${weather.temperature}°` : '--°'}</p>
      </div>
      <div className="text-[13px] leading-[1.25] font-medium">
        <div className="mb-1 h-[18px]">{sky && weather && <WeatherIcon sky={sky.sky} isDay={weather.isDay} />}</div>
        <p className={sky ? '' : muted}>{sky?.label ?? '—'}</p>
        <p>{weather ? `H:${weather.high}° L:${weather.low}°` : 'H:--° L:--°'}</p>
      </div>
    </div>
  )
}

export default LiveWeather
