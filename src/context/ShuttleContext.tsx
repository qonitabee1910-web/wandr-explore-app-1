import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShuttleBookingState, Rayon, ShuttleSchedule, PickupPoint, ShuttleService, ShuttleVehicle } from '../types/shuttle';

interface ShuttleContextType {
  state: ShuttleBookingState;
  setRayon: (rayon: Rayon) => void;
  setSchedule: (schedule: ShuttleSchedule) => void;
  setPickupPoint: (point: PickupPoint) => void;
  setService: (service: ShuttleService) => void;
  setVehicle: (vehicle: ShuttleVehicle) => void;
  toggleSeat: (seatId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  finalizeBooking: () => void;
  setPaymentMethod: (method: string) => void;
}

const initialState: ShuttleBookingState = {
  step: 1,
  selectedRayon: null,
  selectedSchedule: null,
  selectedPickupPoint: null,
  selectedService: null,
  selectedVehicle: null,
  selectedSeats: [],
  totalPrice: 0,
  bookingStatus: 'draft',
  paymentMethod: null,
  ticketId: null,
};

const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

export const ShuttleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ShuttleBookingState>(initialState);

  useEffect(() => {
    let total = 0;
    if (state.selectedRayon) total += state.selectedRayon.basePrice;
    if (state.selectedService) {
      total = total * state.selectedService.priceMultiplier;
    }
    if (state.selectedVehicle) total += state.selectedVehicle.basePrice;
    
    // Multiply by number of seats
    const seatCount = state.selectedSeats.length || 1;
    total = total * seatCount;

    setState(prev => ({ ...prev, totalPrice: total }));
  }, [state.selectedRayon, state.selectedService, state.selectedVehicle, state.selectedSeats]);

  const setRayon = (rayon: Rayon) => {
    setState(prev => ({ 
      ...initialState, 
      selectedRayon: rayon, 
      step: 2 
    }));
  };

  const setSchedule = (schedule: ShuttleSchedule) => {
    setState(prev => ({ ...prev, selectedSchedule: schedule, step: 3 }));
  };

  const setPickupPoint = (point: PickupPoint) => {
    setState(prev => ({ ...prev, selectedPickupPoint: point, step: 4 }));
  };

  const setService = (service: ShuttleService) => {
    setState(prev => ({ ...prev, selectedService: service, step: 5 }));
  };

  const setVehicle = (vehicle: ShuttleVehicle) => {
    setState(prev => ({ ...prev, selectedVehicle: vehicle, step: 6 }));
  };

  const toggleSeat = (seatId: string) => {
    setState(prev => {
      const isSelected = prev.selectedSeats.includes(seatId);
      const newSeats = isSelected 
        ? prev.selectedSeats.filter(id => id !== seatId)
        : [...prev.selectedSeats, seatId];
      return { ...prev, selectedSeats: newSeats };
    });
  };

  const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  
  const setPaymentMethod = (method: string) => {
    setState(prev => ({ ...prev, paymentMethod: method }));
  };

  const finalizeBooking = () => {
    setState(prev => ({ 
      ...prev, 
      bookingStatus: 'paid', 
      ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      step: 9
    }));
  };

  const resetBooking = () => setState(initialState);

  return (
    <ShuttleContext.Provider value={{ 
      state, setRayon, setSchedule, setPickupPoint, setService, 
      setVehicle, toggleSeat, nextStep, prevStep, resetBooking,
      finalizeBooking, setPaymentMethod
    }}>
      {children}
    </ShuttleContext.Provider>
  );
};

export const useShuttle = () => {
  const context = useContext(ShuttleContext);
  if (!context) throw new Error('useShuttle must be used within a ShuttleProvider');
  return context;
};
