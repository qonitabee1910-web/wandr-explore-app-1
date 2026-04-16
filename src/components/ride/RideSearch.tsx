import { Navigation, Calendar, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RideSearchProps {
  pickup: string;
  setPickup: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  rideType: "instant" | "scheduled";
  setRideType: (val: "instant" | "scheduled") => void;
  handleSearch: () => void;
}

export const RideSearch = ({
  pickup,
  setPickup,
  destination,
  setDestination,
  rideType,
  setRideType,
  handleSearch,
}: RideSearchProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="shadow-lg border-none">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
              <Input 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="pl-8 bg-muted/50 border-none focus-visible:ring-1"
                placeholder="Lokasi jemput"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
              <Input 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                autoFocus
                className="pl-8 bg-muted/50 border-none focus-visible:ring-1"
                placeholder="Mau ke mana?"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={rideType === "instant" ? "default" : "outline"} 
              className="flex-1 rounded-full text-xs"
              onClick={() => setRideType("instant")}
            >
              <Navigation className="w-3 h-3 mr-1" /> Instant
            </Button>
            <Button 
              variant={rideType === "scheduled" ? "default" : "outline"} 
              className="flex-1 rounded-full text-xs"
              onClick={() => setRideType("scheduled")}
            >
              <Calendar className="w-3 h-3 mr-1" /> Scheduled
            </Button>
          </div>

          <Button className="w-full rounded-xl py-6 font-bold text-lg" onClick={handleSearch}>
            Cari Driver
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-foreground">Lokasi Terakhir</h3>
        <div className="space-y-2">
          {[
            { name: "Bandung Indah Plaza", addr: "Jl. Merdeka No.56" },
            { name: "Stasiun Bandung", addr: "Jl. Kebon Kawung" },
          ].map((loc, i) => (
            <button 
              key={i} 
              className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors text-left"
              onClick={() => setDestination(loc.name)}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.addr}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
