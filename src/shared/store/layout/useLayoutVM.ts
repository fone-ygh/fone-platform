// src/shared/store/layout/useLayoutVM.ts
"use client";

import { useMemo } from "react";

import { useLayoutStore } from "./store";
import type { AnySection, Section } from "./types";

export function useLayoutVM() {
  const {
    canvasWidth,
    canvasHeight,
    sections,
    selectedIds,
    insertTool,
    scopeParentId,
    actions,
  } = useLayoutStore();

  const scopeContainer = useMemo<Section | null>(() => {
    if (!scopeParentId) return null;
    return (sections.find(s => s.id === scopeParentId) as Section) ?? null;
  }, [sections, scopeParentId]);

  const offsetX = scopeContainer ? scopeContainer.x : 0;
  const offsetY = scopeContainer ? scopeContainer.y : 0;

  const viewW = scopeContainer ? scopeContainer.width : canvasWidth;
  const viewH = scopeContainer ? scopeContainer.height : canvasHeight;

  const scopedSections = useMemo<AnySection[]>(() => {
    if (!scopeParentId) return sections as AnySection[];
    return (sections as AnySection[]).filter(
      // s => s.id === scopeParentId || (s.parentId ?? null) === scopeParentId,
      s => (s.parentId ?? null) === scopeParentId,
    );
  }, [sections, scopeParentId]);

  const displaySections = useMemo<AnySection[]>(() => {
    if (!scopeContainer) return scopedSections;
    return scopedSections.map(s => ({
      ...s,
      x: s.x - offsetX,
      y: s.y - offsetY,
    }));
  }, [scopedSections, scopeContainer, offsetX, offsetY]);

  const activeId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : "";

  return {
    // raw
    canvasWidth,
    canvasHeight,
    sections,
    selectedIds,
    insertTool,
    scopeParentId,

    // derived (UI에서 쓰기 좋게)
    scopeContainer,
    offsetX,
    offsetY,
    viewW,
    viewH,
    scopedSections,
    displaySections,
    activeId,

    // actions
    actions,
  };
}
