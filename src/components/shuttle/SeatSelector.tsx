import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Seat } from '@/data/seatLayout';

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  disabled?: boolean;
}

const SeatSelector = ({ seats, selectedSeats, onToggleSeat, disabled }: SeatSelectorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const containerStyle = aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={cn(
        'relative w-full max-w-[280px] mx-auto rounded-lg overflow-hidden bg-muted/30 border',
        'aspect-[1/2]',
        disabled && 'opacity-60 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-transparent pointer-events-none" />

      {/* Driver position */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-6 rounded bg-orange-500/40 border border-orange-500/60 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        </div>
      </div>

      {/* Seats grid */}
      <div className="absolute inset-2 top-10 flex flex-col justify-around">
        {/* Group seats by rows */}
        {[1, 2, 3, 4, 5].map((row) => {
          const rowSeats = seats.filter(
            (s) => parseInt(s.label[0]) === row
          );
          if (rowSeats.length === 0) return null;

          return (
            <div key={row} className="flex justify-center gap-1.5">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                return (
                  <button
                    key={seat.id}
                    onClick={() => onToggleSeat(seat.id)}
                    className={cn(
                      'w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center',
                      'border transition-all duration-150 shadow-sm',
                      'cursor-pointer hover:scale-110',
                      isSelected && 'bg-primary border-primary text-primary-foreground',
                      !isSelected && 'bg-background border-primary/30 text-primary/60 hover:bg-primary/5'
                    )}
                    title={`Kursi ${seat.label}`}
                  >
                    {seat.label[seat.label.length - 1]}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatSelector;
