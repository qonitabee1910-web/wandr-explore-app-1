export type SeatStatus = "available" | "occupied" | "selected";

export interface Seat {
  id: string;
  label: string;
  /** Position in % of container width */
  x: number;
  /** Position in % of container height */
  y: number;
  /** Width in % of container width (default: 11.25% or ~36px of 320px) */
  width?: number;
  /** Height in % of container height (default depends on aspect ratio, ~36px) */
  height?: number;
  status: SeatStatus;
}

export const SEAT_PRICE = 75000;
const STORAGE_KEY = "hiace_seat_layout_v1";

// Default 14-seat Hiace layout (driver + 13 passenger).
export const DEFAULT_HIACE_SEATS: Seat[] = [
  { id: "1A", label: "1A", x: 32, y: 14, status: "occupied" },
  { id: "1B", label: "1B", x: 68, y: 14, status: "available" },
  { id: "2A", label: "2A", x: 22, y: 32, status: "available" },
  { id: "2B", label: "2B", x: 50, y: 32, status: "occupied" },
  { id: "2C", label: "2C", x: 78, y: 32, status: "available" },
  { id: "3A", label: "3A", x: 22, y: 48, status: "available" },
  { id: "3B", label: "3B", x: 50, y: 48, status: "available" },
  { id: "3C", label: "3C", x: 78, y: 48, status: "occupied" },
  { id: "4A", label: "4A", x: 22, y: 64, status: "available" },
  { id: "4B", label: "4B", x: 50, y: 64, status: "available" },
  { id: "4C", label: "4C", x: 78, y: 64, status: "available" },
  { id: "5A", label: "5A", x: 22, y: 82, status: "available" },
  { id: "5B", label: "5B", x: 50, y: 82, status: "occupied" },
  { id: "5C", label: "5C", x: 78, y: 82, status: "available" },
];

function loadFromStorage(): Seat[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as Seat[];
  } catch {
    return null;
  }
}

export function saveSeatsToStorage(seats: Seat[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
}

export function clearSeatsStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredSeats(): Seat[] {
  return loadFromStorage() ?? DEFAULT_HIACE_SEATS;
}

export function exportSeatsToCode(seats: Seat[]): string {
  const lines = seats.map(
    (s) => {
      let line = `  { id: "${s.id}", label: "${s.label}", x: ${Number(s.x.toFixed(2))}, y: ${Number(s.y.toFixed(2))}`;
      if (s.width) line += `, width: ${Number(s.width.toFixed(2))}`;
      if (s.height) line += `, height: ${Number(s.height.toFixed(2))}`;
      line += `, status: "${s.status}" },`;
      return line;
    }
  );
  return `export const DEFAULT_HIACE_SEATS: Seat[] = [\n${lines.join("\n")}\n];\n`;
}

// Live layout used by /shuttle — reads from storage on import.
export const HIACE_SEATS: Seat[] = getStoredSeats();
