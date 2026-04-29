import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './RouteMap.css'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STOP_COLORS = {
  pickup: '#f97316',
  dropoff: '#22c55e',
  fueling: '#ef4444',
  break: '#3b82f6',
  rest: '#8b5cf6',
}

const STOP_LABELS = {
  pickup: 'Pickup',
  dropoff: 'Dropoff',
  fueling: 'Fuel',
  break: 'Break',
  rest: 'Rest',
}

function RouteMap({ geometry, stops, segments }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!geometry || geometry.length === 0) return

    // Initialize map once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([40, -95], 4)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    const map = mapInstanceRef.current

    // Clear all previous layers (except tile layer)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer)
      }
    })

    // Draw the route polyline
    const routeCoords = geometry.map(coord => [coord[1], coord[0]])
    const polyline = L.polyline(routeCoords, {
      color: '#FF385C',
      weight: 4,
      opacity: 0.9,
      smoothFactor: 3,
    }).addTo(map)

    // Add stop markers
    if (stops && stops.length > 0) {
      stops.forEach((stop) => {
        if (stop.coords && stop.coords[0] && stop.coords[1]) {
          const color = STOP_COLORS[stop.type] || '#6b7280'
          const label = STOP_LABELS[stop.type] || 'Stop'

          const customIcon = L.divIcon({
            html: `
              <div style="
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
              ">
                <div style="
                  background: ${color};
                  color: white;
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: 700;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  border: 2px solid white;
                ">●</div>
                <span style="
                  font-size: 9px;
                  font-weight: 700;
                  color: ${color};
                  background: white;
                  padding: 1px 5px;
                  border-radius: 4px;
                  margin-top: 2px;
                  white-space: nowrap;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                ">${label}</span>
              </div>
            `,
            className: '',
            iconSize: [50, 50],
            iconAnchor: [25, 25],
          })

          L.marker([stop.coords[0], stop.coords[1]], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <b>${label}</b><br/>
              <small>${stop.description || ''}</small>
            `)
        }
      })
    }

    // Add start and end markers (for current location and dropoff)
    if (segments && segments.length > 0) {
      const firstSeg = segments[0]
      const lastSeg = segments[segments.length - 1]

      // Start marker
      if (firstSeg.from_coords) {
        const startIcon = L.divIcon({
          html: `<div style="
            background: #0f172a;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">S</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        L.marker([firstSeg.from_coords[0], firstSeg.from_coords[1]], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<b>Start</b><br/>${firstSeg.from}`)
      }

      // End marker
      if (lastSeg.to_coords) {
        const endIcon = L.divIcon({
          html: `<div style="
            background: #10b981;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">E</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        L.marker([lastSeg.to_coords[0], lastSeg.to_coords[1]], { icon: endIcon })
          .addTo(map)
          .bindPopup(`<b>Destination</b><br/>${lastSeg.to}`)
      }
    }

    // Fit map to show entire route
    if (polyline.getBounds().isValid()) {
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] })
    }

    // Fix map rendering issues
    setTimeout(() => {
      map.invalidateSize()
    }, 200)

  }, [geometry, stops, segments])

  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="map-container"></div>
      <div className="map-legend">
        <span><span className="legend-dot" style={{background: '#f97316'}}></span> Pickup</span>
        <span><span className="legend-dot" style={{background: '#ef4444'}}></span> Fueling</span>
        <span><span className="legend-dot" style={{background: '#3b82f6'}}></span> Break</span>
        <span><span className="legend-dot" style={{background: '#8b5cf6'}}></span> Rest</span>
        <span><span className="legend-dot" style={{background: '#22c55e'}}></span> Dropoff</span>
      </div>
    </div>
  )
}

export default RouteMap