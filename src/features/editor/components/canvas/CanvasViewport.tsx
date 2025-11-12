// src/features/editor/components/canvas/CanvasViewport.tsx
"use client";

import React from "react";

import { useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";

type Props = { children: React.ReactNode };

export default function CanvasViewport({ children }: Props) {
  const canvasWidth = useLayoutStore(s => s.canvasWidth);
  const canvasHeight = useLayoutStore(s => s.canvasHeight);
  const canvasZoom = useEDITORStore(s => s.canvasZoom);

  return (
    <div className="canvas-viewport" aria-label="Canvas viewport">
      <div
        className="canvas-center"
        style={{
          // 여백 포함 최소 사이즈(너무 작을 때만 적용)
          minWidth: Math.min(canvasWidth + 48, 1600),
          minHeight: Math.min(canvasHeight + 48, 1200),
        }}
      >
        {children}
      </div>

      {/* 우하단 줌 인디케이터(보조) */}
      <div className="zoom-indicator" aria-hidden="true">
        {canvasZoom}%
      </div>

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.canvas-viewport{
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;              /* 스테이지가 더 크면 여기서만 스크롤 */
  overscroll-behavior: contain;/* 페이지로 스크롤 전파 방지 */
  background: #f6f8fb;         /* 라이트 톤 배경 */
}

.canvas-center{
  position: relative;
  display: grid;
  place-items: start center;   /* 중앙 정렬(위쪽 기준으로 살짝 여유) */
  padding: 24px;               /* 캔버스 가장자리 여백 */
  box-sizing: border-box;
}

.zoom-indicator{
  position: sticky;            /* 스크롤 컨테이너 기준으로 고정 */
  right: 16px;
  bottom: 16px;
  z-index: 20;
  width: 68px;
  height: 32px;
  display:flex;align-items:center;justify-content:center;
  font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  color:#334155;
  background: rgba(255,255,255,.9);
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  pointer-events: none;
}

@media (prefers-color-scheme: dark) {
  .canvas-viewport { background: #0b1020; }
  .zoom-indicator {
    color: #e2e8f0;
    background: rgba(15, 23, 42, .85);
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 2px 10px rgba(0,0,0,.4);
  }
}
`;
