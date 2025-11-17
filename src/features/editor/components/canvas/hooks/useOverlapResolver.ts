// src/features/editor/components/canvas/hooks/useOverlapResolver.ts
import { useCallback, useState } from "react";

import { intersectionRect, Rect } from "./collision";

type SectionLike = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useOverlapResolver(sections: SectionLike[]) {
  const [overlaps, setOverlaps] = useState<Rect[]>([]);

  // selfId 제외 나머지 Rect
  const rectsExcept = useCallback(
    (selfId: string): Rect[] =>
      sections
        .filter(s => s.id !== selfId)
        .map(s => ({ id: s.id, x: s.x, y: s.y, w: s.width, h: s.height })),
    [sections],
  );

  // 라이브 하이라이트(실제 교차 영역만 표시)
  const calcLive = useCallback(
    (selfId: string, cand: Rect) => {
      const others = rectsExcept(selfId);
      const merged: Rect[] = [];
      for (const ob of others) {
        const r = intersectionRect(cand, ob);
        if (r) merged.push(r);
      }
      setOverlaps(merged);
    },
    [rectsExcept],
  );

  // 종료 시: 겹치면 prev로 즉시 되돌리고, 아니면 proposal 확정
  const resolveOnEnd = useCallback(
    (selfId: string, proposal: Rect, prev: Rect) => {
      const others = rectsExcept(selfId);
      const hasOverlap = others.some(ob => intersectionRect(proposal, ob));
      setOverlaps([]);
      return hasOverlap ? prev : proposal;
    },
    [rectsExcept],
  );

  return { overlaps, calcLive, resolveOnEnd, setOverlaps };
}
