import { calculateHaversineDistance } from '../lib/geoUtils';

/**
 * Seed data for Rayon and Pickup Points with precise coordinates and pre-calculated distances to KNO.
 * KNO Coordinates: { lat: 3.6422, lng: 98.8853 }
 */

export interface SeedPickupPoint {
  place_name: string;
  lat: number;
  lng: number;
  jarak_ke_kno: number;
  time_wib: string;
}

export interface SeedRayon {
  name: string;
  description: string;
  points: SeedPickupPoint[];
}

const rawSeedData = [
  {
    name: "RAYON-A",
    description: "Zona Medan Kota - Pusat Bisnis",
    points: [
      { place_name: "Hermes Palace", lat: 3.5852, lng: 98.6750, time: "06:00" },
      { place_name: "Kama Hotel", lat: 3.5910, lng: 98.6780, time: "06:05" },
      { place_name: "Istana Maimun", lat: 3.5752, lng: 98.6833, time: "06:31" },
      { place_name: "Mesjid Raya", lat: 3.5745, lng: 98.6865, time: "06:34" },
    ]
  },
  {
    name: "RAYON-B",
    description: "Zona Medan Barat - Pemukiman & Hotel",
    points: [
      { place_name: "Cambridge", lat: 3.5867, lng: 98.6650, time: "06:00" },
      { place_name: "Four Point", lat: 3.5960, lng: 98.6550, time: "06:15" },
      { place_name: "Manhattan", lat: 3.5930, lng: 98.6250, time: "06:25" },
    ]
  },
  {
    name: "RAYON-C",
    description: "Zona Medan Utara - Akses Tol",
    points: [
      { place_name: "Adi Mulia", lat: 3.5920, lng: 98.6710, time: "06:00" },
      { place_name: "Santika", lat: 3.5925, lng: 98.6700, time: "06:03" },
      { place_name: "JW Marriot", lat: 3.5975, lng: 98.6760, time: "06:23" },
    ]
  },
  {
    name: "RAYON-D",
    description: "Zona Medan Selatan - Pendidikan & RS",
    points: [
      { place_name: "Hotel TD Pardede", lat: 3.5710, lng: 98.6620, time: "06:00" },
      { place_name: "Rumah Sakit USU", lat: 3.5640, lng: 98.6540, time: "06:45" },
      { place_name: "Citra Garden", lat: 3.5420, lng: 98.6430, time: "07:23" },
    ]
  }
];

export const FINAL_SEED_DATA: SeedRayon[] = rawSeedData.map(rayon => ({
  ...rayon,
  points: rayon.points.map(p => ({
    place_name: p.place_name,
    lat: p.lat,
    lng: p.lng,
    time_wib: p.time,
    jarak_ke_kno: calculateHaversineDistance(p.lat, p.lng)
  }))
}));
