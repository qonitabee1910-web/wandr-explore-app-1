import { useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { shuttleRayons } from "@/data/shuttleModule";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Shuttle = () => {
  const [search, setSearch] = useState("");

  const filtered = shuttleRayons
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.destination.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Pesan Shuttle PYU-GO</h1>
          <p className="text-primary-foreground/80 mb-6">Pilih rayon tujuan untuk memulai pemesanan</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari rayon atau tujuan (misal: KNO)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-card text-card-foreground shadow-lg text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((rayon) => (
            <Link key={rayon.id} to={`/shuttle/booking?rayon=${rayon.id}`}>
              <Card className="hover:border-primary transition-all border-2 group h-full">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{rayon.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        Tujuan <ArrowRight className="w-3 h-3" /> <span className="font-bold text-foreground">{rayon.destination}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">Tersedia</Badge>
                    <p className="text-primary font-bold">Pilih <ArrowRight className="w-4 h-4 inline ml-1" /></p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
            <p className="text-muted-foreground font-medium">Rayon tidak ditemukan</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shuttle;
