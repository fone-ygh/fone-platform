// src/features/editor/components/canvas/hooks/useZoomWheel.ts
import { useEffect } from "react";

type SetPan = (x: number, y: number) => void;
type SetCanvasZoom = (pct: number) => void;

/**
 * useZoomWheel
 * ------------------------------------------------------------
 * Ctrl + Wheel 로 캔버스를 줌 인/아웃한다.
 *
 * 핵심 목표:
 * - "마우스 포인터 아래의 캔버스(논리) 좌표"가 줌 전/후에도
 *   화면에서 같은 위치에 있도록(= 포인터 기준 줌) panX/panY를 같이 보정한다.
 *
 * 좌표계 정리:
 * - screen 좌표(sx, sy): stage DOM 내부 픽셀 좌표 (좌상단이 0,0)
 * - canvas 좌표(cx, cy): 줌/팬 적용 전의 논리 좌표 (section.x/y 같은 값이 존재하는 좌표계)
 *
 * 변환식(정방향):
 *   sx = panX + cx * zoom
 *   sy = panY + cy * zoom
 *
 * 역변환식(화면 -> 논리):
 *   cx = (sx - panX) / zoom
 *   cy = (sy - panY) / zoom
 *
 * 포인터 고정 줌(pan 보정):
 * - 줌 전/후에 같은 cx가 같은 sx에 남아야 함
 *   sx = panX + cx * prev
 *   sx = newPanX + cx * next
 *   => newPanX = panX + cx * (prev - next)
 *   (y도 동일)
 */
export function useZoomWheel(opts: {
  /** 줌/팬이 적용되는 stage DOM 참조 */
  stageRef: React.RefObject<HTMLDivElement | null>;

  /** 현재 누적 팬(평행이동) 값: 화면(stage) 기준 픽셀 단위 */
  panX: number;
  panY: number;

  /** 현재 줌 배율 (예: 1 = 100%, 0.5 = 50%, 2 = 200%) */
  zoom: number;

  /** 줌을 퍼센트로 저장하는 setter (예: 110) */
  setCanvasZoom: SetCanvasZoom;

  /** 팬 값을 저장하는 setter (px) */
  setPan: SetPan;
}) {
  const { stageRef, panX, panY, zoom, setCanvasZoom, setPan } = opts;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Ctrl 키가 눌린 상태에서만 캔버스 줌을 수행한다.
      // (브라우저 기본 스크롤은 유지)
      if (!e.ctrlKey) return;

      const stage = stageRef.current;
      if (!stage) return;

      // 포인터가 stage 내부에 있을 때만 캔버스 줌을 먹인다.
      // (stage 밖에서 ctrl+wheel은 브라우저/OS 기본 줌 등으로 남겨둘 수 있음)
      const rect = stage.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) return;

      // stage 내부에서만 브라우저 기본 줌/스크롤 동작을 막는다.
      // passive:false 여야 preventDefault가 동작한다.
      e.preventDefault();

      // 1) 포인터의 screen 좌표(stage 내부 픽셀 좌표) 계산
      // - rect.left/top을 빼서 stage 좌상단을 (0,0)으로 맞춘다.
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      // 2) 포인터 아래의 canvas(논리) 좌표를 역변환으로 구한다.
      // - pan(translate)을 먼저 되돌리고, zoom(scale)을 되돌린다.
      const cx = (sx - panX) / zoom;
      const cy = (sy - panY) / zoom;

      // 3) 이번 wheel 이벤트 전의 줌(prev)에서, 변경 후 줌(next) 계산
      const prev = zoom;

      // wheel 방향에 따라 확대/축소 비율 결정
      // - deltaY < 0: 위로 휠(대개 확대)
      // - deltaY > 0: 아래로 휠(대개 축소)
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;

      // 줌 범위를 [0.25 ~ 2]로 제한 (25% ~ 200%)
      const next = Math.max(0.25, Math.min(2, prev * factor));

      // 외부 store는 퍼센트 단위로 저장한다고 가정 (1.1 -> 110)
      const nextPct = Math.round(next * 100);

      // 4) 포인터 고정 줌을 위한 pan 보정
      // - 줌이 변해도, "같은 canvas 좌표(cx,cy)"가 "같은 screen 좌표(sx,sy)"에 남도록
      //   newPan을 계산한다.
      //
      //   sx = panX + cx * prev
      //   sx = newPanX + cx * next
      //   => newPanX = panX + cx * (prev - next)
      const newPanX = panX + cx * (prev - next);
      const newPanY = panY + cy * (prev - next);

      // 5) 상태 반영: 줌과 pan을 함께 갱신해야 포인터 고정이 유지된다.
      setCanvasZoom(nextPct);
      setPan(newPanX, newPanY);
    };

    // capture: true
    // - wheel 이벤트를 캡처 단계에서 먼저 받아(중간 요소의 스크롤 처리보다 우선) 안정적으로 처리
    //
    // passive: false
    // - preventDefault()로 브라우저 기본 동작(줌/스크롤)을 막기 위해 필요
    const listenerOpts: AddEventListenerOptions = {
      capture: true,
      passive: false,
    };

    window.addEventListener("wheel", handleWheel, listenerOpts);
    return () => window.removeEventListener("wheel", handleWheel, listenerOpts);
  }, [stageRef, panX, panY, zoom, setCanvasZoom, setPan]);
}
