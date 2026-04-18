import { useRef, useState } from "react";
import { ImageOff, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat } from "@/data/seatLayout";

interface SeatEditorProps {
  seats: Seat[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize?: (id: string, width: number, height: number, x: number, y: number) => void;
  driverPos?: { x: number; y: number };
  driverSize?: { width: number; height: number };
  onMoveDriver?: (x: number, y: number) => void;
  onResizeDriver?: (width: number, height: number, x: number, y: number) => void;
  baseImageUrl?: string | null;
  disabled?: boolean;
  showGrid?: boolean;
  gridSize?: number;
}

const SeatEditor = ({ 
  seats, 
  selectedId, 
  onSelect, 
  onMove, 
  onResize,
  driverPos = { x: 50, y: 8 }, 
  driverSize = { width: 11.25, height: 11.25 },
  onMoveDriver, 
  onResizeDriver,
  baseImageUrl, 
  disabled,
  showGrid = false,
  gridSize = 2.5
}: SeatEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [isResizingDriver, setIsResizingDriver] = useState(false);
  const [draggingDriver, setDraggingDriver] = useState(false);
  const [livePos, setLivePos] = useState<{ x: number; y: number } | null>(null);
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImage = Boolean(baseImageUrl);
  const ready = !hasImage || (imgLoaded && aspectRatio);

  const snap = (val: number) => {
    if (!showGrid || !gridSize) return val;
    return Math.round(val / gridSize) * gridSize;
  };

  const updateFromPointer = (id: string, clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    
    x = snap(x);
    y = snap(y);

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    setLivePos({ x: clampedX, y: clampedY });
    onMove(id, clampedX, clampedY);
  };

  const handleResizePointerMove = (e: PointerEvent) => {
    if ((!resizingId && !isResizingDriver) || !resizeDir) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    
    const target = isResizingDriver 
      ? { x: driverPos.x, y: driverPos.y, width: driverSize.width, height: driverSize.height }
      : seats.find(s => s.id === resizingId);
      
    if (!target) return;

    let mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    let mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    mouseX = snap(mouseX);
    mouseY = snap(mouseY);

    const currentW = target.width || 11.25; 
    const currentH = target.height || (aspectRatio ? 11.25 / aspectRatio : 11.25);

    // Calculate boundaries in %
    let left = target.x - currentW / 2;
    let right = target.x + currentW / 2;
    let top = target.y - currentH / 2;
    let bottom = target.y + currentH / 2;

    const minSize = Math.max(gridSize, 2); // Minimum 2% or gridSize

    if (resizeDir.includes('e')) right = Math.max(left + minSize, Math.min(100, mouseX));
    if (resizeDir.includes('w')) left = Math.max(0, Math.min(right - minSize, mouseX));
    if (resizeDir.includes('s')) bottom = Math.max(top + minSize, Math.min(100, mouseY));
    if (resizeDir.includes('n')) top = Math.max(0, Math.min(bottom - minSize, mouseY));

    // Shift Key for proportional resizing
    if (e.shiftKey) {
      const ratio = currentW / currentH;
      let newW = right - left;
      let newH = bottom - top;
      
      if (resizeDir.includes('e') || resizeDir.includes('w')) {
        newH = newW / ratio;
      } else {
        newW = newH * ratio;
      }
      
      // Update boundaries based on ratio
      if (resizeDir.includes('e')) right = left + newW;
      if (resizeDir.includes('w')) left = right - newW;
      if (resizeDir.includes('s')) bottom = top + newH;
      if (resizeDir.includes('n')) top = bottom - newH;
    }

    const newW = snap(right - left);
    const newH = snap(bottom - top);
    const newX = snap(left + newW / 2);
    const newY = snap(top + newH / 2);

    setLiveSize({ w: newW, h: newH });
    setLivePos({ x: newX, y: newY });

    if (isResizingDriver && onResizeDriver) {
      onResizeDriver(newW, newH, newX, newY);
    } else if (resizingId && onResize) {
      onResize(resizingId, newW, newH, newX, newY);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (disabled) return;
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
    setDraggingDriver(false);
    setResizingId(null);
    setIsResizingDriver(false);
    setResizeDir(null);
    setLivePos(null);
    setLiveSize(null);
    try {
      (e.target as HTMLButtonElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent, id: string | 'driver', dir: string) => {
    if (disabled) return;
    e.stopPropagation();
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    if (id === 'driver') {
      setIsResizingDriver(true);
      onSelect('driver');
    } else {
      setResizingId(id);
    }
    setResizeDir(dir);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizingId && !isResizingDriver) return;
    handleResizePointerMove(e.nativeEvent);
  };

  const handleResizeUp = (e: React.PointerEvent) => {
    setResizingId(null);
    setIsResizingDriver(false);
    setResizeDir(null);
    setLiveSize(null);
    setLivePos(null);
    try {
      (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch { /* noop */ }
  };

  const handleDriverPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !onMoveDriver) return;
    e.preventDefault();
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    setDraggingDriver(true);
  };

  const handleDriverPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingDriver || !onMoveDriver) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    x = snap(x);
    y = snap(y);

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    setLivePos({ x: clampedX, y: clampedY });
    onMoveDriver(clampedX, clampedY);
  };

  const handleDriverPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDraggingDriver(false);
    setLivePos(null);
    try {
      (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const containerStyle = aspectRatio && hasImage
    ? { aspectRatio: `${aspectRatio}` }
    : undefined;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={cn(
        "relative w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-muted/30 border touch-none",
        !(aspectRatio && hasImage) && "aspect-[1/2]",
        hasImage && !ready && "min-h-[400px]",
        disabled && "opacity-60 pointer-events-none",
      )}
      onClick={() => onSelect(null)}
    >
      {hasImage ? (
        <img
          src={baseImageUrl!}
          alt="Denah kursi kendaraan"
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
          <p className="text-xs">Belum ada denah, upload dulu di panel atas</p>
        </div>
      )}

      {/* Grid Overlay - Moved after image to be on top */}
      {showGrid && ready && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* Horizontal lines */}
            {Array.from({ length: Math.floor(100 / gridSize) + 1 }).map((_, i) => (
              <line 
                key={`h-${i}`} 
                x1="0" 
                y1={`${i * gridSize}%`} 
                x2="100%" 
                y2={`${i * gridSize}%`} 
                stroke="currentColor" 
                strokeWidth={i % 4 === 0 ? "0.8" : "0.4"} 
                strokeOpacity={i % 4 === 0 ? "0.3" : "0.15"} 
                className="text-foreground" 
              />
            ))}
            {/* Vertical lines */}
            {Array.from({ length: Math.floor(100 / gridSize) + 1 }).map((_, i) => (
              <line 
                key={`v-${i}`} 
                x1={`${i * gridSize}%`} 
                y1="0" 
                x2={`${i * gridSize}%`} 
                y2="100%" 
                stroke="currentColor" 
                strokeWidth={i % 4 === 0 ? "0.8" : "0.4"} 
                strokeOpacity={i % 4 === 0 ? "0.3" : "0.15"} 
                className="text-foreground" 
              />
            ))}
          </svg>
        </div>
      )}

      {hasImage && !ready && (
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      )}

      { (draggingId || resizingId) && livePos && (
        <div className="absolute top-1 left-1 z-40 bg-foreground/80 text-background text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none flex flex-col">
          <span>Pos: {livePos.x.toFixed(1)}%, {livePos.y.toFixed(1)}%</span>
          {liveSize && <span>Size: {liveSize.w.toFixed(1)}% x {liveSize.h.toFixed(1)}%</span>}
        </div>
      )}

      {/* Driver Icon - dapat di-drag */}
      {ready && (
        <div
          onPointerDown={handleDriverPointerDown}
          onPointerMove={handleDriverPointerMove}
          onPointerUp={handleDriverPointerUp}
          onPointerCancel={handleDriverPointerUp}
          style={{
            left: `${driverPos.x}%`,
            top: `${driverPos.y}%`,
            width: `${driverSize.width}%`,
            height: `${driverSize.height}%`,
          }}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border-2 flex items-center justify-center",
            "shadow-sm transition-all duration-150 touch-none z-30",
            "cursor-grab active:cursor-grabbing",
            draggingDriver ? "scale-125 shadow-lg bg-orange-500/80 border-orange-500" : "bg-orange-500/40 border-orange-500/60 hover:bg-orange-500/50",
            selectedId === 'driver' && "ring-2 ring-orange-500 ring-offset-2"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect('driver');
          }}
          title="Posisi Pengemudi (Drag untuk menggeser)"
        >
          <User className="w-5 h-5 text-orange-900" />
          
          {/* Driver Resizing Handles */}
          {selectedId === 'driver' && onResizeDriver && (
            <>
              <div 
                onPointerDown={(e) => handleResizePointerDown(e, 'driver', 'nw')}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-nw-resize z-50 shadow-sm hover:scale-125 transition-transform" 
              />
              <div 
                onPointerDown={(e) => handleResizePointerDown(e, 'driver', 'ne')}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-ne-resize z-50 shadow-sm hover:scale-125 transition-transform" 
              />
              <div 
                onPointerDown={(e) => handleResizePointerDown(e, 'driver', 'sw')}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-sw-resize z-50 shadow-sm hover:scale-125 transition-transform" 
              />
              <div 
                onPointerDown={(e) => handleResizePointerDown(e, 'driver', 'se')}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-se-resize z-50 shadow-sm hover:scale-125 transition-transform" 
              />
            </>
          )}
        </div>
      )}

      {ready && seats.map((seat) => {
        const isSelected = selectedId === seat.id;
        const isDragging = draggingId === seat.id;
        const isResizing = resizingId === seat.id;
        const isOccupied = seat.status === "occupied";

        const width = seat.width || 11.25;
        const height = seat.height || (aspectRatio ? 11.25 / aspectRatio : 11.25);

        return (
          <div
            key={seat.id}
            style={{
              left: `${seat.x}%`,
              top: `${seat.y}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2",
              "transition-all duration-150",
              (isDragging || isResizing) && "z-20 scale-105 shadow-xl",
              isSelected && "z-10"
            )}
          >
            <button
              type="button"
              onPointerDown={(e) => handlePointerDown(e, seat.id)}
              onPointerMove={(e) => handlePointerMove(e, seat.id)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                "w-full h-full rounded-lg border-2 text-[10px] font-bold",
                "flex items-center justify-center",
                "shadow-sm cursor-grab active:cursor-grabbing touch-none",
                isOccupied && !isSelected && "bg-destructive/80 border-destructive text-destructive-foreground",
                !isOccupied && !isSelected && "bg-background border-primary/40 text-primary",
                isSelected && "bg-primary border-primary text-primary-foreground ring-2 ring-primary/40",
              )}
            >
              {seat.label}
            </button>

            {/* Resizing Handles */}
            {isSelected && onResize && (
              <>
                <div 
                  onPointerDown={(e) => handleResizePointerDown(e, seat.id, 'nw')}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeUp}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full cursor-nw-resize z-50 shadow-sm hover:scale-125 transition-transform" 
                />
                <div 
                  onPointerDown={(e) => handleResizePointerDown(e, seat.id, 'ne')}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeUp}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full cursor-ne-resize z-50 shadow-sm hover:scale-125 transition-transform" 
                />
                <div 
                  onPointerDown={(e) => handleResizePointerDown(e, seat.id, 'sw')}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeUp}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full cursor-sw-resize z-50 shadow-sm hover:scale-125 transition-transform" 
                />
                <div 
                  onPointerDown={(e) => handleResizePointerDown(e, seat.id, 'se')}
                  onPointerMove={handleResizeMove}
                  onPointerUp={handleResizeUp}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full cursor-se-resize z-50 shadow-sm hover:scale-125 transition-transform" 
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SeatEditor;
