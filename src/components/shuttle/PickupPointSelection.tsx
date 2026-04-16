import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const PickupPointSelection: React.FC = () => {
  const { state, setPickupPoint, prevStep } = useShuttle();
  const points = state.selectedRayon?.pickupPoints || [];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Titik Jemput</h2>
      </div>
      <p className="text-sm text-muted-foreground">Rayon: {state.selectedRayon?.name} | Jadwal: {state.selectedSchedule?.departureTime} WIB</p>
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {points.map((point) => (
          <Card 
            key={point.id} 
            className="cursor-pointer hover:border-primary transition-all border-2"
            onClick={() => setPickupPoint(point)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-primary w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{point.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {point.time} WIB
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> {point.distance} Mtr
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant="outline">Pilih</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
