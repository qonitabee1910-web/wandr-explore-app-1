/**
 * Data extracted from images for Rayon A, B, C, D
 * Distance is in Meters (Mtr)
 */

export interface RayonPoint {
  j: string;
  place: string;
  time: string;
  dist: number;
}

export interface RayonZone {
  name: string;
  points: RayonPoint[];
}

export const RAYON_DATA: RayonZone[] = [
  {
    name: "RAYON-A",
    points: [
      { j: "J1", place: "Hermes Palace", time: "06:00", dist: 0 },
      { j: "J2", place: "Kama Hotel", time: "06:05", dist: 700 },
      { j: "J3", place: "Travel suite", time: "06:10", dist: 950 },
      { j: "J4", place: "RS Columbia Asia", time: "06:12", dist: 150 },
      { j: "J5", place: "Selecta", time: "06:14", dist: 110 },
      { j: "J6", place: "Danau Toba", time: "06:19", dist: 400 },
      { j: "J7", place: "LePolonia", time: "06:23", dist: 950 },
      { j: "J8", place: "Istana Maimun", time: "06:31", dist: 2000 },
      { j: "J9", place: "Mesjid Raya", time: "06:34", dist: 450 },
      { j: "J10", place: "Grand Antares", time: "06:46", dist: 4100 },
      { j: "J11", place: "Antares", time: "06:53", dist: 2100 },
      { j: "J12", place: "Simp Marendal Amp", time: "07:16", dist: 7100 },
      { j: "J13", place: "RM Khas Mandailing", time: "07:26", dist: 3400 },
      { j: "J14", place: "SimpAmplis", time: "07:39", dist: 4800 },
      { j: "J15", place: "KNO", time: "08:14", dist: 31000 },
    ],
  },
  {
    name: "RAYON-B",
    points: [
      { j: "J1", place: "Cambridge", time: "06:00", dist: 0 },
      { j: "J2", place: "Swiss Bellin Gajah", time: "06:05", dist: 1400 },
      { j: "J3", place: "Grand Darussalam", time: "06:08", dist: 750 },
      { j: "J4", place: "Sulthan Hotel", time: "06:10", dist: 160 },
      { j: "J5", place: "Grand Kanaya", time: "06:12", dist: 160 },
      { j: "J6", place: "Four Point", time: "06:15", dist: 450 },
      { j: "J7", place: "Manhattan", time: "06:25", dist: 3600 },
      { j: "J8", place: "Saka Hotel", time: "06:29", dist: 750 },
      { j: "J9", place: "Grand Jamee", time: "06:33", dist: 950 },
      { j: "J10", place: "Sky View Apart", time: "06:47", dist: 5200 },
      { j: "J11", place: "The K-Hotel", time: "06:58", dist: 3700 },
      { j: "J12", place: "Simpang Pos", time: "07:04", dist: 2000 },
      { j: "J13", place: "Asrama Haji Medan", time: "07:11", dist: 2800 },
      { j: "J14", place: "RS Mitra Sejati", time: "07:16", dist: 1600 },
      { j: "J15", place: "Simpang Marendal", time: "07:28", dist: 4400 },
      { j: "J16", place: "Depan Bus ALS", time: "07:39", dist: 3600 },
      { j: "J17", place: "RS Mitra Medika Amp", time: "07:48", dist: 2800 },
      { j: "J18", place: "Tol/Simpang Amplas", time: "07:52", dist: 1200 },
      { j: "J19", place: "KNO", time: "08:25", dist: 30000 },
    ],
  },
  {
    name: "RAYON-C",
    points: [
      { j: "J1", place: "Adi Mulia", time: "06:00", dist: 0 },
      { j: "J2", place: "Santika", time: "06:03", dist: 450 },
      { j: "J3", place: "Arya Duta", time: "06:05", dist: 240 },
      { j: "J4", place: "Aston Grand City Hall", time: "06:08", dist: 230 },
      { j: "J5", place: "Grand Inna", time: "06:10", dist: 130 },
      { j: "J6", place: "Reiz Suite Artotel", time: "06:13", dist: 450 },
      { j: "J7", place: "Podomoro", time: "06:18", dist: 700 },
      { j: "J8", place: "JW Marriot", time: "06:23", dist: 750 },
      { j: "J9", place: "Emerald Garden", time: "06:28", dist: 750 },
      { j: "J10", place: "Grand Mercure", time: "06:38", dist: 1600 },
      { j: "J11", place: "RS Columbia Asia Aks", time: "06:50", dist: 4800 },
      { j: "J12", place: "Tol Bandar Selamat", time: "06:55", dist: 1300 },
      { j: "J13", place: "Tol KNO", time: "07:30", dist: 20000 },
    ],
  },
  {
    name: "RAYON-D",
    points: [
      { j: "J1", place: "Hotel TD Pardede", time: "06:00", dist: 0 },
      { j: "J2", place: "Hermes Palace", time: "06:10", dist: 2400 },
      { j: "J3", place: "Ibis Styles", time: "06:21", dist: 3500 },
      { j: "J4", place: "Fave Hotel", time: "06:24", dist: 850 },
      { j: "J5", place: "Masjid Al Jihad", time: "06:29", dist: 1300 },
      { j: "J6", place: "Hotel Deli", time: "06:31", dist: 550 },
      { j: "J7", place: "Grand Central", time: "06:33", dist: 350 },
      { j: "J8", place: "Grand Impression Hotel", time: "06:38", dist: 1600 },
      { j: "J9", place: "RAZ Hotel", time: "06:40", dist: 550 },
      { j: "J10", place: "Rumah Sakit USU", time: "06:45", dist: 1600 },
      { j: "J11", place: "Grand Dhika Hotel", time: "07:01", dist: 2000 },
      { j: "J12", place: "Sky View Apart", time: "07:09", dist: 2400 },
      { j: "J13", place: "Simpang Harmonika", time: "07:15", dist: 1800 },
      { j: "J14", place: "Citra Garden", time: "07:23", dist: 3700 },
      { j: "J15", place: "Simpang POS", time: "07:32", dist: 2700 },
      { j: "J16", place: "Asrama Haji", time: "07:39", dist: 2800 },
      { j: "J17", place: "Simpang Amplas", time: "07:55", dist: 5900 },
      { j: "J18", place: "Kualanamu", time: "08:32", dist: 30000 },
    ],
  },
];
