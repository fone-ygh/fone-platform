// src/features/editor/components/canvas/hooks/useZoomWheel.ts
import { useEffect } from "react";

type SetPan = (x: number, y: number) => void;
type SetCanvasZoom = (pct: number) => void;

export function useZoomWheel(opts: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  panX: number;
  panY: number;
  zoom: number;
  setCanvasZoom: SetCanvasZoom;
  setPan: SetPan;
}) {
  const { stageRef, panX, panY, zoom, setCanvasZoom, setPan } = opts;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) return;

      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const cx = (sx - panX) / zoom;
      const cy = (sy - panY) / zoom;

      const prev = zoom;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const next = Math.max(0.25, Math.min(2, prev * factor));
      const nextPct = Math.round(next * 100);

      // 포커스 지점 고정
      const newPanX = panX + cx * (prev - next);
      const newPanY = panY + cy * (prev - next);

      setCanvasZoom(nextPct);
      setPan(newPanX, newPanY);
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    window.addEventListener("wheel", handleWheel, opts);
    return () => window.removeEventListener("wheel", handleWheel, opts);
  }, [stageRef, panX, panY, zoom, setCanvasZoom, setPan]);
}
