'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

const DEFAULT_CENTER: [number, number] = [33.5731, -7.5898];

type DoctorMapItem = {
  id: string;
  full_name: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
};

function isValidLocation(location: DoctorMapItem['location']): location is { lat: number; lng: number } {
  if (!location) return false;
  if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return false;
  // (0,0) is typically placeholder data and not a real doctor location in this app.
  if (location.lat === 0 && location.lng === 0) return false;
  return true;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.setView(center, Math.max(map.getZoom(), 13), { animate: true });

    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [center, map]);

  return null;
}

export default function DoctorsLeafletMap({
  doctors,
  selectedLocation,
}: {
  doctors: DoctorMapItem[];
  selectedLocation?: { lat: number; lng: number } | null;
}) {
  const center: [number, number] = isValidLocation(selectedLocation)
    ? [selectedLocation.lat, selectedLocation.lng]
    : DEFAULT_CENTER;

  const doctorsWithLocation = doctors.filter((doctor) => isValidLocation(doctor.location));
  const openInMapsUrl = `https://www.google.com/maps?q=${center[0]},${center[1]}`;

  return (
    <div data-testid="doctors-leaflet-map" className="w-full h-[520px] rounded-lg overflow-hidden border border-gray-100 relative">
      <a
        href={openInMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute top-3 left-3 z-[500] bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-cyan-700"
      >
        Open in Maps
      </a>

      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />

        {doctorsWithLocation.map((doctor) => (
          <CircleMarker
            key={doctor.id}
            center={[doctor.location.lat, doctor.location.lng]}
            radius={8}
            pathOptions={{ color: '#0891b2', fillColor: '#06b6d4', fillOpacity: 0.85 }}
          >
            <Popup>{doctor.full_name}</Popup>
          </CircleMarker>
        ))}

        <CircleMarker
          center={center}
          radius={10}
          pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.85 }}
        >
          <Popup>الموقع الحالي</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}



