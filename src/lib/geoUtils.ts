/**
 * Geographic utility functions for Shuttle Route management
 */

// KNO Airport Coordinates
export const KNO_COORDS = { lat: 3.6422, lng: 98.8853 };

/**
 * Calculates the distance between two points using the Haversine formula
 * Returns distance in Kilometers (KM)
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number = KNO_COORDS.lat,
  lng2: number = KNO_COORDS.lng
): number {
  const R = 6371; // Earth's radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Number(distance.toFixed(2));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
