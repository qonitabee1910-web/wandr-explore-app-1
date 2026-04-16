import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShuttleFiltersProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  isDesktop?: boolean;
}

export const ShuttleFilters = ({ sortBy, setSortBy, isDesktop }: ShuttleFiltersProps) => {
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
                  </SelectContent>
                </Select>
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
        </SelectContent>
      </Select>
    </div>
  );
};
