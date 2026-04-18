import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Pencil } from "lucide-react";
import Layout from "@/components/Layout";
import SeatMap from "@/components/shuttle/SeatMap";
import { HIACE_SEATS, SEAT_PRICE } from "@/data/seatLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/data/dummyData";

const ROUTE_NAME = "Bandara Soekarno-Hatta → Jakarta Pusat";
const SCHEDULE = "Hari ini, 14:00 WIB";

const Shuttle = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const selectedLabels = useMemo(
    () =>
      HIACE_SEATS.filter((s) => selectedIds.includes(s.id))
        .map((s) => s.label)
        .join(", "),
    [selectedIds],
  );

  const total = selectedIds.length * SEAT_PRICE;

  const handleContinue = () => {
    if (selectedIds.length === 0) return;
    const params = new URLSearchParams({
      type: "shuttle",
      name: ROUTE_NAME,
      room: `Kursi ${selectedLabels}`,
      price: String(total),
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to="/" aria-label="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight flex-1">Pilih Kursi Shuttle</h1>
          <Link
            to="/shuttle/editor"
            aria-label="Edit layout kursi"
            className="opacity-90 hover:opacity-100"
          >
            <Pencil className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-xl pb-40">
        {/* Route info */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{ROUTE_NAME}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{SCHEDULE}</p>
            </div>
          </CardContent>
        </Card>

        {/* Seat map */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-center text-muted-foreground mb-3">
              Tap kursi untuk memilih
            </p>

            <SeatMap
              seats={HIACE_SEATS}
              selectedIds={selectedIds}
              onToggle={toggle}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border-2 border-primary/40 bg-background" />
                <span className="text-muted-foreground">Tersedia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border-2 border-primary bg-primary" />
                <span className="text-muted-foreground">Pilihan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border-2 border-destructive bg-destructive/80" />
                <span className="text-muted-foreground">Terisi</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky bottom summary */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-background border-t shadow-lg">
        <div className="container mx-auto px-4 py-3 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-xs text-muted-foreground">
                {selectedIds.length > 0
                  ? `Kursi: ${selectedLabels}`
                  : "Belum ada kursi dipilih"}
              </p>
              <p className="text-base font-bold text-primary truncate">
                {formatCurrency(total)}
              </p>
            </div>
            <Button
              onClick={handleContinue}
              disabled={selectedIds.length === 0}
              size="lg"
            >
              Lanjut
            </Button>
          </div>
          <Separator className="opacity-0" />
        </div>
      </div>
    </Layout>
  );
};

export default Shuttle;
