import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { shuttleVehicles } from '../../data/shuttleModule';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, ArrowLeft, Users, Briefcase, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const VehicleSelection: React.FC = () => {
  const { state, setVehicle, prevStep } = useShuttle();
  const vehicles = shuttleVehicles.filter(v => {
    if (state.selectedService?.tier === 'Executive') return v.type === 'Hiace';
    if (state.selectedService?.tier === 'Semi Executive') return v.type === 'SUV';
    return v.type === 'Mini Car';
  });

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Pilih Kendaraan</h2>
      </div>
      <p className="text-sm text-muted-foreground">Layanan: {state.selectedService?.tier} Service</p>
      
      <div className="space-y-4">
        {vehicles.map((vhc) => (
          <Card 
            key={vhc.type} 
            className="cursor-pointer hover:border-primary transition-all border-2"
            onClick={() => setVehicle(vhc)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Car className="text-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{vhc.type}</h3>
                    <p className="text-xs text-muted-foreground">Kapasitas Maksimal {vhc.capacity} Penumpang</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs mb-1">Tersedia</Badge>
                  <p className="text-lg font-bold text-primary">+{vhc.basePrice} IDR</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-bold">{vhc.capacity} Kursi</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-bold">Bagasi Luas</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-bold">Kecepatan</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                 <p className="text-xs text-muted-foreground">Total Estimasi</p>
                 <p className="text-xl font-bold text-primary">
                   {((state.selectedRayon?.basePrice || 0) * (state.selectedService?.priceMultiplier || 1)) + vhc.basePrice} IDR
                 </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
