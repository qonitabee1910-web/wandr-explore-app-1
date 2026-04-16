export interface Room {
  type: string;
  price: number;
  capacity: number;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  rating: number;
  stars: number;
  price: number;
  originalPrice: number;
  image: string;
  facilities: string[];
  reviews: number;
  description: string;
  rooms: Room[];
}

export interface Shuttle {
  id: string;
  operator: string;
  operatorCode: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  originalPrice: number;
  class: string;
  baggage: string;
  cabinBaggage: string;
  meal: boolean;
  transit: number;
}

export interface Ride {
  id: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  pricePerKm: number;
  image: string;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  validUntil: string;
  code: string;
  image: string;
  terms: string[];
}

export interface Booking {
  id: string;
  type: 'hotel' | 'shuttle' | 'ride';
  name: string;
  date: string;
  status: 'Confirmed' | 'Completed' | 'Pending';
  total: number;
  guests: number;
}
