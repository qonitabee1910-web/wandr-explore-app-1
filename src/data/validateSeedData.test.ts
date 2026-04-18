import { calculateHaversineDistance, KNO_COORDS } from '../lib/geoUtils';
import { FINAL_SEED_DATA } from './finalSeedData';

/**
 * Validation Script for Rayon Data Migration
 */

function runValidation() {
  console.log("--- Starting Rayon Data Validation ---");
  let totalErrors = 0;

  FINAL_SEED_DATA.forEach(rayon => {
    console.log(`Checking ${rayon.name}...`);
    
    rayon.points.forEach(point => {
      // 1. Check for null values
      if (point.lat === null || point.lng === null || point.jarak_ke_kno === null) {
        console.error(`[FAIL] ${point.place_name}: Missing coordinates or distance.`);
        totalErrors++;
      }

      // 2. Check distance accuracy (±0.5 KM tolerance)
      const recalculated = calculateHaversineDistance(point.lat, point.lng);
      const diff = Math.abs(recalculated - point.jarak_ke_kno);
      
      if (diff > 0.5) {
        console.error(`[FAIL] ${point.place_name}: Distance mismatch! Seed: ${point.jarak_ke_kno}, Calc: ${recalculated}, Diff: ${diff}`);
        totalErrors++;
      } else {
        console.log(`[PASS] ${point.place_name}: ${point.jarak_ke_kno} KM to KNO`);
      }
    });
  });

  if (totalErrors === 0) {
    console.log("--- VALIDATION SUCCESSFUL: All data seed points are valid and accurate. ---");
  } else {
    console.error(`--- VALIDATION FAILED: ${totalErrors} errors found. ---`);
  }
}

// In a real environment, this would be part of a Vitest/Jest suite
// For now, we provide the logic as requested
// runValidation();
