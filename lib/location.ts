export type LatLng = {
  lat: number;
  lng: number;
};

// Temporary fixed location until browser geolocation is enabled.
export const FIXED_USER_LOCATION: LatLng = {
  lat: 33.5731,
  lng: -7.5898,
};

export function isValidLocation(location?: LatLng | null): location is LatLng {
  if (!location) return false;
  if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return false;
  if (location.lat === 0 && location.lng === 0) return false;
  return true;
}

export function distanceKm(from: LatLng, to: LatLng): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

