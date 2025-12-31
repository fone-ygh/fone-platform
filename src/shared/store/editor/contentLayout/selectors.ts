// src/shared/store/layout/derived.ts
import type { Section } from "./types";

export function getScopeContainer(
  sections: Section[],
  scopeParentId: string | null,
) {
  if (!scopeParentId) return null;
  return sections.find(s => s.id === scopeParentId) ?? null;
}

export function getScopeOffset(scopeContainer: Section | null) {
  return {
    offsetX: scopeContainer ? scopeContainer.x : 0,
    offsetY: scopeContainer ? scopeContainer.y : 0,
  };
}

export function getScopedSections(
  sections: Section[],
  scopeParentId: string | null,
) {
  if (!scopeParentId) return sections;
  return sections.filter(
    s => s.id === scopeParentId || (s.parentId ?? null) === scopeParentId,
  );
}

export function getDisplaySections(
  scopedSections: Section[],
  scopeContainer: Section | null,
  offsetX: number,
  offsetY: number,
) {
  if (!scopeContainer) return scopedSections;
  return scopedSections.map(s => ({
    ...s,
    x: s.x - offsetX,
    y: s.y - offsetY,
  }));
}

export function getViewSize(
  canvasWidth: number,
  canvasHeight: number,
  scopeContainer: Section | null,
) {
  return {
    viewW: scopeContainer ? scopeContainer.width : canvasWidth,
    viewH: scopeContainer ? scopeContainer.height : canvasHeight,
  };
}

export function getActiveId(selectedIds: string[]) {
  return selectedIds.length ? selectedIds[selectedIds.length - 1] : "";
}
