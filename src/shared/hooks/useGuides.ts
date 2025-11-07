// src/hooks/useGuides.ts
import { useCallback, useState } from "react";

export type GuideLine = {
  /** "v"(vertical, 세로) 또는 "h"(horizontal, 가로) */
  orientation: "v" | "h";

  /** 선의 주축 좌표 (세로선이면 x 값, 가로선이면 y 값) */
  pos: number;

  /** from, to: 선의 반대축 범위 (세로선이면 y 시작/끝, 가로선이면 x 시작/끝) */
  from: number;
  to: number;
};

/** 사각형 한 개를 표현한느 최소정보
 *  x: 왼쪽(Left)
 *  y: 위(Top)
 *  w: 너비(Width)
 *  h: 높이(Height)
 */
type Rect = { x: number; y: number; w: number; h: number };

export function useGuides({
  canvasWidth,
  canvasHeight,
  columnLines,
  threshold,
  enabled,
}: {
  canvasWidth: number;
  canvasHeight: number;
  columnLines: number[];
  threshold: number;
  enabled: boolean;
}) {
  const [lines, setLines] = useState<GuideLine[]>([]);

  const clear = useCallback(() => setLines([]), []);

  const buildCandidates = useCallback(() => {
    // 캔버스 경계 + 센터 + 컬럼 라인
    const xs = new Set<number>([
      0,
      canvasWidth,
      canvasWidth / 2,
      ...columnLines,
    ]);
    const ys = new Set<number>([0, canvasHeight, canvasHeight / 2]);
    return { xs: [...xs], ys: [...ys] };
  }, [canvasWidth, canvasHeight, columnLines]);

  // nearOnly=true: threshold 안에 들 때만 표시 -> 화면 깔끔
  const showForRect = useCallback(
    (me: Rect, others: Rect[], nearOnly = true) => {
      if (!enabled) return;

      const { xs, ys } = buildCandidates();

      // others의 엣지/센터도 후보에 추가
      for (const o of others) {
        xs.push(o.x, o.x + o.w, o.x + o.w / 2);
        ys.push(o.y, o.y + o.h, o.y + o.h / 2);
      }

      const meX = [me.x, me.x + me.w, me.x + me.w / 2];
      const meY = [me.y, me.y + me.h, me.y + me.h / 2];

      const out: GuideLine[] = [];

      const nearest = (val: number, arr: number[]) => {
        let best = arr[0],
          dist = Math.abs(val - arr[0]);
        for (let i = 1; i < arr.length; i++) {
          const d = Math.abs(val - arr[i]);
          if (d < dist) {
            dist = d;
            best = arr[i];
          }
        }
        return { best, dist };
      };

      for (const edge of meX) {
        const { best, dist } = nearest(edge, xs);
        if (!nearOnly || dist <= threshold) {
          out.push({ orientation: "v", pos: best, from: 0, to: canvasHeight });
        }
      }

      for (const edge of meY) {
        const { best, dist } = nearest(edge, ys);
        if (!nearOnly || dist <= threshold) {
          out.push({ orientation: "h", pos: best, from: 0, to: canvasWidth });
        }
      }

      // 같은 위치 중복 제거
      const seen = new Set<string>();
      const dedup = out.filter(g => {
        const k = `${g.orientation}:${Math.round(g.pos)}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      setLines(dedup);
    },
    [enabled, buildCandidates, threshold, canvasHeight, canvasWidth],
  );

  return { guideLines: lines, showForRect, clear };
}
