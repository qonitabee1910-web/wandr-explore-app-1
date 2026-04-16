import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Armchair, ArrowLeft, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const SeatSelection: React.FC = () => {
  const { state, toggleSeat, prevStep, nextStep } = useShuttle();
  const vehicle = state.selectedVehicle;
  const layout = vehicle?.layout;

  if (!layout) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Kursi</h2>
      </div>
      <p className="text-sm text-muted-foreground">Kendaraan: {vehicle?.type} | Kapasitas: {vehicle?.capacity} Kursi</p>
      
      <div className="bg-muted/50 p-6 rounded-3xl max-w-sm mx-auto shadow-inner border">
        <div className="mb-8 p-4 bg-white/50 rounded-xl text-center border shadow-sm flex items-center justify-center gap-2">
           <Users className="w-5 h-5 text-muted-foreground" />
           <p className="text-xs font-bold text-muted-foreground">DRIVER</p>
        </div>

        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` 
          }}
        >
          {layout.seats.map((seat) => (
            <div 
              key={seat.id} 
              className={`
                aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all border-2
                ${state.selectedSeats.includes(seat.id) 
                  ? 'bg-primary border-primary text-white shadow-lg scale-110' 
                  : seat.isAvailable 
                    ? 'bg-white border-border hover:border-primary text-muted-foreground' 
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground/30 cursor-not-allowed opacity-50'}
              `}
              onClick={() => seat.isAvailable && toggleSeat(seat.id)}
            >
              <div className="flex flex-col items-center">
                <Armchair className="w-6 h-6" />
                <p className="text-[10px] font-bold mt-1">{seat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-border" />
            <span className="text-muted-foreground">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary shadow-sm" />
            <span className="text-muted-foreground">Dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted opacity-50" />
            <span className="text-muted-foreground">Terisi</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
        <div className="flex justify-between items-center">
           <p className="text-sm font-medium">Kursi Terpilih</p>
           <Badge variant="secondary">{state.selectedSeats.length} Kursi</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.selectedSeats.map(id => (
            <Badge key={id} className="bg-primary text-white px-3 py-1 rounded-lg">
               Kursi {layout.seats.find(s => s.id === id)?.label}
            </Badge>
          ))}
        </div>
        <div className="pt-3 border-t flex justify-between items-center">
           <p className="text-sm text-muted-foreground">Total Harga</p>
           <p className="text-xl font-bold text-primary">{state.totalPrice} IDR</p>
        </div>
      </div>

      <Button 
        className="w-full py-6 rounded-2xl font-bold text-lg shadow-lg" 
        disabled={state.selectedSeats.length === 0}
        onClick={nextStep}
      >
        Konfirmasi Pesanan <CheckCircle2 className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
};
