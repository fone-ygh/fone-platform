// useCursorWheelZoom.ts
import { useEffect, useRef } from "react";

type Opts = {
  containerRef: React.RefObject<HTMLElement>; // Viewport (overflow:auto)
  getScale: () => number; // 현재 배율 (예: zoom% → zoom/100)
  setScale: (next: number | ((prev: number) => number)) => void; // 배율 설정자
  min?: number;
  max?: number;
  sensitivity?: number; // 0.0015~0.003 권장
  requireCtrlKey?: boolean; // Ctrl/⌘ + 휠에서만 줌
};

export function useWheelZoom({
  containerRef,
  getScale,
  setScale,
  min = 0.25,
  max = 2,
  sensitivity = 0.002,
  requireCtrlKey = true,
}: Opts) {
  const rafRef = useRef<number>();

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (requireCtrlKey && !(e.ctrlKey || e.metaKey)) return;

      e.preventDefault(); // 브라우저 기본 줌/스크롤 방지

      /**
       * e.clientX = “브라우저 화면(뷰포트) 왼쪽 경계”를 0으로 하는 마우스 X좌표(CSS px)
       * rect.left = el.getBoundingClientRect()가 돌려주는 값 중 하나로, 해당 요소의 “왼쪽 테두리”가 화면 왼쪽에서 얼마나 떨어져 있는지(CSS px)
       * e.clientX - rect.left를 하면,
       * 그 요소 내부에서(요소 왼쪽 위를 0,0으로) 마우스가 어느 X 지점에 있는지가 나와.
       */
      const rect = el.getBoundingClientRect(); // 그 요소의 화면(뷰포트) 기준 박스 좌표
      const vx = e.clientX - rect.left; // 뷰포트 안에서의 커서 x
      const vy = e.clientY - rect.top; // 뷰포트 안에서의 커서 y

      const prev = getScale(); // 이전 배율
      const L = el.scrollLeft;
      const T = el.scrollTop;

      // 커서 아래의 세계좌표(스케일 이전 좌표)
      const worldX = (L + vx) / prev;
      const worldY = (T + vy) / prev;

      // 지수 스케일 → 트랙패드에서도 자연스러운 감도
      const factor = Math.exp(-e.deltaY * sensitivity);
      const next = clamp(prev * factor);

      // 새 스케일에서 커서 아래 좌표가 그대로 커서에 오도록 스크롤 보정
      const nextL = worldX * next - vx;
      const nextT = worldY * next - vy;

      // 1) 배율 먼저 갱신
      setScale(next);

      // 2) 다음 프레임에 스크롤 위치 보정 (레이아웃 반영 후)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        el.scrollLeft = nextL;
        el.scrollTop = nextT;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, getScale, setScale, min, max, sensitivity, requireCtrlKey]);
}
