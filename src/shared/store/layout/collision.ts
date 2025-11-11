import type { CommitResult, LayoutState } from "./types";
import { clamp, isSolid, rectsOverlap } from "./utils";

/** 커밋 전 레이아웃 검증(범위/겹침). 실패 시 {ok:false, collidedIds} 반환 */
export function commitOrBounceLayout(L: LayoutState): CommitResult {
  const W = L.canvasWidth;
  const H = L.canvasHeight;

  // 1) 캔버스 범위 clamp
  L.sections = L.sections.map(s => ({
    ...s,
    x: clamp(s.x, 0, Math.max(0, W - s.width)),
    y: clamp(s.y, 0, Math.max(0, H - s.height)),
  }));

  // 2) 박스끼리만 충돌 검사
  const solids = L.sections.filter(isSolid);
  const collided: string[] = [];
  for (let i = 0; i < solids.length; i++) {
    for (let j = i + 1; j < solids.length; j++) {
      const a = solids[i],
        b = solids[j];
      if (
        rectsOverlap(
          { x: a.x, y: a.y, width: a.width, height: a.height },
          { x: b.x, y: b.y, width: b.width, height: b.height },
        )
      ) {
        collided.push(a.id, b.id);
      }
    }
  }

  if (collided.length) {
    return {
      ok: false,
      message: "박스끼리 겹칠 수 없어요.",
      collidedIds: Array.from(new Set(collided)),
    };
  }
  return { ok: true };
}
