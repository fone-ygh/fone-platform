// src/features/editor/components/canvas/hooks/useLogicalPoint.ts
import { useCallback } from "react";

export function useLogicalPoint(opts: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  panX: number;
  panY: number;
  zoom: number;
}) {
  const { stageRef, panX, panY, zoom } = opts;

  const toLogical = useCallback(
    (e: React.MouseEvent) => {
      const stage = stageRef.current;
      if (!stage) {
        return { x: 0, y: 0 };
      }

      const rect = stage.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      return {
        x: (sx - panX) / zoom,
        y: (sy - panY) / zoom,
      };
    },
    [stageRef, panX, panY, zoom],
  );

  return toLogical;
}
