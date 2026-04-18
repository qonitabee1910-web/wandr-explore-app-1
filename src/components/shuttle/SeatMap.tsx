import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat } from "@/data/seatLayout";

interface SeatMapProps {
  seats: Seat[];
  selectedIds: string[];
  onToggle: (seatId: string) => void;
  baseImageUrl?: string | null;
}

const SeatMap = ({ seats, selectedIds, onToggle, baseImageUrl }: SeatMapProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImage = Boolean(baseImageUrl);
  const ready = !hasImage || (imgLoaded && aspectRatio);
  const containerStyle = aspectRatio && hasImage ? { aspectRatio: `${aspectRatio}` } : undefined;

  return (
    <div
      style={containerStyle}
      className={cn(
        "relative w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-muted/30 border",
        !(aspectRatio && hasImage) && "aspect-[1/2]",
        hasImage && !ready && "min-h-[400px]",
      )}
    >
      {hasImage ? (
        <img
          src={baseImageUrl!}
          alt="Denah kursi shuttle"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setAspectRatio(img.naturalWidth / img.naturalHeight);
            }
            setImgLoaded(true);
          }}
          className={cn(
            "absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity",
            imgLoaded ? "opacity-100" : "opacity-0",
          )}
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center">
          <ImageOff className="w-10 h-10 opacity-50" />
          <p className="text-xs">Denah kursi belum tersedia</p>
        </div>
      )}

      {hasImage && !ready && (
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      )}

      {ready && seats.map((seat) => {
        const isSelected = selectedIds.includes(seat.id);
        const isOccupied = seat.status === "occupied";
        const disabled = isOccupied;

        return (
          <button
            key={seat.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(seat.id)}
            aria-label={`Kursi ${seat.label} ${
              isOccupied ? "terisi" : isSelected ? "terpilih" : "tersedia"
            }`}
            aria-pressed={isSelected}
            style={{
              left: `${seat.x}%`,
              top: `${seat.y}%`,
            }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2",
              "w-9 h-9 rounded-lg border-2 text-[10px] font-bold",
              "flex items-center justify-center transition-all duration-150",
              "shadow-sm active:scale-90",
              isOccupied &&
                "bg-destructive/80 border-destructive text-destructive-foreground cursor-not-allowed opacity-70",
              !isOccupied &&
                !isSelected &&
                "bg-background border-primary/40 text-primary hover:bg-primary/10 hover:scale-105",
              isSelected &&
                "bg-primary border-primary text-primary-foreground scale-110 ring-2 ring-primary/30",
            )}
          >
            {seat.label}
          </button>
        );
      })}
    </div>
  );
};

export default SeatMap;
