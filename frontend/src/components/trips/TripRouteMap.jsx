import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPinned, MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Fallback map center when geocoding a fictional/demo place name fails:
// Ahmedabad, Gujarat.
const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 }

async function geocode(query) {
  if (!query) return null
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=1`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const feature = data?.features?.[0]
    if (!feature?.center) return null
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}

async function fetchRouteGeoJson(from, to) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
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
 * Degrades gracefully to a placeholder card when VITE_MAPBOX_TOKEN is not
 * configured (no network calls are attempted in that case). When a token is
 * present, it geocodes `source`/`destination` (or uses the optional
 * pre-set lat/lng overrides), draws markers + a driving route line, and
 * fits the map to both points. Since `source`/`destination` are often
 * fictional depot/hub names for this demo dataset, geocoding may fail or
 * be inaccurate — in that case the map falls back to a fixed default
 * center and shows an inline "approximate location" note.
 */
export function TripRouteMap({ source, destination, sourceLat, sourceLng, destinationLat, destinationLng }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [approximate, setApproximate] = useState(false)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  useEffect(() => {
    if (!MAPBOX_TOKEN) return undefined

    let cancelled = false
    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: 6,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    async function build() {
      try {
        const hasSourceOverride = sourceLat != null && sourceLng != null
        const hasDestOverride = destinationLat != null && destinationLng != null

        const [geocodedSource, geocodedDest] = await Promise.all([
          hasSourceOverride ? Promise.resolve(null) : geocode(source),
          hasDestOverride ? Promise.resolve(null) : geocode(destination),
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

        function addMarkersAndRoute() {
          new mapboxgl.Marker({ color: '#059669' }).setLngLat([from.lng, from.lat]).addTo(map)
          new mapboxgl.Marker({ color: '#dc2626' }).setLngLat([to.lng, to.lat]).addTo(map)

          const bounds = new mapboxgl.LngLatBounds()
          bounds.extend([from.lng, from.lat])
          bounds.extend([to.lng, to.lat])
          map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 0 })

          fetchRouteGeoJson(from, to).then((geometry) => {
            if (cancelled || !geometry || !map.getStyle()) return
            if (map.getSource('trip-route')) return
            map.addSource('trip-route', {
              type: 'geojson',
              data: { type: 'Feature', properties: {}, geometry },
            })
            map.addLayer({
              id: 'trip-route-line',
              type: 'line',
              source: 'trip-route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.85 },
            })
          })
        }

        if (map.isStyleLoaded()) {
          addMarkersAndRoute()
        } else {
          map.once('load', addMarkersAndRoute)
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
  }, [source, destination, sourceLat, sourceLng, destinationLat, destinationLng])

  if (!MAPBOX_TOKEN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <MapPinned className="size-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Map requires a Mapbox access token</p>
            <p className="max-w-sm text-xs text-slate-400">
              Add <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-600">VITE_MAPBOX_TOKEN</code> to your{' '}
              <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-600">.env</code> to enable live route
              visualization.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 overflow-hidden rounded-lg border border-slate-200">
          <div ref={containerRef} className="h-full w-full" />
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-slate-500">
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
