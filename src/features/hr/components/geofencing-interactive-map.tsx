import { MapContainer, TileLayer, Circle as LeafletCircle, Polygon as LeafletPolygon, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface CoordinatePoint {
    id: string
    latitude: number
    longitude: number
}

interface Coordinate {
    latitude: number
    longitude: number
}

// Map Click Handler Component for create/edit mode
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

// Interactive Map for Create/Edit Geofence
interface GeofencingCreateMapProps {
    centerLat: number
    centerLng: number
    radius: number
    type: 'circle' | 'polygon'
    coordinates: CoordinatePoint[]
    onMapClick: (lat: number, lng: number) => void
}

export function GeofencingCreateMap({
    centerLat,
    centerLng,
    radius,
    type,
    coordinates,
    onMapClick,
}: GeofencingCreateMapProps) {
    return (
        <MapContainer
            center={[centerLat, centerLng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onClick={onMapClick} />

            {type === 'circle' ? (
                <>
                    <Marker position={[centerLat, centerLng]} />
                    <LeafletCircle
                        center={[centerLat, centerLng]}
                        radius={radius}
                        pathOptions={{
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.2,
                        }}
                    />
                </>
            ) : (
                <>
                    {coordinates.map((coord) => (
                        <Marker
                            key={coord.id}
                            position={[coord.latitude, coord.longitude]}
                        />
                    ))}
                    {coordinates.length >= 3 && (
                        <LeafletPolygon
                            positions={coordinates.map(c => [c.latitude, c.longitude])}
                            pathOptions={{
                                color: '#8b5cf6',
                                fillColor: '#8b5cf6',
                                fillOpacity: 0.2,
                            }}
                        />
                    )}
                </>
            )}
        </MapContainer>
    )
}

// List View Map showing all geofences
interface GeofenceZoneData {
    id: string
    name: string
    type: 'circle' | 'polygon'
    center?: Coordinate
    radius?: number
    coordinates?: Coordinate[]
    isActive: boolean
}

interface GeofencingListMapProps {
    mapCenter: { lat: number; lng: number }
    zones: GeofenceZoneData[]
}

export function GeofencingListMap({ mapCenter, zones }: GeofencingListMapProps) {
    return (
        <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {zones.map((zone) => {
                if (zone.type === 'circle' && zone.center && zone.radius) {
                    return (
                        <LeafletCircle
                            key={zone.id}
                            center={[zone.center.latitude, zone.center.longitude]}
                            radius={zone.radius}
                            pathOptions={{
                                color: zone.isActive ? '#10b981' : '#94a3b8',
                                fillColor: zone.isActive ? '#10b981' : '#94a3b8',
                                fillOpacity: 0.2,
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong>{zone.name}</strong>
                                    <br />
                                    <span className="text-xs text-slate-500">
                                        {zone.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>
                            </Popup>
                        </LeafletCircle>
                    )
                } else if (zone.type === 'polygon' && zone.coordinates && zone.coordinates.length > 0) {
                    return (
                        <LeafletPolygon
                            key={zone.id}
                            positions={zone.coordinates.map(coord => [coord.latitude, coord.longitude])}
                            pathOptions={{
                                color: zone.isActive ? '#10b981' : '#94a3b8',
                                fillColor: zone.isActive ? '#10b981' : '#94a3b8',
                                fillOpacity: 0.2,
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong>{zone.name}</strong>
                                    <br />
                                    <span className="text-xs text-slate-500">
                                        {zone.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>
                            </Popup>
                        </LeafletPolygon>
                    )
                }
                return null
            })}
        </MapContainer>
    )
}
