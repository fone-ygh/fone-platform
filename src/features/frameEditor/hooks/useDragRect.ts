import { useCallback, useState } from "react";
import type React from "react";

import { useLogicalPoint } from "./useLogicalPoint";

export type DragRect = {
  on: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function useDragRect(opts: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  panX: number;
  panY: number;
  zoom: number;
  dragThreshold?: number;
}) {
  const { stageRef, panX, panY, zoom, dragThreshold = 3 } = opts;

  const toLogical = useLogicalPoint({ stageRef, panX, panY, zoom });

  const [rect, setRect] = useState<DragRect>({
    on: false,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const [isDown, setIsDown] = useState(false);
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);

  const onDragRectDown = useCallback(
    (e: React.MouseEvent) => {
      const p = toLogical(e);
      setIsDown(true);
      setStartPt(p);
      setRect({ on: false, x: 0, y: 0, w: 0, h: 0 });
    },
    [toLogical],
  );

  const onDragRectMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDown || !startPt) return;

      const p = toLogical(e);
      const dx = Math.abs(p.x - startPt.x);
      const dy = Math.abs(p.y - startPt.y);

      // 아직 Rect 시작 안 했고, 드래그가 너무 짧으면 무시
      if (!rect.on && dx <= dragThreshold && dy <= dragThreshold) {
        return;
      }

      const nx = Math.min(startPt.x, p.x);
      const ny = Math.min(startPt.y, p.y);
      const nw = Math.abs(p.x - startPt.x);
      const nh = Math.abs(p.y - startPt.y);

      setRect({ on: true, x: nx, y: ny, w: nw, h: nh });
    },
    [isDown, startPt, rect.on, dragThreshold, toLogical],
  );

  const onDragRectUp = useCallback(() => {
    setIsDown(false);
    setStartPt(null);
    // rect 자체는 밖에서 한 번 쓰고 나서 resetRect로 초기화
  }, []);

  const resetRect = useCallback(() => {
    setRect({ on: false, x: 0, y: 0, w: 0, h: 0 });
  }, []);

  return {
    dragRect: rect,
    isDraggingRect: rect.on,
    onDragRectDown,
    onDragRectMove,
    onDragRectUp,
    resetRect,
  };
}
