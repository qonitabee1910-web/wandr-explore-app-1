import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShuttleBookingSession, ShuttleRoute, ShuttleSchedule, ServiceType, ShuttleBooking } from '@/types/shuttle-booking';

interface ShuttleBookingContextType {
  session: ShuttleBookingSession;
  setSelectedRoute: (route: ShuttleRoute) => void;
  setSelectedSchedule: (schedule: ShuttleSchedule) => void;
  setSelectedService: (service: ServiceType) => void;
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
    const priceKey = `price_${session.selectedService}` as keyof ShuttleSchedule;
    const pricePerSeat = (session.selectedSchedule[priceKey] as number) || 0;
    return pricePerSeat * session.selectedSeats.length;
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
