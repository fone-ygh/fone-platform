// src/shared/store/frameLayout/useFrameLayoutVM.ts
"use client";

import { useMemo } from "react";

import { useFrameLayoutStore } from "./store";
import type { FrameNode, FrameRegion } from "./types";

export function useFrameLayoutVM() {
  const { frameWidth, frameHeight, nodes, selectedIds, version, actions } =
    useFrameLayoutStore();

  const regions = useMemo<FrameNode[]>(
    () =>
      Object.values(nodes)
        .slice()
        .sort((a, b) => (a.z ?? 0) - (b.z ?? 0)),
    [nodes],
  );

  const activeId: FrameRegion | null = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : null;

  return {
    frameWidth,
    frameHeight,
    nodes,
    regions,
    selectedIds,
    activeId,
    version,
    actions,
  };
}
