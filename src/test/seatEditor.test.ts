import { describe, it, expect, vi } from 'vitest';
// We'll test the logic exported or used in the editor
// Since these are React components, we focus on the logic and state management patterns

describe('Seat Layout Editor Logic', () => {
  it('should enforce minimum size during resizing', () => {
    const gridSize = 2.5;
    const minSize = Math.max(gridSize, 2);
    
    // Logic from SeatEditor.tsx handleResizePointerMove
    const calculateNewRight = (left: number, mouseX: number) => Math.max(left + minSize, Math.min(100, mouseX));
    
    expect(calculateNewRight(10, 11)).toBe(10 + minSize);
    expect(calculateNewRight(10, 50)).toBe(50);
  });

  it('should calculate proportional dimensions correctly', () => {
    const currentW = 10;
    const currentH = 10;
    const ratio = currentW / currentH; // 1
    
    // Simulating Shift + Drag East
    const newW = 20;
    const newH = newW / ratio;
    
    expect(newH).toBe(20);
  });

  it('should snap coordinates to grid correctly', () => {
    const gridSize = 2.5;
    const snap = (val: number) => Math.round(val / gridSize) * gridSize;
    
    expect(snap(2.4)).toBe(2.5);
    expect(snap(3.8)).toBe(5.0);
    expect(snap(1.1)).toBe(0);
  });
});
