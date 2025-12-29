// src/features/editor/components/canvas/FrameCanvasViewport.tsx
"use client";

import * as React from "react";

import { useEDITORActions } from "@/shared/store/editor/control";
import { useFrameLayoutVM } from "@/shared/store/editor/frameLayout/useFrameLayoutVM";

export default function FrameCanvasViewport({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ frame은 드릴다운 개념 없이, 프레임 전체 크기가 곧 view
  const { frameWidth, frameHeight } = useFrameLayoutVM();
  const { setCanvasZoom, setPan } = useEDITORActions();

  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const fit = () => {
      const rect = el.getBoundingClientRect();
      const vw = rect.width;
      const vh = rect.height;
      if (vw <= 0 || vh <= 0) return;

      const w = Math.max(1, frameWidth);
      const h = Math.max(1, frameHeight);

      const padding = 24;
      const availW = Math.max(1, vw - padding * 2);
      const availH = Math.max(1, vh - padding * 2);

      const rawScale = Math.min(availW / w, availH / h, 1);
      const scale = Math.max(0.25, Math.min(2, rawScale));
      const zoomPct = Math.round(scale * 100);

      const panX = Math.round((vw - w * scale) / 2);
      const panY = Math.round((vh - h * scale) / 2);

      setCanvasZoom(zoomPct);
      setPan(panX, panY);
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(el);

    return () => ro.disconnect();
  }, [frameWidth, frameHeight, setCanvasZoom, setPan]);

  return (
    <div
      ref={viewportRef}
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
