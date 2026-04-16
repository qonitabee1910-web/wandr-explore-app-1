import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HotelFiltersProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  starFilter: string;
  setStarFilter: (val: string) => void;
  isDesktop?: boolean;
}

export const HotelFilters = ({ 
  sortBy, 
  setSortBy, 
  starFilter, 
  setStarFilter, 
  isDesktop 
}: HotelFiltersProps) => {
  if (isDesktop) {
    return (
      <aside className="hidden lg:block w-64 shrink-0 space-y-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Urutkan</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Harga Terendah</SelectItem>
                    <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bintang</label>
                <div className="space-y-2">
                  {["all", "5", "4", "3"].map((star) => (
                    <Button
                      key={star}
                      variant={starFilter === star ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setStarFilter(star)}
                    >
                      {star === "all" ? "Semua Bintang" : `⭐ ${star} Bintang`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <div className="flex lg:hidden flex-wrap gap-3 mb-6 items-center">
      <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-asc">Harga Terendah</SelectItem>
          <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
          <SelectItem value="rating">Rating Tertinggi</SelectItem>
        </SelectContent>
      </Select>
      <Select value={starFilter} onValueChange={setStarFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Bintang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bintang</SelectItem>
          <SelectItem value="5">⭐ 5 Bintang</SelectItem>
          <SelectItem value="4">⭐ 4 Bintang</SelectItem>
          <SelectItem value="3">⭐ 3 Bintang</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
