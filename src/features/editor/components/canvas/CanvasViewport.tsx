// src/features/editor/components/canvas/CanvasViewport.tsx
"use client";

import * as React from "react";

import { useEDITORActions } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";

export default function CanvasViewport({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  const { canvasWidth, canvasHeight } = useLayoutStore();
  const { setCanvasZoom, setPan } = useEDITORActions();

  // 최초 1회만 자동 fit (사용자가 한번이라도 손대면 자동으로 바뀌지 않게)
  const didFitRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || didFitRef.current) return;

    const fit = () => {
      const rect = el.getBoundingClientRect();
      const vw = rect.width;
      const vh = rect.height;
      if (vw <= 0 || vh <= 0) return;

      const padding = 24; // 캔버스 주변 여백
      const availW = Math.max(1, vw - padding * 2);
      const availH = Math.max(1, vh - padding * 2);

      // zoom out 해서라도 전체가 화면 안에 들어오게
      const rawScale = Math.min(availW / canvasWidth, availH / canvasHeight, 1);

      // CanvasStage에서 0.25~2로 clamp 하고 있으니 여기서도 동일하게
      const scale = Math.max(0.25, Math.min(2, rawScale));
      const zoomPct = Math.round(scale * 100);

      // 가운데 정렬 pan
      const panX = Math.round((vw - canvasWidth * scale) / 2);
      const panY = Math.round((vh - canvasHeight * scale) / 2);

      setCanvasZoom(zoomPct);
      setPan(panX, panY);

      didFitRef.current = true;
    };

    // 첫 페인트 이후 실제 사이즈 기준으로 잡기
    requestAnimationFrame(fit);

    // (옵션) 최초 레이아웃 측정이 0으로 잡히는 경우 대비
    const ro = new ResizeObserver(() => {
      if (!didFitRef.current) fit();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [canvasWidth, canvasHeight, setCanvasZoom, setPan]);

  return (
    <div
      ref={viewportRef}
      style={{
        flex: 1,
        minWidth: 0, // flex overflow 방지 (중요)
        minHeight: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
