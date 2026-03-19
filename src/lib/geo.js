// City center coordinates for distance-based sorting
export const CITY_COORDS = {
  Lahore:     { lat: 31.5204, lng: 74.3587 },
  Karachi:    { lat: 24.8607, lng: 67.0011 },
  Islamabad:  { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Peshawar:   { lat: 34.0151, lng: 71.5249 },
  Multan:     { lat: 30.1575, lng: 71.5249 },
  Faisalabad: { lat: 31.4504, lng: 73.1350 },
  Quetta:     { lat: 30.1798, lng: 66.9750 },
};

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distanceKm(office, userLat, userLng) {
  // Use the office's own geocoded coordinates if available
  if (office.lat != null && office.lng != null) {
    return haversine(userLat, userLng, office.lat, office.lng);
  }
  // Fall back to city center
  const c = CITY_COORDS[office.city];
  if (!c) return Infinity;
  return haversine(userLat, userLng, c.lat, c.lng);
}

export function formatDistance(km) {
  if (!isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `~${km.toFixed(1)} km`;
  return `~${Math.round(km)} km`;
}
