import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { ShuttleProvider, useShuttle } from '@/context/ShuttleContext';
import { RayonSelection } from '@/components/shuttle/RayonSelection';
import { ScheduleSelection } from '@/components/shuttle/ScheduleSelection';
import { PickupPointSelection } from '@/components/shuttle/PickupPointSelection';
import { ServiceSelection } from '@/components/shuttle/ServiceSelection';
import { VehicleSelection } from '@/components/shuttle/VehicleSelection';
import { SeatSelection } from '@/components/shuttle/SeatSelection';
import { BookingConfirmation } from '@/components/shuttle/BookingConfirmation';
import { BookingSuccess } from '@/components/shuttle/BookingSuccess';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { shuttleRayons } from '@/data/shuttleModule';

const ShuttleBookingContent: React.FC = () => {
  const { state, setRayon } = useShuttle();
  const [searchParams] = useSearchParams();
  const rayonId = searchParams.get('rayon');

  useEffect(() => {
    if (rayonId && !state.selectedRayon) {
      const rayon = shuttleRayons.find(r => r.id === rayonId);
      if (rayon) {
        setRayon(rayon);
      }
    }
  }, [rayonId, setRayon, state.selectedRayon]);

  const renderStep = () => {
    switch (state.step) {
      case 1: return <RayonSelection />;
      case 2: return <ScheduleSelection />;
      case 3: return <PickupPointSelection />;
      case 4: return <ServiceSelection />;
      case 5: return <VehicleSelection />;
      case 6: return <SeatSelection />;
      case 7: return <BookingConfirmation />;
      case 9: return <BookingSuccess />;
      default: return <RayonSelection />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10 flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Booking Shuttle</h1>
            <p className="text-muted-foreground text-sm font-medium">Sistem Pemesanan Terpadu • {state.selectedRayon?.destination || 'KNO'}</p>
         </div>
         <div className="hidden md:flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div 
                key={s} 
                className={`w-3 h-3 rounded-full transition-all duration-500 ${state.step >= s ? 'bg-primary w-8' : 'bg-muted'}`} 
              />
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ShuttleBookingPage: React.FC = () => {
  return (
    <Layout>
      <ShuttleProvider>
        <ShuttleBookingContent />
      </ShuttleProvider>
    </Layout>
  );
};

export default ShuttleBookingPage;
