import type { SectionItem } from "./types";

export function genId(prefix = "s") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max));

export const rectsOverlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) =>
  !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );

export const isSolid = (s: SectionItem) => s.type === "box";
