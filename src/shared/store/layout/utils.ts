// src/shared/store/layout/utils.ts
import type { Section } from "./types";

// z 값을 0..n-1로 정규화
export function normalizeZ(sections: Section[]): Section[] {
  const sorted = [...sections].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  return sorted.map((s, i) => ({ ...s, z: i }));
}

export function maxZ(sections: Section[]): number {
  return sections.reduce((m, s) => Math.max(m, s.z ?? 0), -1);
}

let __uid = 0;
export function newId(prefix = "sec"): string {
  __uid += 1;
  return `${prefix}_${__uid.toString(36)}`;
}

export function cloneSection(s: Section, z: number): Section {
  const { id: _old, ...rest } = s;
  return {
    ...rest,
    id: `${s.id}_copy_${z}`,
    x: s.x + 16,
    y: s.y + 16,
    z,
    title: s.title ? `${s.title} copy` : s.title,
  } as Section;
}

export function applyZChange(
  sections: Section[],
  ids: string[],
  fn: (z: number) => number,
): Section[] {
  const idSet = new Set(ids);
  const moved = sections.map(s =>
    idSet.has(s.id) ? { ...s, z: fn(s.z ?? 0) } : s,
  );
  return normalizeZ(moved);
}
