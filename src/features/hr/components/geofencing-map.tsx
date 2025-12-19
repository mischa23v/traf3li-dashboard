import { MapContainer, TileLayer, Circle as LeafletCircle, Polygon as LeafletPolygon, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Coordinate {
    latitude: number
    longitude: number
}

interface GeofencingMapProps {
    mapCenter: { lat: number; lng: number }
    zone: {
        name: string
        type: 'circle' | 'polygon'
        isActive: boolean
        center?: { latitude: number; longitude: number }
        radius?: number
        coordinates?: Coordinate[]
    }
}

export function GeofencingMap({ mapCenter, zone }: GeofencingMapProps) {
    return (
        <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {zone.type === 'circle' && zone.center && zone.radius ? (
                <>
                    <Marker position={[zone.center.latitude, zone.center.longitude]}>
                        <Popup>{zone.name}</Popup>
                    </Marker>
                    <LeafletCircle
                        center={[zone.center.latitude, zone.center.longitude]}
                        radius={zone.radius}
                        pathOptions={{
                            color: zone.isActive ? '#10b981' : '#94a3b8',
                            fillColor: zone.isActive ? '#10b981' : '#94a3b8',
                            fillOpacity: 0.2,
                        }}
                    />
                </>
            ) : zone.type === 'polygon' && zone.coordinates && zone.coordinates.length > 0 ? (
                <>
                    {zone.coordinates.map((coord, idx) => (
                        <Marker
                            key={idx}
                            position={[coord.latitude, coord.longitude]}
                        />
                    ))}
                    <LeafletPolygon
                        positions={zone.coordinates.map(c => [c.latitude, c.longitude])}
                        pathOptions={{
                            color: zone.isActive ? '#8b5cf6' : '#94a3b8',
                            fillColor: zone.isActive ? '#8b5cf6' : '#94a3b8',
                            fillOpacity: 0.2,
                        }}
                    >
                        <Popup>{zone.name}</Popup>
                    </LeafletPolygon>
                </>
            ) : null}
        </MapContainer>
    )
}
