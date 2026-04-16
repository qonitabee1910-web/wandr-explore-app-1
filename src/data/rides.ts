import { Ride } from "../types";

export const rides: Ride[] = [
  {
    id: "1",
    name: "Ride Car",
    type: "Car",
    capacity: 4,
    basePrice: 15000,
    pricePerKm: 5000,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Ride Bike",
    type: "Bike",
    capacity: 1,
    basePrice: 5000,
    pricePerKm: 2500,
    image: "https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Ride Luxury",
    type: "Luxury Car",
    capacity: 4,
    basePrice: 30000,
    pricePerKm: 10000,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&h=100&fit=crop",
  },
];
