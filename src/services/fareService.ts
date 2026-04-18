import { RAYON_DATA } from '../data/rayonPoints';

export interface FareRule {
  serviceTier: 'regular' | 'executive' | 'vip';
  baseFare: number;
  pricePerKm: number;
}

export const FARE_RULES: Record<string, FareRule[]> = {
  'RAYON-A': [
    { serviceTier: 'regular', baseFare: 80000, pricePerKm: 1500 },
    { serviceTier: 'executive', baseFare: 120000, pricePerKm: 2000 },
    { serviceTier: 'vip', baseFare: 200000, pricePerKm: 3000 },
  ],
  'RAYON-B': [
    { serviceTier: 'regular', baseFare: 85000, pricePerKm: 1500 },
    { serviceTier: 'executive', baseFare: 125000, pricePerKm: 2000 },
    { serviceTier: 'vip', baseFare: 210000, pricePerKm: 3000 },
  ],
  'RAYON-C': [
    { serviceTier: 'regular', baseFare: 75000, pricePerKm: 1500 },
    { serviceTier: 'executive', baseFare: 115000, pricePerKm: 2000 },
    { serviceTier: 'vip', baseFare: 190000, pricePerKm: 3000 },
  ],
  'RAYON-D': [
    { serviceTier: 'regular', baseFare: 90000, pricePerKm: 1500 },
    { serviceTier: 'executive', baseFare: 130000, pricePerKm: 2000 },
    { serviceTier: 'vip', baseFare: 220000, pricePerKm: 3000 },
  ],
};

/**
 * Calculates fare based on rayon, pickup point, service tier, and number of seats
 * Formula: (Base Fare + (Distance in KM * Price Per KM)) * Number of Seats
 */
export function calculateShuttleFare(
  rayonName: string,
  pickupPointName: string,
  serviceTier: 'regular' | 'executive' | 'vip',
  seatCount: number = 1,
  // These would ideally come from DB, but keeping as fallback
  overrides?: { baseFare?: number; pricePerKm?: number }
): number {
  const rayon = RAYON_DATA.find(r => r.name === rayonName);
  if (!rayon) return 0;

  const pointIndex = rayon.points.findIndex(p => p.place === pickupPointName);
  if (pointIndex === -1) return 0;

  // Cumulative distance from the selected point to KNO (last point)
  let totalDistanceMtr = 0;
  for (let i = pointIndex + 1; i < rayon.points.length; i++) {
    totalDistanceMtr += rayon.points[i].dist;
  }

  const distanceKm = totalDistanceMtr / 1000;
  const rules = FARE_RULES[rayonName] || FARE_RULES['RAYON-A'];
  const rule = rules.find(r => r.serviceTier === serviceTier) || rules[0];

  const baseFare = overrides?.baseFare ?? rule.baseFare;
  const pricePerKm = overrides?.pricePerKm ?? rule.pricePerKm;

  // Real-time calculation: (Base + (Dist * Price/Km)) * Seats
  const farePerPerson = baseFare + (distanceKm * pricePerKm);
  const totalFare = farePerPerson * seatCount;
  
  // Round to nearest 500
  return Math.round(totalFare / 500) * 500;
}

/**
 * Gets total distance from a point to KNO
 */
export function getDistanceToKNO(rayonName: string, pickupPointName: string): number {
  const rayon = RAYON_DATA.find(r => r.name === rayonName);
  if (!rayon) return 0;

  const pointIndex = rayon.points.findIndex(p => p.place === pickupPointName);
  if (pointIndex === -1) return 0;

  let totalDistanceMtr = 0;
  for (let i = pointIndex + 1; i < rayon.points.length; i++) {
    totalDistanceMtr += rayon.points[i].dist;
  }

  return totalDistanceMtr;
}
