"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";

import Box from "@/shared/components/ui/box/Box";
import { useGuides, type GuideLine } from "@/shared/hooks/useGuides";
import { useWheelZoom } from "@/shared/hooks/useWheelZoom";
import { useEDITORStore } from "@/shared/store/control";

import { SectionItem } from "../layout/types/layout";

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

/* ========= Helpers ========= */
type Rect = { x: number; y: number; w: number; h: number };
function toRect(
  targetEl: HTMLElement,
  stageEl: HTMLElement,
  scale: number,
): Rect {
  const sr = stageEl.getBoundingClientRect();
  const r = targetEl.getBoundingClientRect(); // 회전 포함 AABB
  return {
    x: (r.left - sr.left) / scale,
    y: (r.top - sr.top) / scale,
    w: r.width / scale,
    h: r.height / scale,
  };
}

/* ========= Component ========= */
export default function EditStage() {
  const { canvasWidth, canvasHeight, showGrid, gridSize, gridColor } =
    useEDITORStore();
  const zoom = useEDITORStore(s => s.zoom); // 0~200 (%)
  const setZoom = useEDITORStore(s => s.actions.setZoom);

  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /* ✅ 각 아이템 DOM을 보관하는 ref 맵 (id -> HTMLElement) */
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ✅ Moveable elementGuidelines용 안전한 배열 상태 */
  const [elementGuides, setElementGuides] = useState<HTMLElement[]>([]);
  const rafIdRef = useRef<number | null>(null);

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

  const DEFAULT_SECTIONS: SectionItem[] = useMemo(
    () => [
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
    ],
    [],
  );

  /* === Guides hook 연결 === */
  const {
    guideLines,
    showForRect,
    clear: clearGuides,
  } = useGuides({
    canvasWidth,
    canvasHeight,
    columnLines: [],
    threshold: Math.max(4, Math.floor((gridSize || 10) / 2)),
    enabled: true,
  });

  /* ✅ elementGuides 최신화 (렌더 중 ref 접근 방지 → rAF로 배치) */
  function updateElementGuides() {
    const list: HTMLElement[] = [];
    for (const el of Object.values(itemRefs.current)) {
      if (el) list.push(el);
    }
    setElementGuides(list);
  }

  function scheduleUpdateElementGuides() {
    if (typeof window === "undefined") return;

    // 1) 직전에 예약해 둔 rAF가 있으면 취소
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    // 2) 다음 프레임에 딱 한 번만 실행하도록 예약
    rafIdRef.current = requestAnimationFrame(updateElementGuides);
  }

  useEffect(() => {
    scheduleUpdateElementGuides();
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ✅ elementGuidelines prop에는 항상 null이 제거된 배열을 */
  const safeElementGuides = useMemo<HTMLElement[]>(
    () => elementGuides.filter(Boolean),
    [elementGuides],
  );

  /* ✅ 드래그/리사이즈 중: 현재 DOM 기준으로 me/others 계산 */
  const handleLiveGuide = (e: any) => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const target = e?.target as HTMLElement | null;
    if (!target) return;

    // 나 자신
    const me = toRect(target, stageEl, scale);

    // 다른 애들: 매번 현재 DOM에서 읽어오기 (DEFAULT_SECTIONS 사용 X)
    const others: Rect[] = [];
    for (const [id, el] of Object.entries(itemRefs.current)) {
      if (!el || id === target.id) continue;
      others.push(toRect(el, stageEl, scale));
    }

    // nearOnly = true
    showForRect(me, others, true);
  };

  /* ✅ 드래그/리사이즈 끝: 가이드 제거 + elementGuides 새로고침 */
  const handleEnd = () => {
    clearGuides();
    scheduleUpdateElementGuides();
  };

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
            ref={stageRef}
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
            {DEFAULT_SECTIONS.map(item => (
              <Box
                key={item.id}
                id={item.id}
                component="div"
                /* ✅ 각 아이템을 개별 ref 콜백으로 맵에 저장 */
                ref={(el: HTMLElement | null) => {
                  // console.log(el);
                  itemRefs.current[item.id] = el; // 1) 현재 아이템 id 키로 DOM 넣어두기
                  scheduleUpdateElementGuides(); // 2) 다음 animation frame에 elementGuidelines 갱신
                }}
                draggable
                resizable
                width={item.width}
                height={item.height}
                minWidth={10}
                minHeight={10}
                x={item.x}
                y={item.y}
                style={{
                  borderRadius: `${item.radius}px`,
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
                /* ✅ elementGuidelines에는 현재 DOM 요소 배열을 전달 */
                elementGuidelines={safeElementGuides}
                onDrag={handleLiveGuide}
                onResize={handleLiveGuide}
                onDragEnd={handleEnd}
                onResizeEnd={handleEnd}
              >
                {item.title}
              </Box>
            ))}

            {/* Guides Layer (Stage 안, scale과 함께 움직이도록) */}
            {/* <GuidesLayer lines={guideLines} /> */}
          </Stage>
        </ScaledWrap>
      </StageFrame>
    </Viewport>
  );
}

/* ========= Guides Layer ========= */
function GuidesLayer({ lines }: { lines: GuideLine[] }) {
  return (
    <>
      {lines.map((g, i) =>
        g.orientation === "v" ? (
          <div
            key={`gv-${i}`}
            style={{
              position: "absolute",
              left: g.pos,
              top: g.from,
              width: 1,
              height: g.to - g.from,
              background: "rgba(0,132,254,.95)",
              pointerEvents: "none",
              zIndex: 999,
            }}
          />
        ) : (
          <div
            key={`gh-${i}`}
            style={{
              position: "absolute",
              top: g.pos,
              left: g.from,
              height: 1,
              width: g.to - g.from,
              background: "rgba(0,132,254,.95)",
              pointerEvents: "none",
              zIndex: 999,
            }}
          />
        ),
      )}
    </>
  );
}

/* ========= Workspace (스타일 그대로) ========= */
const Viewport = styled.div`
  position: relative;
  overflow: auto;
  display: grid;
  place-items: start center;
  height: 100%;
  padding: 2rem;

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
`;

const ScaledWrap = styled.div`
  position: relative;
`;
