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

/** 사각형 한 개를 표현하는 최소정보
 *  x: 왼쪽(Left)
 *  y: 위(Top)
 *  w: 너비(Width)
 *  h: 높이(Height)
 */
type Rect = { x: number; y: number; w: number; h: number };

export interface GuidesProps {
  /** 캔버스 너비(px). 스테이지의 논리 너비. */
  canvasWidth: number;

  /** 캔버스 높이(px). 스테이지의 논리 높이. */
  canvasHeight: number;

  /** 세로(Vertical) 가이드 후보들의 x 좌표 목록.
   *  - 예: 컬럼 그리드 라인, 룰러 마크 등
   *  - 내부에서 Set으로 중복 제거됨
   *  - 단위: px(논리 좌표) */
  columnLines: number[];

  /** 가이드 표시 임계값(px).
   *  - 엣지/센터가 후보 라인과 이 값 이하로 가까우면 가이드 노출
   *  - 보통 gridSize/2 정도 권장, 최소 4px 이상
   *  - 단위: px(논리 좌표) */
  threshold: number;

  /** 기능 토글.
   *  - true: 가이드 계산/표시 활성
   *  - false: 계산 건너뜀(이미 그려진 라인은 clear()로 수동 제거 필요) */
  enabled: boolean;
}

export function useGuides({
  canvasWidth,
  canvasHeight,
  columnLines,
  threshold,
  enabled,
}: GuidesProps) {
  const [lines, setLines] = useState<GuideLine[]>([]);

  const clear = useCallback(() => setLines([]), []);

  /**
   * 스냅(맞춤) 기준선 후보들을 만들어서 반환하는 함수
   * - x축 후보(xLines): 캔버스 왼쪽(0), 오른쪽(canvasWidth), 세로중앙(canvasWidth/2), 그리고 컬럼 가이드 라인(columnLines)
   * - y축 후보(yLines): 캔버스 위(0), 아래(canvasHeight), 가로중앙(canvasHeight/2)
   * 반환형태 : {xLines: number[]; yLines: number[]}
   * 용도 : 드래그/리사이즈 중 현재 요소의 x,y 우측/하단 등과 가장 가까운 기준선을 찾아 '착' 붙이기 위함
   */
  const buildCandidates = useCallback(() => {
    // // x축 스냅 후보(세로 가이드라인): 캔버스 좌/우 경계 + 세로 중앙 + 컬럼 그리드 라인
    const xLines = new Set<number>([
      0, // 캔버스 왼쪽 경계
      canvasWidth, // 캔버스 오른쪽 경계
      canvasWidth / 2, // 캔버스 세로 중앙선
      ...columnLines, // 사용자가 정의한 컬럼 라인(세로 그리드)
    ]);

    // y축 스냅 후보(가로 가이드라인): 캔버스 상/하 경계 + 가로 중앙
    const yLines = new Set<number>([
      0, // 캔버스 상단 경계
      canvasHeight, // 캔버스 하단 경계
      canvasHeight / 2, // 캔버스 가로 중앙선
    ]);
    return { xLines: [...xLines], yLines: [...yLines] };
  }, [canvasWidth, canvasHeight, columnLines]);

  /**
   * 선택한 사각형(me) 주변의 '스냅 가이드라인'을 계산해서 화면에 보여주는 함수
   * - enabled가 false면 아무것도 하지 않음.
   * - buildCandidates()에서 기본 후보 (캔버스 경계/ 중앙/ 컬럼라인 등)를 가져 뒤
   *    others(다른 사각형들)의 엣지/센터 좌표를 후보에 추가.
   * - me의 엣지/센터 각각에 대해 가장 가까운 후보선을 찾고 (threshold 이내면),
   *    수직/수평 가이드라인을 out 배열에 쌓음
   * - 같은 위치의 중복 가이드라인은 (orientation + pos) 키로 중복제거 한 후 setLines로 반영
   */
  const showForRect = useCallback(
    (me: Rect, others: Rect[], nearOnly = true) => {
      if (!enabled) return;

      const { xLines, yLines } = buildCandidates();

      // others의 엣지/센터도 후보에 추가
      for (const o of others) {
        // (x축길이, 박스의 오른쪽 끝(x 끝), 박스의 가로중앙)
        xLines.push(o.x, o.x + o.w, o.x + o.w / 2);
        yLines.push(o.y, o.y + o.h, o.y + o.h / 2);
      }

      const meX = [me.x, me.x + me.w, me.x + me.w / 2];
      const meY = [me.y, me.y + me.h, me.y + me.h / 2];

      const out: GuideLine[] = [];

      /**
       * 배열 arr에서 목표값 val과 가장 가까운 숫자를 찾아서
       * - best: 가장 가까운 값
       * - dist: 그 값까지의 거리 (|val - best|)
       * 를 반환한다.
       *
       * 예) nearest(13, [0, 10, 17]) -> {best: 10, dist: 3}
       */
      const nearest = (val: number, arr: number[]) => {
        let best = arr[0],
          dist = Math.abs(val - arr[0]);
        for (let i = 1; i < arr.length; i++) {
          const d = Math.abs(val - arr[i]); // 거리를 보기위함
          if (d < dist) {
            best = arr[i];
            dist = d;
          }
        }
        return { best, dist };
      };

      for (const edge of meX) {
        const { best, dist } = nearest(edge, xLines);

        if (!nearOnly || dist <= threshold) {
          out.push({ orientation: "v", pos: best, from: 0, to: canvasHeight });
        }
      }

      for (const edge of meY) {
        const { best, dist } = nearest(edge, yLines);
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
