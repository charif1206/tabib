'use client';

import React, { useEffect } from 'react';
import { FIXED_USER_LOCATION, isValidLocation, type LatLng } from '@/lib/location';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

type DoctorMapItem = {
  id: string;
  full_name: string;
  location?: LatLng | null;
};

const AnyMapContainer: any = MapContainer;
const AnyTileLayer: any = TileLayer;
const AnyCircleMarker: any = CircleMarker;

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
  userLocation,
}: {
  doctors: DoctorMapItem[];
  selectedLocation?: LatLng | null;
  userLocation?: LatLng;
}) {
  const activeUserLocation = isValidLocation(userLocation) ? userLocation : FIXED_USER_LOCATION;
  const center = isValidLocation(selectedLocation) ? selectedLocation : activeUserLocation;
  const doctorsWithLocation = doctors.filter((doctor) => isValidLocation(doctor.location));
  const openInMapsUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}`;
  const mapCenter: [number, number] = [center.lat, center.lng];

  return (
    <div data-testid="doctors-leaflet-map" className="w-full h-[520px] rounded-lg overflow-hidden border border-gray-100 relative bg-slate-50">
      <a
        href={openInMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute top-3 left-3 z-10 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-cyan-700"
      >
        Open in Maps
      </a>

      {React.createElement(
        AnyMapContainer,
        {
          center: mapCenter,
          zoom: 13,
          scrollWheelZoom: true,
          className: 'h-full w-full',
          preferCanvas: true,
        },
        React.createElement(AnyTileLayer, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        }),
        React.createElement(RecenterMap, { center: mapCenter }),
        ...doctorsWithLocation.map((doctor) =>
          React.createElement(
            AnyCircleMarker,
            {
              key: doctor.id,
              center: [doctor.location!.lat, doctor.location!.lng],
              radius: 8,
              pathOptions: { color: '#0891b2', fillColor: '#06b6d4', fillOpacity: 0.85 },
            },
            React.createElement(Popup, null, doctor.full_name),
          ),
        ),
        React.createElement(
          AnyCircleMarker,
          {
            center: [activeUserLocation.lat, activeUserLocation.lng],
            radius: 10,
            pathOptions: { color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.85 },
          },
          React.createElement(Popup, null, 'الموقع الحالي'),
        ),
      )}
    </div>
  );
}

