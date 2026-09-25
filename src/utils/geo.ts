/**
 * Geographic calculation utilities for the hobby store locator.
 * Uses the Haversine formula to compute straight-line distance locally.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Default reference coordinates in Singapore (City Hall / Central Singapore)
export const DEFAULT_SINGAPORE_COORDS: Coordinates = {
  latitude: 1.2930,
  longitude: 103.8520,
};

/**
 * Calculates the straight-line distance between two sets of coordinates using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 (user's latitude)
 * @param lon1 Longitude of point 1 (user's longitude)
 * @param lat2 Latitude of point 2 (store's latitude)
 * @param lon2 Longitude of point 2 (store's longitude)
 * @returns Distance in kilometers (distanceKm) rounded to two decimal places
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = R * c;
  return Math.round(distanceKm * 100) / 100;
}

/**
 * Formats distance display according to user requirement:
 * - below 1 km: display metres, e.g. "650 m away"
 * - 1 km or more: display kilometres, e.g. "2.4 km away"
 */
export function formatStoreDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const metres = Math.round(distanceKm * 1000);
    return `${metres} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

// Known Singapore reference areas for resolving user base location from coordinates
export const SINGAPORE_REFERENCE_AREAS = [
  { name: 'Woodlands', latitude: 1.4382, longitude: 103.7890 },
  { name: 'Woodlands South', latitude: 1.4273, longitude: 103.7933 },
  { name: 'City Hall', latitude: 1.2931, longitude: 103.8521 },
  { name: 'Orchard', latitude: 1.3040, longitude: 103.8318 },
  { name: 'Novena', latitude: 1.3204, longitude: 103.8438 },
  { name: 'Bishan', latitude: 1.3508, longitude: 103.8481 },
  { name: 'Stevens', latitude: 1.3200, longitude: 103.8260 },
  { name: 'Serangoon', latitude: 1.3498, longitude: 103.8738 },
  { name: 'Bright Hill', latitude: 1.3632, longitude: 103.8333 },
  { name: 'Toa Payoh', latitude: 1.3327, longitude: 103.8476 },
  { name: 'Bugis', latitude: 1.3005, longitude: 103.8561 },
  { name: 'Promenade', latitude: 1.2934, longitude: 103.8604 },
  { name: 'Gardens by the Bay', latitude: 1.2816, longitude: 103.8636 },
  { name: 'MacPherson', latitude: 1.3262, longitude: 103.8897 },
  { name: 'Marymount', latitude: 1.3487, longitude: 103.8394 },
];

export function findNearestSingaporeArea(lat: number, lon: number): string {
  let nearest = SINGAPORE_REFERENCE_AREAS[0];
  let minDistance = Infinity;

  for (const area of SINGAPORE_REFERENCE_AREAS) {
    const dist = calculateHaversineDistanceKm(lat, lon, area.latitude, area.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = area;
    }
  }
  return nearest.name;
}
