/**
 * Data extracted from images for Rayon A, B, C, D
 * Distance is in Meters (Mtr)
 * Coordinates added for geographical mapping
 */

export interface RayonPoint {
  j: string;
  place: string;
  time: string;
  dist: number;
  lat?: number;
  lng?: number;
}

export interface RayonZone {
  name: string;
  points: RayonPoint[];
}

export const RAYON_DATA: RayonZone[] = [
  {
    name: "RAYON-A",
    points: [
      { j: "J1", place: "Hermes Palace", time: "06:00", dist: 0, lat: 3.582154, lng: 98.681840 },
      { j: "J2", place: "Kama Hotel", time: "06:05", dist: 700, lat: 3.585500, lng: 98.683000 },
      { j: "J3", place: "Travel suite", time: "06:10", dist: 950, lat: 3.587000, lng: 98.685000 },
      { j: "J4", place: "RS Columbia Asia", time: "06:12", dist: 150, lat: 3.588500, lng: 98.686000 },
      { j: "J5", place: "Selecta", time: "06:14", dist: 110, lat: 3.589500, lng: 98.687000 },
      { j: "J6", place: "Danau Toba", time: "06:19", dist: 400, lat: 3.581500, lng: 98.688000 },
      { j: "J7", place: "LePolonia", time: "06:23", dist: 950, lat: 3.575000, lng: 98.682000 },
      { j: "J8", place: "Istana Maimun", time: "06:31", dist: 2000, lat: 3.575000, lng: 98.684000 },
      { j: "J9", place: "Mesjid Raya", time: "06:34", dist: 450, lat: 3.575111, lng: 98.687321 },
      { j: "J10", place: "Grand Antares", time: "06:46", dist: 4100, lat: 3.558000, lng: 98.692000 },
      { j: "J11", place: "Antares", time: "06:53", dist: 2100, lat: 3.548000, lng: 98.695000 },
      { j: "J12", place: "Simp Marendal Amp", time: "07:16", dist: 7100, lat: 3.535000, lng: 98.705000 },
      { j: "J13", place: "RM Khas Mandailing", time: "07:26", dist: 3400, lat: 3.528000, lng: 98.710000 },
      { j: "J14", place: "SimpAmplis", time: "07:39", dist: 4800, lat: 3.540000, lng: 98.715000 },
      { j: "J15", place: "KNO", time: "08:14", dist: 31000, lat: 3.636000, lng: 98.883000 },
    ],
  },
  {
    name: "RAYON-B",
    points: [
      { j: "J1", place: "Cambridge", time: "06:00", dist: 0, lat: 3.584769, lng: 98.667519 },
      { j: "J2", place: "Swiss Bellin Gajah", time: "06:05", dist: 1400, lat: 3.588600, lng: 98.661400 },
      { j: "J3", place: "Grand Darussalam", time: "06:08", dist: 750, lat: 3.590000, lng: 98.658000 },
      { j: "J4", place: "Sulthan Hotel", time: "06:10", dist: 160, lat: 3.591000, lng: 98.657000 },
      { j: "J5", place: "Grand Kanaya", time: "06:12", dist: 160, lat: 3.592000, lng: 98.656000 },
      { j: "J6", place: "Four Point", time: "06:15", dist: 450, lat: 3.594000, lng: 98.654000 },
      { j: "J7", place: "Manhattan", time: "06:25", dist: 3600, lat: 3.591010, lng: 98.626520 },
      { j: "J8", place: "Saka Hotel", time: "06:29", dist: 750, lat: 3.588000, lng: 98.625000 },
      { j: "J9", place: "Grand Jamee", time: "06:33", dist: 950, lat: 3.585000, lng: 98.624000 },
      { j: "J10", place: "Sky View Apart", time: "06:47", dist: 5200, lat: 3.565000, lng: 98.635000 },
      { j: "J11", place: "The K-Hotel", time: "06:58", dist: 3700, lat: 3.555000, lng: 98.642000 },
      { j: "J12", place: "Simpang Pos", time: "07:04", dist: 2000, lat: 3.545000, lng: 98.650000 },
      { j: "J13", place: "Asrama Haji Medan", time: "07:11", dist: 2800, lat: 3.535000, lng: 98.658000 },
      { j: "J14", place: "RS Mitra Sejati", time: "07:16", dist: 1600, lat: 3.532000, lng: 98.665000 },
      { j: "J15", place: "Simpang Marendal", time: "07:28", dist: 4400, lat: 3.535000, lng: 98.705000 },
      { j: "J16", place: "Depan Bus ALS", time: "07:39", dist: 3600, lat: 3.538000, lng: 98.712000 },
      { j: "J17", place: "RS Mitra Medika Amp", time: "07:48", dist: 2800, lat: 3.542000, lng: 98.718000 },
      { j: "J18", place: "Tol/Simpang Amplas", time: "07:52", dist: 1200, lat: 3.540000, lng: 98.715000 },
      { j: "J19", place: "KNO", time: "08:25", dist: 30000, lat: 3.636000, lng: 98.883000 },
    ],
  },
  {
    name: "RAYON-C",
    points: [
      { j: "J1", place: "Adi Mulia", time: "06:00", dist: 0, lat: 3.585000, lng: 98.674000 },
      { j: "J2", place: "Santika", time: "06:03", dist: 450, lat: 3.588000, lng: 98.675000 },
      { j: "J3", place: "Arya Duta", time: "06:05", dist: 240, lat: 3.590000, lng: 98.676000 },
      { j: "J4", place: "Aston Grand City Hall", time: "06:08", dist: 230, lat: 3.592000, lng: 98.677000 },
      { j: "J5", place: "Grand Inna", time: "06:10", dist: 130, lat: 3.593000, lng: 98.678000 },
      { j: "J6", place: "Reiz Suite Artotel", time: "06:13", dist: 450, lat: 3.595000, lng: 98.673000 },
      { j: "J7", place: "Podomoro", time: "06:18", dist: 700, lat: 3.595600, lng: 98.672800 },
      { j: "J8", place: "JW Marriot", time: "06:23", dist: 750, lat: 3.597600, lng: 98.674400 },
      { j: "J9", place: "Emerald Garden", time: "06:28", dist: 750, lat: 3.602000, lng: 98.676000 },
      { j: "J10", place: "Grand Mercure", time: "06:38", dist: 1600, lat: 3.605000, lng: 98.685000 },
      { j: "J11", place: "RS Columbia Asia Aks", time: "06:50", dist: 4800, lat: 3.595000, lng: 98.715000 },
      { j: "J12", place: "Tol Bandar Selamat", time: "06:55", dist: 1300, lat: 3.598000, lng: 98.725000 },
      { j: "J13", place: "Tol KNO", time: "07:30", dist: 20000, lat: 3.636000, lng: 98.883000 },
    ],
  },
  {
    name: "RAYON-D",
    points: [
      { j: "J1", place: "Hotel TD Pardede", time: "06:00", dist: 0, lat: 3.578000, lng: 98.662000 },
      { j: "J2", place: "Hermes Palace", time: "06:10", dist: 2400, lat: 3.582154, lng: 98.681840 },
      { j: "J3", place: "Ibis Styles", time: "06:21", dist: 3500, lat: 3.585000, lng: 98.655000 },
      { j: "J4", place: "Fave Hotel", time: "06:24", dist: 850, lat: 3.588000, lng: 98.652000 },
      { j: "J5", place: "Masjid Al Jihad", time: "06:29", dist: 1300, lat: 3.592000, lng: 98.648000 },
      { j: "J6", place: "Hotel Deli", time: "06:31", dist: 550, lat: 3.593000, lng: 98.645000 },
      { j: "J7", place: "Grand Central", time: "06:33", dist: 350, lat: 3.594000, lng: 98.643000 },
      { j: "J8", place: "Grand Impression Hotel", time: "06:38", dist: 1600, lat: 3.596000, lng: 98.638000 },
      { j: "J9", place: "RAZ Hotel", time: "06:40", dist: 550, lat: 3.597000, lng: 98.635000 },
      { j: "J10", place: "Rumah Sakit USU", time: "06:45", dist: 1600, lat: 3.565000, lng: 98.650000 },
      { j: "J11", place: "Grand Dhika Hotel", time: "07:01", dist: 2000, lat: 3.555000, lng: 98.645000 },
      { j: "J12", place: "Sky View Apart", time: "07:09", dist: 2400, lat: 3.565000, lng: 98.635000 },
      { j: "J13", place: "Simpang Harmonika", time: "07:15", dist: 1800, lat: 3.555000, lng: 98.630000 },
      { j: "J14", place: "Citra Garden", time: "07:23", dist: 3700, lat: 3.545000, lng: 98.635000 },
      { j: "J15", place: "Simpang POS", time: "07:32", dist: 2700, lat: 3.545000, lng: 98.650000 },
      { j: "J16", place: "Asrama Haji", time: "07:39", dist: 2800, lat: 3.535000, lng: 98.658000 },
      { j: "J17", place: "Simpang Amplas", time: "07:55", dist: 5900, lat: 3.540000, lng: 98.715000 },
      { j: "J18", place: "Kualanamu", time: "08:32", dist: 30000, lat: 3.636000, lng: 98.883000 },
    ],
  },
];
