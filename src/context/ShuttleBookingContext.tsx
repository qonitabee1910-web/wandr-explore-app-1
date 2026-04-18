import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShuttleBookingSession, ShuttleRoute, ShuttleSchedule, ServiceType, ShuttleBooking, Vehicle } from '@/types/shuttle-booking';

interface ShuttleBookingContextType {
  session: ShuttleBookingSession;
  setSelectedRoute: (route: ShuttleRoute) => void;
  setSelectedSchedule: (schedule: ShuttleSchedule) => void;
  setSelectedService: (service: ServiceType) => void;
  setSelectedCar: (car: Vehicle) => void;
  toggleSeat: (seatId: string) => void;
  setPassengerInfo: (name: string, phone: string, email?: string) => void;
  calculateTotal: () => number;
  goToStep: (step: ShuttleBookingSession['step']) => void;
  resetBooking: () => void;
  setBookingData: (booking: ShuttleBooking) => void;
}

const ShuttleBookingContext = createContext<ShuttleBookingContextType | undefined>(undefined);

const initialSession: ShuttleBookingSession = {
  step: 'route',
  selectedSeats: [],
  passengerName: '',
  passengerPhone: '',
  totalPrice: 0,
};

export const ShuttleBookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ShuttleBookingSession>(initialSession);

  const setSelectedRoute = useCallback((route: ShuttleRoute) => {
    setSession((prev) => ({
      ...prev,
      selectedRoute: route,
      step: 'schedule',
    }));
  }, []);

  const setSelectedSchedule = useCallback((schedule: ShuttleSchedule) => {
    setSession((prev) => ({
      ...prev,
      selectedSchedule: schedule,
      step: 'service',
    }));
  }, []);

  const setSelectedService = useCallback((service: ServiceType) => {
    setSession((prev) => ({
      ...prev,
      selectedService: service,
      step: 'car',
      selectedSeats: [],
    }));
  }, []);

  const setSelectedCar = useCallback((car: Vehicle) => {
    setSession((prev) => ({
      ...prev,
      selectedCar: car,
      step: 'seats',
      selectedSeats: [],
    }));
  }, []);

  const toggleSeat = useCallback((seatId: string) => {
    setSession((prev) => ({
      ...prev,
      selectedSeats: prev.selectedSeats.includes(seatId)
        ? prev.selectedSeats.filter((s) => s !== seatId)
        : [...prev.selectedSeats, seatId],
    }));
  }, []);

  const setPassengerInfo = useCallback((name: string, phone: string, email?: string) => {
    setSession((prev) => ({
      ...prev,
      passengerName: name,
      passengerPhone: phone,
      passengerEmail: email,
      step: 'confirm',
    }));
  }, []);

  const calculateTotal = useCallback(() => {
    if (!session.selectedSchedule || !session.selectedService) return 0;
    // Pricing is now dynamic and calculated in the UI components 
    // or fetched based on Rayon/Pickup point.
    return 0;
  }, [session.selectedSchedule, session.selectedService, session.selectedSeats]);

  const goToStep = useCallback((step: ShuttleBookingSession['step']) => {
    setSession((prev) => ({
      ...prev,
      step,
    }));
  }, []);

  const resetBooking = useCallback(() => {
    setSession(initialSession);
  }, []);

  const setBookingData = useCallback((booking: ShuttleBooking) => {
    setSession((prev) => ({
      ...prev,
      booking,
      step: 'ticket',
    }));
  }, []);

  const value: ShuttleBookingContextType = {
    session,
    setSelectedRoute,
    setSelectedSchedule,
    setSelectedService,
    setSelectedCar,
    toggleSeat,
    setPassengerInfo,
    calculateTotal,
    goToStep,
    resetBooking,
    setBookingData,
  };

  return (
    <ShuttleBookingContext.Provider value={value}>
      {children}
    </ShuttleBookingContext.Provider>
  );
};

export const useShuttleBooking = (): ShuttleBookingContextType => {
  const context = useContext(ShuttleBookingContext);
  if (!context) {
    throw new Error('useShuttleBooking must be used within ShuttleBookingProvider');
  }
  return context;
};
