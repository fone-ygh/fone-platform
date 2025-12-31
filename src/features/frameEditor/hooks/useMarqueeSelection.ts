// src/features/editor/components/canvas/hooks/useMarqueeSelection.ts
import { useCallback, useState } from "react";

import { useLogicalPoint } from "./useLogicalPoint";

type SectionLike = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Marquee = { on: boolean; x: number; y: number; w: number; h: number };

export function useMarqueeSelection(opts: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  panX: number;
  panY: number;
  zoom: number;
  sections: SectionLike[];
  setSelectedIds: (ids: string[]) => void;
  dragThreshold?: number;
}) {
  const {
    stageRef,
    panX,
    panY,
    zoom,
    sections,
    setSelectedIds,
    dragThreshold = 3,
  } = opts;

  const [marquee, setMarquee] = useState<Marquee>({
    on: false,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const [bgDown, setBgDown] = useState(false);
  const [downPt, setDownPt] = useState<{ x: number; y: number } | null>(null);

  const toLogical = useLogicalPoint({ stageRef, panX, panY, zoom });

  const onDown = useCallback(
    (e: React.MouseEvent) => {
      // 아이템 위면 무시 (아이템 쪽에서 stopPropagation 권장)
      if ((e.target as HTMLElement).closest(".section-item")) return;

      const p = toLogical(e);
      setBgDown(true);
      setDownPt(p);
      setMarquee({ on: false, x: 0, y: 0, w: 0, h: 0 });
    },
    [toLogical],
  );

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!bgDown || !downPt) return;

      const p = toLogical(e);
      const dx = Math.abs(p.x - downPt.x);
      const dy = Math.abs(p.y - downPt.y);

      if (!marquee.on) {
        if (dx > dragThreshold || dy > dragThreshold) {
          const nx = Math.min(downPt.x, p.x);
          const ny = Math.min(downPt.y, p.y);
          const nw = Math.abs(p.x - downPt.x);
          const nh = Math.abs(p.y - downPt.y);
          setMarquee({ on: true, x: nx, y: ny, w: nw, h: nh });
          setSelectedIds([]);
        }
        return;
      }

      // 마퀴 업데이트
      const nx = Math.min(downPt.x, p.x);
      const ny = Math.min(downPt.y, p.y);
      const nw = Math.abs(p.x - downPt.x);
      const nh = Math.abs(p.y - downPt.y);
      setMarquee({ on: true, x: nx, y: ny, w: nw, h: nh });

      // 교차 선택
      const hit = sections
        .filter(
          s =>
            !(
              nx + nw <= s.x ||
              s.x + s.width <= nx ||
              ny + nh <= s.y ||
              s.y + s.height <= ny
            ),
        )
        .map(s => s.id);

      setSelectedIds(hit);
    },
    [
      bgDown,
      downPt,
      dragThreshold,
      marquee.on,
      sections,
      setSelectedIds,
      toLogical,
    ],
  );

  const onUp = useCallback(() => {
    if (bgDown && !marquee.on) {
      setSelectedIds([]); // 배경 단클릭 → 선택 해제
    }
    setBgDown(false);
    setDownPt(null);
    setMarquee(m => ({ ...m, on: false }));
  }, [bgDown, marquee.on, setSelectedIds]);

  return { marquee, onDown, onMove, onUp };
}
