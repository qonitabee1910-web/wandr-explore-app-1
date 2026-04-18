import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, KNO_COORDS } from '../lib/geoUtils';
import { FINAL_SEED_DATA } from './finalSeedData';

describe('Rayon Data Validation', () => {
  FINAL_SEED_DATA.forEach(rayon => {
    describe(`Validation for ${rayon.name}`, () => {
      rayon.points.forEach(point => {
        it(`should have valid data for ${point.place_name}`, () => {
          // 1. Check for valid values
          expect(point.lat).not.toBeNull();
          expect(point.lng).not.toBeNull();
          expect(point.jarak_ke_kno).not.toBeNull();

          // 2. Check distance accuracy (±0.5 KM tolerance)
          const recalculated = calculateHaversineDistance(point.lat, point.lng);
          const diff = Math.abs(recalculated - point.jarak_ke_kno);
          
          expect(diff).toBeLessThanOrEqual(0.5);
        });
      });
    });
  });
});
