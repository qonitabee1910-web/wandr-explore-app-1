import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus, Car, Star, ArrowRight, Tag, ChevronLeft, ChevronRight, MapPin, Calendar, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PromoRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number;
}

interface ShuttleRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  slug: string;
}

const heroBanners = [
  {
    title: "Perjalanan Nyaman Selama Liburan di Medan",
    subtitle: "Shuttle mulai dari Rp 120.000 dengan armada premium",
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=500&fit=crop",
  },
  {
    title: "Ride & Explore Kota",
    subtitle: "Perjalanan aman dan cepat dengan Ride Hailing",
    bg: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=500&fit=crop",
  },
  {
    title: "Promo Spesial Shuttle",
    subtitle: "Diskon hingga 30% untuk pemesanan via aplikasi",
    bg: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=500&fit=crop",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [promos, setPromos] = useState<PromoRow[]>([]);
  
  // Search state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [routes, setRoutes] = useState<ShuttleRoute[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load promos
    supabase
      .from("promos")
      .select("id, title, description, image_url, discount_percent")
      .eq("is_active", true)
      .limit(4)
      .then(({ data }) => {
        if (data) setPromos(data as PromoRow[]);
      });

    // Load routes for suggestions
    supabase
      .from("shuttle_routes")
      .select("id, name, origin, destination, slug")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setRoutes(data as ShuttleRoute[]);
      });
      
    // Click outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);

  const filteredOrigins = Array.from(new Set(routes.map(r => r.origin)))
    .filter(o => o.toLowerCase().includes(origin.toLowerCase()));

  const filteredDestinations = Array.from(new Set(routes.map(r => r.destination)))
    .filter(d => d.toLowerCase().includes(destination.toLowerCase()));

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin,
      destination,
      date
    });
    navigate(`/shuttle?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img src={heroBanners[currentBanner].bg} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/20" />
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pb-20">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold text-primary-foreground mb-2">
                {heroBanners[currentBanner].title}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-primary-foreground/90 mb-6">
                {heroBanners[currentBanner].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-32 right-4 flex gap-2 z-10 hidden md:flex">
          <Button variant="outline" size="icon" className="rounded-full bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20" onClick={prevBanner}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20" onClick={nextBanner}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {heroBanners.map((_, i) => (
            <button key={i} onClick={() => setCurrentBanner(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? "bg-primary-foreground w-6" : "bg-primary-foreground/50"}`} />
          ))}
        </div>
      </section>

      {/* Dynamic Search Card */}
      <section className="container mx-auto px-4 -mt-24 relative z-20 mb-10">
        <Card className="shadow-2xl border-none">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b pb-4 overflow-x-auto scrollbar-hide">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold whitespace-nowrap">
                  <Bus className="w-4 h-4" /> Shuttle
                </button>
                <Link to="/ride" className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:bg-muted rounded-full font-medium whitespace-nowrap">
                  <Car className="w-4 h-4" /> Ride Hailing
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 relative" ref={originRef}>
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Dari</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      placeholder="Kota Asal" 
                      className="pl-10 h-12 bg-muted/30 border-none focus-visible:ring-primary"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setShowOriginSuggestions(true);
                      }}
                      onFocus={() => setShowOriginSuggestions(true)}
                    />
                  </div>
                  {showOriginSuggestions && filteredOrigins.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {filteredOrigins.map(o => (
                        <button 
                          key={o}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors"
                          onClick={() => {
                            setOrigin(o);
                            setShowOriginSuggestions(false);
                          }}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative" ref={destRef}>
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Ke</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      placeholder="Kota Tujuan" 
                      className="pl-10 h-12 bg-muted/30 border-none focus-visible:ring-primary"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setShowDestSuggestions(true);
                      }}
                      onFocus={() => setShowDestSuggestions(true)}
                    />
                  </div>
                  {showDestSuggestions && filteredDestinations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {filteredDestinations.map(d => (
                        <button 
                          key={d}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors"
                          onClick={() => {
                            setDestination(d);
                            setShowDestSuggestions(false);
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      type="date" 
                      className="pl-10 h-12 bg-muted/30 border-none focus-visible:ring-primary"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <Button className="h-12 text-base font-bold shadow-lg shadow-primary/20" onClick={handleSearch}>
                  <Search className="w-5 h-5 mr-2" /> Cari
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rute Populer (static) */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Rute Populer</h2>
          <Link to="/shuttle" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { route: "Jakarta - Bandung (PP)", desc: "Executive • Hiace Premio", price: "Rp 120.000", img: "https://images.unsplash.com/photo-1594132411604-09756157e800?w=800&h=600&fit=crop", rating: "4.9" },
            { route: "Surabaya - Malang", desc: "Semi Executive • Mini Bus", price: "Rp 85.000", img: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=800&h=600&fit=crop", rating: "4.8" },
            { route: "Yogyakarta - Solo", desc: "Regular • Mini Car", price: "Rp 45.000", img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop", rating: "4.7" },
          ].map((r) => (
            <Card key={r.route} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <img src={r.img} alt={r.route} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground truncate">{r.route}</h3>
                <p className="text-xs text-muted-foreground mb-2">{r.desc}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
                  <span className="text-sm font-medium">{r.rating}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">Mulai dari</span>
                  <span className="text-primary font-bold">{r.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Promo (from DB) */}
      {promos.length > 0 && (
        <section className="container mx-auto px-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-pyu-go-orange" /> Promo Terkini
            </h2>
            <Link to="/promos" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {promos.map((promo) => (
              <Link key={promo.id} to="/promos" className="snap-start min-w-[280px] md:min-w-[320px] flex-shrink-0">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {promo.image_url && (
                    <div className="relative h-36">
                      <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {promo.discount_percent}%
                      </div>
                    </div>
                  )}
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm text-foreground truncate">{promo.title}</h3>
                    {promo.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
