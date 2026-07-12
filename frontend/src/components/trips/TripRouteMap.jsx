import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'

// Vite doesn't rewrite Leaflet's CSS-embedded default marker URLs, so the
// bundled images 404 unless wired up explicitly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
})

function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// Fallback map center when geocoding a fictional/demo place name fails:
// Ahmedabad, Gujarat.
const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 }

// Nominatim (OpenStreetMap's free geocoder) and OSRM's public demo routing
// server — both free, no API key required.
async function geocode(query, region) {
  if (!query) return null
  // Trip source/destination are often fictional depot/hub names with no
  // real-world match — appending the trip's region steers Nominatim's fuzzy
  // matching toward the right part of the country instead of a same-named
  // place on the other side of India.
  const fullQuery = region ? `${query}, ${region}` : query
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1&countrycodes=in`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.[0]
    if (!result) return null
    return { lat: Number(result.lat), lng: Number(result.lon) }
  } catch {
    return null
  }
}

async function fetchRouteGeoJson(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&overview=full`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const route = data?.routes?.[0]
    if (!route?.geometry) return null
    return route.geometry
  } catch {
    return null
  }
}

/**
 * Static trip-route map, rendered on the Trip Details page.
 *
 * Uses Leaflet with OpenStreetMap tiles — free, no API key required.
 * Geocodes `source`/`destination` (or uses the optional pre-set lat/lng
 * overrides) via Nominatim, draws markers + a driving route line via OSRM,
 * and fits the map to both points. Since `source`/`destination` are often
 * fictional depot/hub names for this demo dataset, geocoding may fail or
 * be inaccurate — in that case the map falls back to a fixed default
 * center and shows an inline "approximate location" note.
 */
export function TripRouteMap({ source, destination, sourceLat, sourceLng, destinationLat, destinationLng, region }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [approximate, setApproximate] = useState(false)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false

    const map = L.map(containerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 6,
      zoomControl: false,
    })
    mapRef.current = map
    L.control.zoom({ position: 'topright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    async function build() {
      try {
        const hasSourceOverride = sourceLat != null && sourceLng != null
        const hasDestOverride = destinationLat != null && destinationLng != null

        const [geocodedSource, geocodedDest] = await Promise.all([
          hasSourceOverride ? Promise.resolve(null) : geocode(source, region),
          hasDestOverride ? Promise.resolve(null) : geocode(destination, region),
        ])

        let from = hasSourceOverride ? { lat: sourceLat, lng: sourceLng } : geocodedSource
        let to = hasDestOverride ? { lat: destinationLat, lng: destinationLng } : geocodedDest

        let usedFallback = false
        if (!from || !to) {
          usedFallback = true
          from = from ?? { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng - 0.15 }
          to = to ?? { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng + 0.15 }
        }

        if (cancelled) return

        setApproximate(usedFallback)

        L.marker([from.lat, from.lng], { icon: coloredIcon('#059669') }).addTo(map)
        L.marker([to.lat, to.lng], { icon: coloredIcon('#dc2626') }).addTo(map)

        const bounds = L.latLngBounds([from.lat, from.lng], [to.lat, to.lng])
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 })

        const geometry = await fetchRouteGeoJson(from, to)
        if (cancelled) return
        if (geometry) {
          L.geoJSON(geometry, {
            style: { color: '#2563eb', weight: 4, opacity: 0.85 },
          }).addTo(map)
        } else {
          // No route available (e.g. offline/demo coordinates) — draw a
          // straight line between the two points instead.
          L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
            color: '#2563eb',
            weight: 3,
            opacity: 0.6,
            dashArray: '6 6',
          }).addTo(map)
        }

        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    build()

    return () => {
      cancelled = true
      map.remove()
      mapRef.current = null
    }
  }, [source, destination, sourceLat, sourceLng, destinationLat, destinationLng, region])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 overflow-hidden rounded-lg border border-slate-200">
          <div ref={containerRef} className="h-full w-full" />
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
              Unable to load the route map.
            </div>
          )}
        </div>
        {approximate && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
            <MapPin className="size-3.5" />
            Approximate location — exact depot coordinates not available.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
