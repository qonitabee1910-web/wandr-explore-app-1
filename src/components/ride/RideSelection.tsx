import { Navigation, Clock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ride } from "@/types";
import { formatCurrency } from "@/data/dummyData";

interface RideSelectionProps {
  rides: Ride[];
  pickup: string;
  destination: string;
  selectedRide: string;
  setSelectedRide: (id: string) => void;
  activeRide: Ride;
  handleConfirm: () => void;
}

export const RideSelection = ({
  rides,
  pickup,
  destination,
  selectedRide,
  setSelectedRide,
  activeRide,
  handleConfirm,
}: RideSelectionProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
      <div className="flex-1 bg-muted rounded-2xl mb-6 relative overflow-hidden min-h-[200px] flex items-center justify-center">
         <Navigation className="w-12 h-12 text-primary/20 animate-bounce" />
         <p className="absolute bottom-4 text-xs font-medium text-muted-foreground">Peta rute: {pickup} → {destination}</p>
      </div>

      <Card className="border-none shadow-xl rounded-t-3xl rounded-b-none mt-auto -mx-4">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl">Pilih Layanan</h3>
              <p className="text-xs text-muted-foreground">Estimasi tiba dalam 5 menit</p>
            </div>
            <Badge variant="secondary" className="bg-traveloka-blue-light text-primary">Promo Tersedia</Badge>
          </div>

          <div className="space-y-3">
            {rides.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setSelectedRide(ride.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  selectedRide === ride.id ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img src={ride.image} alt={ride.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold">{ride.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 12 menit • {ride.capacity} Kursi
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(ride.basePrice + (ride.pricePerKm * 5))}</p>
                  <p className="text-[10px] text-muted-foreground line-through">{formatCurrency((ride.basePrice + (ride.pricePerKm * 5)) * 1.2)}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">E-Wallet (Saldo: Rp 500.000)</span>
              </div>
              <button className="text-xs text-primary font-bold">Ganti</button>
            </div>

            <Button className="w-full py-6 rounded-2xl font-bold text-lg" onClick={handleConfirm}>
              Pesan {activeRide.name}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
