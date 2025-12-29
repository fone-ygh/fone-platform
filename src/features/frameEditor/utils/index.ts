export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export function rectFromPoints(a: Point, b: Point): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.abs(a.x - b.x);
  const h = Math.abs(a.y - b.y);
  return { x, y, w, h };
}

export function rectIntersectsRect(
  r: Rect,
  s: { x: number; y: number; width: number; height: number },
) {
  return !(
    r.x + r.w <= s.x ||
    s.x + s.width <= r.x ||
    r.y + r.h <= s.y ||
    s.y + s.height <= r.y
  );
}
