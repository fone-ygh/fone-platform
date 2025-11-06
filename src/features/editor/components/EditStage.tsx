import React, { useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";

import Box from "@/shared/components/ui/box/Box";
import { useWheelZoom } from "@/shared/hooks/useWheelZoom";
import useResizeStore from "@/shared/store/resize";

import { useEDITORStore } from "../_lib/store";
import { LayoutState, SectionItem } from "../layout/types/layout";

/* ========= Tokens (스타일용 그대로) ========= */
const T = {
  bg: "#ffffff",
  bgSoft: "#f6f8fb",
  ink: "#0f172a",
  sub: "#6b7280",
  b1: "#e5e7eb",
  b2: "#c9d4e7",
  blue: "#1f6feb",
  blue2: "#0084fe",
  ring: "rgba(0,132,254,.16)",
  gutter: 16,
  radius: 12,
};

/* ========= Helpers (격자용) ========= */
export default function EditStage() {
  const itemRefs = useRef<any>();
  const { canvasWidth, canvasHeight, showGrid, gridSize, gridColor } =
    useEDITORStore();
  const zoom = useEDITORStore(s => s.zoom); // 0~200 같은 퍼센트라 가정
  const setZoom = useEDITORStore(s => s.actions.setZoom);
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useMemo(
    () => Math.min(2, Math.max(0.25, (zoom || 100) / 100)),
    [zoom],
  );
  useWheelZoom({
    containerRef: outerRef,
    getScale: () => scale,
    setScale: updater =>
      setZoom((prevZoom: number) => {
        const prevScale = (prevZoom ?? 100) / 100;
        const nextScale =
          typeof updater === "function" ? updater(prevScale) : updater;
        return Math.round(nextScale * 100); // %로 저장
      }),
    min: 0.25,
    max: 2,
  });

  const gridBg = (color = gridColor) => `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `;
  const DEFAULT_SECTIONS: SectionItem[] = [
    {
      id: "section-1",
      title: "header",
      type: "box",
      x: 12,
      y: 12,
      width: 1160,
      height: 80,
      radius: 0,
      shadow: 0,
    },
    {
      id: "section-2",
      title: "sider",
      type: "box",
      x: 12,
      y: 108,
      width: 280,
      height: 300,
      radius: 0,
      shadow: 0,
    },
    {
      id: "section-3",
      title: "main",
      type: "box",
      x: 304,
      y: 108,
      width: 868,
      height: 300,
      radius: 0,
      shadow: 0,
    },
    {
      id: "section-4",
      title: "footer",
      type: "box",
      x: 12,
      y: 422,
      width: 1160,
      height: 80,
      radius: 0,
      shadow: 0,
    },
  ];
  return (
    <Viewport ref={outerRef}>
      <StageFrame>
        <ScaledWrap
          style={{
            width: canvasWidth * scale,
            height: canvasHeight * scale,
          }}
        >
          <Stage
            style={{
              position: "relative",
              width: canvasWidth,
              height: canvasHeight,
              backgroundImage: showGrid ? gridBg() : "unset",
              backgroundSize:
                showGrid && gridSize ? `${gridSize}px ${gridSize}px` : "unset",

              transform: `scale(${zoom / 100})`,
              transformOrigin: "0 0",
            }}
            role="figure"
            aria-label="Canvas"
          >
            {DEFAULT_SECTIONS?.map((item, idx) => {
              return (
                <Box
                  key={item?.id}
                  id={item?.id}
                  component="div"
                  ref={itemRefs}
                  resizable
                  draggable
                  width={item?.width}
                  height={item?.height}
                  minWidth={10}
                  minHeight={10}
                  x={item?.x}
                  y={item?.y}
                  style={{
                    borderRadius: `${item?.radius}px`,
                    border: "1px solid #c5dfff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "2rem",
                    backgroundColor: "#c5dfff6b",
                  }}
                  snappable
                  snapGridWidth={gridSize}
                  snapGridHeight={gridSize}
                  elementGuidelines={[itemRefs]}
                >
                  {item?.title}
                </Box>
              );
            })}
          </Stage>
        </ScaledWrap>
      </StageFrame>
    </Viewport>
  );
}

/* Workspace (스타일 그대로) */
const Viewport = styled.div`
  position: relative;
  overflow: auto;
  display: grid;
  place-items: start center;
  height: 100%;
  padding: 2rem;

  /* 바깥 ‘워크벤치’는 은은한 배경만 — 보더 X */

  /* thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #c5d3e8 transparent;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c5d3e8;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const StageFrame = styled.div`
  background: #0075f60a;
  backdrop-filter: saturate(1.05) blur(4px);
  box-shadow:
    0 14px 10px rgba(15, 23, 42, 0.12),
    0 8px 10px rgba(15, 23, 42, 0.06);
`;

const Stage = styled.div`
  background: #fff;
  border: 1px solid #0000001e;
  user-select: none;
  overflow: hidden;
  border-radius: 12px;
  /* box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.05); */
`;
const ScaledWrap = styled.div`
  position: relative;
`;
