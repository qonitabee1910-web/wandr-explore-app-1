import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import hiaceLayout from "@/assets/hiace-layout.png";
import type { Seat } from "@/data/seatLayout";

interface SeatEditorProps {
  seats: Seat[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const SeatEditor = ({ seats, selectedId, onSelect, onMove }: SeatEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [livePos, setLivePos] = useState<{ x: number; y: number } | null>(null);

  const updateFromPointer = (id: string, clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    setLivePos({ x: clampedX, y: clampedY });
    onMove(id, clampedX, clampedY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    (e.target as HTMLButtonElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
    onSelect(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (draggingId !== id) return;
    updateFromPointer(id, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    setDraggingId(null);
    setLivePos(null);
    try {
      (e.target as HTMLButtonElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[280px] mx-auto aspect-[1/2] rounded-2xl overflow-hidden bg-muted/30 border touch-none"
    >
      <img
        src={hiaceLayout}
        alt="Denah kursi shuttle Hiace"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />

      {draggingId && livePos && (
        <div className="absolute top-1 left-1 z-10 bg-foreground/80 text-background text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none">
          {livePos.x.toFixed(1)}%, {livePos.y.toFixed(1)}%
        </div>
      )}

      {seats.map((seat) => {
        const isSelected = selectedId === seat.id;
        const isDragging = draggingId === seat.id;
        const isOccupied = seat.status === "occupied";

        return (
          <button
            key={seat.id}
            type="button"
            onPointerDown={(e) => handlePointerDown(e, seat.id)}
            onPointerMove={(e) => handlePointerMove(e, seat.id)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              left: `${seat.x}%`,
              top: `${seat.y}%`,
            }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2",
              "w-9 h-9 rounded-lg border-2 text-[10px] font-bold",
              "flex items-center justify-center transition-all duration-150",
              "shadow-sm cursor-grab active:cursor-grabbing touch-none",
              isOccupied && !isSelected && "bg-destructive/80 border-destructive text-destructive-foreground",
              !isOccupied && !isSelected && "bg-background border-primary/40 text-primary",
              isSelected && "bg-primary border-primary text-primary-foreground ring-2 ring-primary/40",
              isDragging && "scale-125 shadow-lg z-20",
            )}
          >
            {seat.label}
          </button>
        );
      })}
    </div>
  );
};

export default SeatEditor;
