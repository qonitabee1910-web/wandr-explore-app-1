// Shuttle Booking Types & Models

export type ServiceType = 'regular' | 'executive' | 'vip';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface ShuttleRoute {
  id: string;
  name: string;
  slug: string;
  origin: string;
  destination: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShuttleSchedule {
  id: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  vehicle_id: string;
  price_regular: number;
  price_executive: number;
  price_vip: number;
  available_seats: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  route?: ShuttleRoute;
  vehicle?: any;
}

export interface ShuttleService {
  id: string;
  code: ServiceType;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface ShuttleBooking {
  id: string;
  booking_code: string;
  schedule_id: string;
  service_type: ServiceType;
  passenger_name: string;
  passenger_phone: string;
  passenger_email?: string;
  seats: string[];
  total_price: number;
  status: BookingStatus;
  payment_method?: string;
  payment_status: PaymentStatus;
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShuttleBookingSession {
  step: 'route' | 'schedule' | 'service' | 'seats' | 'passenger' | 'confirm' | 'payment' | 'ticket';
  selectedRoute?: ShuttleRoute;
  selectedSchedule?: ShuttleSchedule;
  selectedService?: ServiceType;
  selectedSeats: string[];
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  totalPrice: number;
  booking?: ShuttleBooking;
}

export const SERVICE_DESCRIPTIONS: Record<ServiceType, { name: string; description: string; features: string[] }> = {
  regular: {
    name: 'Regular',
    description: 'Kursi standar dengan kenyamanan dasar',
    features: ['Kursi standar', 'AC', 'WiFi gratis', 'Botol minum']
  },
  executive: {
    name: 'Executive',
    description: 'Kursi semi-reclining dengan legrest',
    features: ['Kursi semi-reclining', 'Legrest', 'AC premium', 'WiFi gratis', 'Makanan ringan', 'Selimut']
  },
  vip: {
    name: 'VIP',
    description: 'Kursi fully reclining dengan premium amenities',
    features: ['Kursi fully reclining', 'Bantal/Selimut premium', 'AC premium', 'WiFi ultra', 'Makanan lengkap', 'Toilet mewah', 'Entertainment system']
  }
};
