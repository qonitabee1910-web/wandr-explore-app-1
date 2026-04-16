import { Booking } from "../types";

export const bookingHistory: Booking[] = [
  {
    id: "BK001",
    type: "hotel",
    name: "Grand Hyatt Jakarta",
    date: "12-14 April 2026",
    status: "Confirmed",
    total: 3700000,
    guests: 2,
  },
  {
    id: "BK002",
    type: "shuttle",
    name: "Cititrans CGK → Bandung",
    date: "20 April 2026",
    status: "Completed",
    total: 220000,
    guests: 1,
  },
  {
    id: "BK003",
    type: "hotel",
    name: "Padma Resort Ubud",
    date: "20-23 April 2026",
    status: "Pending",
    total: 7200000,
    guests: 2,
  },
  {
    id: "BK004",
    type: "ride",
    name: "Ride Car - Kemang to Senayan",
    date: "5 Mei 2026",
    status: "Confirmed",
    total: 45000,
    guests: 1,
  },
];
