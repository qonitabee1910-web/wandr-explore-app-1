import { useState } from "react";
import { Search } from "lucide-react";
import Layout from "@/components/Layout";
import { shuttles } from "@/data/shuttles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShuttleCard } from "@/components/shuttle/ShuttleCard";
import { ShuttleFilters } from "@/components/shuttle/ShuttleFilters";

const Shuttle = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");

  const filtered = shuttles
    .filter(
      (f) =>
        f.from.toLowerCase().includes(search.toLowerCase()) ||
        f.to.toLowerCase().includes(search.toLowerCase()) ||
        f.operator.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Cari Tiket Shuttle</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Kota asal, tujuan, atau operator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card text-card-foreground"
              />
            </div>
            <Button variant="secondary" className="shrink-0">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <ShuttleFilters sortBy={sortBy} setSortBy={setSortBy} isDesktop />

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <ShuttleFilters sortBy={sortBy} setSortBy={setSortBy} />

            {/* Results */}
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} shuttle ditemukan</p>

            <div className="space-y-3">
              {filtered.map((shuttle) => (
                <ShuttleCard key={shuttle.id} shuttle={shuttle} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shuttle;
