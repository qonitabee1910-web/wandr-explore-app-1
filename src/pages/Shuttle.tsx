import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Pencil, ChevronRight, Clock, Users, ShieldCheck, Star, Bus } from "lucide-react";
import Layout from "@/components/Layout";
import SeatMap from "@/components/shuttle/SeatMap";
import { type Seat } from "@/data/seatLayout";
import { RAYON_DATA } from "@/data/rayonPoints";
import { calculateShuttleFare, getDistanceToKNO } from "@/services/fareService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/data/dummyData";
import { useUserAuth } from "@/context/UserAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Schedule {
  id: string;
  departure_time: string;
  arrival_time: string;
  price_regular: number;
  price_executive: number;
  price_vip: number;
  available_seats: number;
  vehicle: {
    id: string;
    name: string;
    image_url: string | null;
    layout: any;
  };
  route: {
    name: string;
    origin: string;
    destination: string;
  };
}

type ServiceTier = "regular" | "executive" | "vip";

const Shuttle = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useUserAuth();

  // Search parameters
  const originParam = searchParams.get("origin");
  const destParam = searchParams.get("destination");
  const dateParam = searchParams.get("date");

  // State
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedTier, setSelectedTier] = useState<ServiceTier>("regular");
  const [selectedRayon, setSelectedRayon] = useState<string>("RAYON-A");
  const [selectedRayonId, setSelectedRayonId] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string>("");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"schedule" | "seats">("schedule");

  const [rayonZones, setRayonZones] = useState<any[]>([]);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);

  useEffect(() => {
    const fetchRayonData = async () => {
      const { data: zones } = await supabase.from('rayon_zones').select('*');
      const { data: points } = await supabase.from('pickup_points').select('*').eq('is_active', true);
      if (zones) setRayonZones(zones);
      if (points) setPickupPoints(points);
    };
    fetchRayonData();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("shuttle_schedules")
          .select(`
            id, departure_time, arrival_time, price_regular, price_executive, price_vip, available_seats,
            vehicle:vehicles(id, name, image_url, layout),
            route:shuttle_routes(name, origin, destination)
          `)
          .eq("is_active", true);

        const { data, error } = await query;

        if (error) throw error;
        if (data) {
          let filtered = data as unknown as Schedule[];
          
          // Client-side filtering for better UX with dynamic routes
          if (originParam || destParam) {
            filtered = filtered.filter(s => {
              const matchesOrigin = !originParam || s.route.origin.toLowerCase().includes(originParam.toLowerCase());
              const matchesDest = !destParam || s.route.destination.toLowerCase().includes(destParam.toLowerCase());
              return matchesOrigin && matchesDest;
            });
          }
          
          setSchedules(filtered);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [originParam, destParam]);

  const toggleSeat = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const currentPrice = useMemo(() => {
    if (!selectedSchedule) return 0;
    
    // If it's a KNO route, use rayon-based calculation
    if (selectedSchedule.route.destination.toLowerCase().includes("kno") || 
        selectedSchedule.route.origin.toLowerCase().includes("kno")) {
      if (selectedPoint) {
        // Automatically compute based on 1 seat for unit price
        const zone = rayonZones.find(z => z.id === selectedRayonId);
        const point = pickupPoints.find(p => p.id === selectedPointId);
        
        if (zone && point) {
          const baseFare = selectedTier === 'vip' ? zone.base_fare_vip : (selectedTier === 'executive' ? zone.base_fare_executive : zone.base_fare_regular);
          const pricePerKm = selectedTier === 'vip' ? zone.price_per_km_vip : (selectedTier === 'executive' ? zone.price_per_km_executive : zone.price_per_km_regular);
          return (baseFare || 0) + ((point.jarak_ke_kno || 0) * (pricePerKm || 0));
        }
        return calculateShuttleFare(selectedRayon, selectedPoint, selectedTier, 1);
      }
    }

    if (selectedTier === "vip") return selectedSchedule.price_vip;
    if (selectedTier === "executive") return selectedSchedule.price_executive;
    return selectedSchedule.price_regular;
  }, [selectedSchedule, selectedTier, selectedRayon, selectedPoint, selectedIds.length]);

    const total = selectedIds.length * currentPrice;

  const handleContinue = () => {
    if (selectedIds.length === 0 || !selectedSchedule) return;
    
    const seats = (selectedSchedule.vehicle.layout as Seat[])
      .filter(s => selectedIds.includes(s.id))
      .map(s => s.label)
      .join(", ");

    const params = new URLSearchParams({
      type: "shuttle",
      schedule_id: selectedSchedule.id,
      tier: selectedTier,
      rayon: selectedRayon,
      rayon_id: selectedRayonId || "",
      pickup: selectedPoint,
      pickup_id: selectedPointId || "",
      name: `${selectedSchedule.route.origin} → ${selectedSchedule.route.destination}`,
      room: `${selectedTier.toUpperCase()} - Kursi ${seats}${selectedPoint ? ` (${selectedPoint})` : ""}`,
      price: String(total),
    });
    navigate(`/booking?${params.toString()}`);
  };

  if (step === "schedule") {
    return (
      <Layout>
        <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
          <div className="container mx-auto px-4 flex items-center gap-3">
            <Link to="/" aria-label="Kembali">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">Pilih Jadwal</h1>
              <p className="text-[10px] opacity-80">
                {originParam || "Semua"} → {destParam || "Semua"} • {dateParam || "Hari ini"}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-32">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-20">
              <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Tidak ada jadwal tersedia untuk rute ini.</p>
              <Button variant="link" onClick={() => navigate("/")}>Cari rute lain</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((s) => (
                <Card 
                  key={s.id} 
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all hover:shadow-md border-2",
                    selectedSchedule?.id === s.id ? "border-primary bg-primary/5" : "border-transparent"
                  )}
                  onClick={() => setSelectedSchedule(s)}
                >
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold">{s.departure_time.split('T')[1].substring(0, 5)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Berangkat</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-[1px] bg-muted-foreground/30 relative">
                            <ChevronRight className="w-3 h-3 absolute -right-1 -top-1.5 text-muted-foreground/50" />
                          </div>
                          <Clock className="w-3 h-3 text-muted-foreground/50 my-1" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">{s.arrival_time.split('T')[1].substring(0, 5)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Tiba</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{formatCurrency(s.price_regular)}</p>
                        <p className="text-[10px] text-muted-foreground">Mulai dari</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 px-4 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Bus className="w-3 h-3" /> {s.vehicle.name}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.available_seats} Kursi</span>
                      </div>
                      <Badge variant={s.available_seats < 5 ? "destructive" : "secondary"} className="text-[10px]">
                        {s.available_seats < 5 ? "Hampir Penuh" : "Tersedia"}
                      </Badge>
                    </div>

                    {selectedSchedule?.id === s.id && (
                      <div className="p-4 border-t bg-background space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Pilih Tipe Layanan</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "regular", label: "Reguler", price: s.price_regular, icon: Bus, color: "bg-blue-500" },
                            { id: "executive", label: "Executive", price: s.price_executive, icon: ShieldCheck, color: "bg-purple-500" },
                            { id: "vip", label: "VIP", price: s.price_vip, icon: Star, color: "bg-amber-500" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              className={cn(
                                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                                selectedTier === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTier(t.id as ServiceTier);
                              }}
                            >
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-1", t.color)}>
                                <t.icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-[10px] font-bold">{t.label}</span>
                              <span className="text-[10px] text-primary font-bold">
                                {formatCurrency(
                                  (s.route.destination.toLowerCase().includes("kno") || s.route.origin.toLowerCase().includes("kno")) && selectedPoint
                                    ? calculateShuttleFare(selectedRayon, selectedPoint, t.id as ServiceTier, 1)
                                    : (t.id === "vip" ? s.price_vip : t.id === "executive" ? s.price_executive : s.price_regular)
                                )}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Rayon & Pickup Point Selection */}
                        {(s.route.destination.toLowerCase().includes("kno") || s.route.origin.toLowerCase().includes("kno")) && (
                          <div className="space-y-3 p-3 bg-muted/20 rounded-xl border border-dashed animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <p className="text-[11px] font-bold uppercase text-muted-foreground">Pilih Lokasi Penjemputan (Rayon)</p>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {rayonZones.map(r => (
                                <button
                                  key={r.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRayon(r.name);
                                    setSelectedRayonId(r.id);
                                    setSelectedPoint(""); // Reset point when rayon changes
                                    setSelectedPointId(null);
                                  }}
                                  className={cn(
                                    "px-2 py-1.5 rounded-md text-[10px] font-bold border transition-all",
                                    selectedRayon === r.name ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
                                  )}
                                >
                                  {r.name.split('-')[1]}
                                </button>
                              ))}
                            </div>
                            <select
                              className="w-full bg-background border rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                              value={selectedPoint}
                              onChange={(e) => {
                                e.stopPropagation();
                                const point = pickupPoints.find(p => p.place_name === e.target.value);
                                setSelectedPoint(e.target.value);
                                setSelectedPointId(point?.id || null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">-- Pilih Titik Penjemputan --</option>
                              {pickupPoints
                                .filter(p => p.rayon_id === selectedRayonId && !p.place_name.toLowerCase().includes('kno') && !p.place_name.toLowerCase().includes('kualanamu'))
                                .map(p => (
                                  <option key={p.id} value={p.place_name}>{p.place_name} ({p.time_wib.slice(0, 5)})</option>
                                ))}
                            </select>
                            {selectedPoint && (
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-muted-foreground">Jarak ke KNO:</span>
                                <span className="text-[10px] font-bold text-primary">
                                  {pickupPoints.find(p => p.id === selectedPointId)?.jarak_ke_kno || 0} km
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <Button 
                          className="w-full" 
                          onClick={() => setStep("seats")}
                          disabled={(s.route.destination.toLowerCase().includes("kno") || s.route.origin.toLowerCase().includes("kno")) && !selectedPoint}
                        >
                          {(!selectedPoint && (s.route.destination.toLowerCase().includes("kno") || s.route.origin.toLowerCase().includes("kno"))) 
                            ? "Pilih Lokasi Dulu" 
                            : "Pilih Kursi"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Seat selection step
  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <button onClick={() => setStep("schedule")} aria-label="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Pilih Kursi {selectedTier.toUpperCase()}</h1>
            <p className="text-[10px] opacity-80">
              {selectedSchedule?.route.origin} → {selectedSchedule?.route.destination} • {selectedSchedule?.departure_time.split('T')[1].substring(0, 5)}
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/seat-editor" className="opacity-90 hover:opacity-100">
              <Pencil className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-xl pb-40">
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bus className="w-4 h-4 text-primary" /> {selectedSchedule?.vehicle.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            <p className="text-xs text-center text-muted-foreground mb-6">
              Tap kursi untuk memilih (Maksimal 4 kursi)
            </p>

            <SeatMap
              seats={selectedSchedule?.vehicle.layout as Seat[] || []}
              selectedIds={selectedIds}
              onToggle={toggleSeat}
              baseImageUrl={selectedSchedule?.vehicle.image_url}
            />

            <div className="flex items-center justify-center gap-6 mt-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm border bg-background" />
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary" />
                <span>Pilihan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-destructive/50" />
                <span>Terisi</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="container mx-auto px-4 py-4 max-w-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                {selectedIds.length} Kursi Dipilih
              </p>
              <p className="text-xl font-black text-primary">
                {formatCurrency(total)}
              </p>
            </div>
            <Button
              onClick={handleContinue}
              disabled={selectedIds.length === 0}
              size="lg"
              className="px-8 font-bold"
            >
              Lanjut Ke Pembayaran
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shuttle;
