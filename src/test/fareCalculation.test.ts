import { describe, it, expect } from 'vitest';
import { calculateShuttleFare, getDistanceToKNO } from '../services/fareService';

describe('Shuttle Fare Calculation', () => {
  it('should calculate fare correctly for Rayon-A Regular', () => {
    // Rayon-A J1 (Hermes Palace) to KNO is 58.2km in seed data, 
    // but in hardcoded RAYON_DATA it's calculated from points.
    // Let's test a specific known point.
    
    // In RAYON_DATA (rayonPoints.ts):
    // J14 (SimpAmplis) to J15 (KNO) is 31000m = 31km
    const fare = calculateShuttleFare('RAYON-A', 'SimpAmplis', 'regular', 1);
    
    // Formula: Base (80000) + (31km * 1500) = 80000 + 46500 = 126500
    // Rounded to nearest 500: 126500
    expect(fare).toBe(126500);
  });

  it('should calculate fare correctly for Rayon-B Executive with multiple seats', () => {
    // In RAYON_DATA (rayonPoints.ts):
    // Rayon-B: J18 (Tol/Simpang Amplas) to J19 (KNO) is 30000m = 30km
    const fare = calculateShuttleFare('RAYON-B', 'Tol/Simpang Amplas', 'executive', 2);
    
    // Formula: (Base (125000) + (30km * 2000)) * 2 seats
    // (125000 + 60000) * 2 = 185000 * 2 = 370000
    expect(fare).toBe(370000);
  });

  it('should calculate fare correctly for Rayon-C VIP', () => {
    // Rayon-C: J12 (Tol Bandar Selamat) to J13 (Tol KNO) is 20000m = 20km
    const fare = calculateShuttleFare('RAYON-C', 'Tol Bandar Selamat', 'vip', 1);
    
    // Formula: Base (190000) + (20km * 3000) = 190000 + 60000 = 250000
    expect(fare).toBe(250000);
  });

  it('should return 0 for non-existent rayon or point', () => {
    expect(calculateShuttleFare('NON-EXISTENT', 'Somewhere', 'regular', 1)).toBe(0);
    expect(calculateShuttleFare('RAYON-A', 'NON-EXISTENT-POINT', 'regular', 1)).toBe(0);
  });

  it('should get correct distance to KNO', () => {
    const dist = getDistanceToKNO('RAYON-A', 'SimpAmplis');
    expect(dist).toBe(31000);
  });
});
