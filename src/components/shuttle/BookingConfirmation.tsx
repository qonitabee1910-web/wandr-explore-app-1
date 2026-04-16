import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, CreditCard, Smartphone, Banknote, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export const BookingConfirmation: React.FC = () => {
  const { state, prevStep, setPaymentMethod, finalizeBooking } = useShuttle();

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Ringkasan Pesanan</h2>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-primary text-primary-foreground p-6">
           <h3 className="font-bold text-2xl">{state.selectedRayon?.name}</h3>
           <p className="text-sm text-primary-foreground/80 flex items-center gap-1 mt-1">
             <Navigation className="w-4 h-4" /> {state.selectedRayon?.destination}
           </p>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Jadwal</p>
              <p className="font-bold text-lg">{state.selectedSchedule?.departureTime} WIB</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Layanan</p>
              <Badge variant="secondary">{state.selectedService?.tier}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Titik Jemput</p>
              <p className="font-bold text-sm">{state.selectedPickupPoint?.name}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Kursi</p>
              <div className="flex justify-end gap-1 flex-wrap">
                {state.selectedSeats.map(id => (
                  <Badge key={id} variant="outline" className="text-[10px] px-2">
                    {state.selectedVehicle?.layout.seats.find(s => s.id === id)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-muted-foreground/10" />

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'ewallet', label: 'E-Wallet', icon: Smartphone },
                { id: 'card', label: 'Kartu', icon: CreditCard },
                { id: 'va', label: 'Transfer', icon: Banknote },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all
                    ${state.paymentMethod === method.id ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground hover:border-primary/50'}
                  `}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-muted-foreground/10" />

          <div className="p-4 bg-muted/30 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Pembayaran</p>
              <p className="text-2xl font-bold text-primary">{state.totalPrice} IDR</p>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Sudah termasuk pajak dan biaya layanan</p>
          </div>

          <Button 
            className="w-full py-7 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20" 
            disabled={!state.paymentMethod}
            onClick={finalizeBooking}
          >
            Bayar Sekarang <CheckCircle2 className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
