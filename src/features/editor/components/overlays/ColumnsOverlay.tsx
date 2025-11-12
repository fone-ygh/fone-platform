// src/features/editor/components/overlays/ColumnsOverlay.tsx
"use client";

import React, { useMemo } from "react";

import { useLayoutStore } from "@/shared/store/layout";

/**
 * 캔버스 위에 컬럼 오버레이를 그려주는 레이어
 * - 모든 훅은 최상위에서 호출(규칙 위반 방지)
 * - showColumns가 false여도 훅은 호출되며, 최종적으로만 null 반환
 */
export default function ColumnsOverlay() {
  // ✅ 모든 훅은 최상위에서 호출
  const showColumns = useLayoutStore(s => s.showColumns);
  const canvasWidth = useLayoutStore(s => s.canvasWidth);
  const canvasHeight = useLayoutStore(s => s.canvasHeight);
  const columns = useLayoutStore(s => s.columns);
  const gutter = useLayoutStore(s => s.gutter);
  const containerPadding = useLayoutStore(s => s.containerPadding);

  // 렌더용 컬럼 rect 계산(항상 호출되지만, showColumns=false면 사용만 안 함)
  const rects = useMemo(() => {
    const colCount = Math.max(1, columns || 1);
    const inner = Math.max(0, canvasWidth - containerPadding * 2);
    const totalGutters = Math.max(0, (colCount - 1) * (gutter || 0));
    const colW = colCount > 0 ? (inner - totalGutters) / colCount : inner;

    return Array.from({ length: colCount }, (_, i) => ({
      left: containerPadding + i * (colW + (gutter || 0)),
      width: colW,
    }));
  }, [canvasWidth, columns, gutter, containerPadding]);

  // 이제서야 조건부 렌더링
  if (!showColumns) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {/* 좌/우 패딩 영역 강조 */}
      {containerPadding > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: containerPadding,
              background: "rgba(16,185,129,.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: containerPadding,
              background: "rgba(16,185,129,.06)",
            }}
          />
        </>
      )}

      {/* 컬럼들 */}
      {rects.map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: r.left,
            width: r.width,
            background: "rgba(37,99,235,.06)",
            boxShadow:
              i < rects.length - 1 && gutter
                ? `inset -${gutter}px 0 0 0 rgba(0,0,0,0)` // 시각적 간격
                : undefined,
          }}
        />
      ))}

      {/* 경계선(선택) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: "1px dashed rgba(0,0,0,.06)",
        }}
      />
    </div>
  );
}
