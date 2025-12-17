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

  // 레이아웃 스토어에서 scopeParentId & sections 도 같이 읽기
  const { canvasWidth, canvasHeight, sections, scopeParentId } =
    useLayoutStore();
  const { setCanvasZoom, setPan } = useEDITORActions();

  // 지금 화면에 실제로 보여야 하는 "뷰 크기" (root or 드릴다운)
  const { viewWidth, viewHeight } = React.useMemo(() => {
    if (!scopeParentId) {
      // 루트 화면
      return { viewWidth: canvasWidth, viewHeight: canvasHeight };
    }

    const container = sections.find(s => s.id === scopeParentId);
    if (!container) {
      // 혹시 못 찾으면 안전하게 전체 캔버스로
      return { viewWidth: canvasWidth, viewHeight: canvasHeight };
    }

    return { viewWidth: container.width, viewHeight: container.height };
  }, [canvasWidth, canvasHeight, sections, scopeParentId]);

  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const fit = () => {
      const rect = el.getBoundingClientRect();
      const vw = rect.width;
      const vh = rect.height;
      if (vw <= 0 || vh <= 0) return;

      const padding = 24; // 캔버스 주변 여백
      const availW = Math.max(1, vw - padding * 2);
      const availH = Math.max(1, vh - padding * 2);

      // 현재 viewWidth/viewHeight 기준으로 배율 계산
      const rawScale = Math.min(
        availW / viewWidth,
        availH / viewHeight,
        1, // 너무 확대되진 않게 100% 이상은 막기
      );

      // CanvasStage 에서도 0.25~2 로 clamp 하니까 동일하게
      const scale = Math.max(0.25, Math.min(2, rawScale));
      const zoomPct = Math.round(scale * 100);

      // 가운데 정렬 pan
      const panX = Math.round((vw - viewWidth * scale) / 2);
      const panY = Math.round((vh - viewHeight * scale) / 2);

      setCanvasZoom(zoomPct);
      setPan(panX, panY);
    };

    // 1) 진입 / scope 변경 시
    fit();

    // 2) viewport 크기 바뀔 때도 다시 fit (브라우저 리사이즈 등)
    const ro = new ResizeObserver(() => {
      fit();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [viewWidth, viewHeight, setCanvasZoom, setPan]);

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
