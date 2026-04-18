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

  describe('Distance Logic Consistency', () => {
    const points: PickupPoint[] = [
      { id: 'p1', rayon_id: 'z1', place_name: 'Start', time_wib: '06:00', distance_from_previous_mtr: 0, cumulative_distance_mtr: 0, jarak_ke_kno: 50, is_active: true, created_at: '', updated_at: '' },
      { id: 'p2', rayon_id: 'z1', place_name: 'Mid', time_wib: '06:30', distance_from_previous_mtr: 10000, cumulative_distance_mtr: 10000, jarak_ke_kno: 40, is_active: true, created_at: '', updated_at: '' },
      { id: 'p3', rayon_id: 'z1', place_name: 'KNO', time_wib: '07:30', distance_from_previous_mtr: 40000, cumulative_distance_mtr: 50000, jarak_ke_kno: 0, is_active: true, created_at: '', updated_at: '' }
    ];

    it('should have consistent distances across the route', () => {
      // Total route distance from first point to KNO should match cumulative_distance_mtr at KNO
      const totalDistMtr = points[points.length - 1].cumulative_distance_mtr;
      expect(totalDistMtr).toBe(50000);

      // Jarak ke KNO at any point should be (TotalDist - CumulativeDist) / 1000
      points.forEach(p => {
        const expectedJarakKno = (totalDistMtr - p.cumulative_distance_mtr) / 1000;
        expect(p.jarak_ke_kno).toBe(expectedJarakKno);
      });
    });

    it('should ensure time order is logical', () => {
      for (let i = 1; i < points.length; i++) {
        const prevTime = points[i-1].time_wib;
        const currTime = points[i].time_wib;
        expect(currTime > prevTime).toBe(true);
      }
    });
  });
});
