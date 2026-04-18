import { describe, it, expect } from 'vitest';
import { calculateFareFromDb } from '../services/fareService';
import { RayonZone, PickupPoint } from '../types/shuttle-booking';

describe('Pickup and Distance Logic', () => {
  const mockZone: RayonZone = {
    id: 'z1',
    name: 'RAYON-A',
    base_fare_regular: 80000,
    base_fare_executive: 120000,
    base_fare_vip: 180000,
    price_per_km_regular: 1500,
    price_per_km_executive: 2500,
    price_per_km_vip: 4000,
    created_at: '',
    updated_at: ''
  };

  const mockPoint: PickupPoint = {
    id: 'p1',
    rayon_id: 'z1',
    place_name: 'Test Point',
    time_wib: '06:00',
    distance_from_previous_mtr: 0,
    cumulative_distance_mtr: 0,
    jarak_ke_kno: 30, // 30 km
    is_active: true,
    created_at: '',
    updated_at: ''
  };

  it('should calculate fare correctly using DB objects for Regular', () => {
    // Formula: (80000 + (30 * 1500)) * 1 = 80000 + 45000 = 125000
    const fare = calculateFareFromDb(mockZone, mockPoint, 'regular', 1);
    expect(fare).toBe(125000);
  });

  it('should calculate fare correctly using DB objects for Executive with 2 seats', () => {
    // Formula: (120000 + (30 * 2500)) * 2 = (120000 + 75000) * 2 = 195000 * 2 = 390000
    const fare = calculateFareFromDb(mockZone, mockPoint, 'executive', 2);
    expect(fare).toBe(390000);
  });

  it('should calculate fare correctly using DB objects for VIP', () => {
    // Formula: (180000 + (30 * 4000)) * 1 = 180000 + 120000 = 300000
    const fare = calculateFareFromDb(mockZone, mockPoint, 'vip', 1);
    expect(fare).toBe(300000);
  });

  it('should return 0 if zone or point is missing', () => {
    expect(calculateFareFromDb(null as any, mockPoint, 'regular')).toBe(0);
    expect(calculateFareFromDb(mockZone, null as any, 'regular')).toBe(0);
  });

  it('should handle rounding to nearest 500', () => {
    const pointWithOddDist: PickupPoint = { ...mockPoint, jarak_ke_kno: 30.123 };
    // Regular: 80000 + (30.123 * 1500) = 80000 + 45184.5 = 125184.5
    // Rounded to nearest 500: 125000
    const fare = calculateFareFromDb(mockZone, pointWithOddDist, 'regular', 1);
    expect(fare).toBe(125000);
  });
});
