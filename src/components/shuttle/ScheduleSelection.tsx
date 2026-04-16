import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { shuttleSchedules } from '../../data/shuttleModule';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const ScheduleSelection: React.FC = () => {
  const { state, setSchedule, prevStep } = useShuttle();
  const schedules = shuttleSchedules.filter(s => s.rayonId === state.selectedRayon?.id);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Jadwal Keberangkatan</h2>
      </div>
      <p className="text-sm text-muted-foreground">Rayon: {state.selectedRayon?.name}</p>
      
      <div className="space-y-3">
        {schedules.map((sch) => (
          <Card 
            key={sch.id} 
            className="cursor-pointer hover:border-primary transition-all border-2"
            onClick={() => setSchedule(sch)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Jam Keberangkatan</p>
                  <h3 className="font-bold text-2xl">{sch.departureTime} WIB</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Kursi Tersedia</p>
                <Badge variant={sch.availableSeats > 5 ? "secondary" : "destructive"}>
                  {sch.availableSeats} Sisa
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
