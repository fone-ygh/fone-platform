// src/features/editor/components/canvas/CanvasStage.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";

import ColumnsOverlay from "../overlays/ColumnsOverlay";
import type { Rect } from "./hooks/collision";
import { useDomHandles } from "./hooks/useDomHandles";
import { useMarqueeSelection } from "./hooks/useMarqueeSelection";
import { useOverlapResolver } from "./hooks/useOverlapResolver";
import { useSpaceDragPan } from "./hooks/useSpaceDragPan";
import { useZoomWheel } from "./hooks/useZoomWheel";
import MarqueeSelection from "./MarqueeSelection";
import SectionItemView from "./SectionItemView";

// Moveable를 내부적으로 쓰는 Box는 클라이언트 전용 로딩 권장
const Box = dynamic(() => import("@/shared/components/ui/box/Box"), {
  ssr: false,
});

export default function CanvasStage() {
  // ---- layout ----
  const canvasWidth = useLayoutStore(s => s.canvasWidth);
  const canvasHeight = useLayoutStore(s => s.canvasHeight);
  const sections = useLayoutStore(s => s.sections);
  const selectedIds = useLayoutStore(s => s.selectedIds);
  const setSelectedIds = useLayoutStore(s => s.actions.setSelectedIds);
  const updateFrame = useLayoutStore(s => s.actions.setUpdateFrame);
  const commitAfterTransform = useLayoutStore(
    s => s.actions.setCommitAfterTransform,
  );

  // ---- editor (grid/zoom/pan/snap) ----
  const showGrid = useEDITORStore(s => s.showGrid);
  const gridSize = useEDITORStore(s => s.gridSize);
  const gridColor = useEDITORStore(s => s.gridColor);

  const canvasZoomPct = useEDITORStore(s => s.canvasZoom);
  const setCanvasZoom = useEDITORStore(s => s.actions.setCanvasZoom);

  const panX = useEDITORStore(s => s.panX);
  const panY = useEDITORStore(s => s.panY);
  const setPan = useEDITORStore(s => s.actions.setPan);

  const snapToGrid = useEDITORStore(s => s.snapToGrid);
  const snapToElements = useEDITORStore(s => s.snapToElements);
  const snapToGuides = useEDITORStore(s => s.snapToGuides);

  const zoom = Math.max(0.25, Math.min(2, canvasZoomPct / 100));

  const stageRef = useRef<HTMLDivElement | null>(null);

  // 줌/팬 레이어 DOM
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const setZoomLayerRef = (node: HTMLDivElement | null) => setContainerEl(node);

  // 배경 격자
  const gridBg = useMemo(
    () =>
      `linear-gradient(to right, ${gridColor} 1px, transparent 1px),
       linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    [gridColor],
  );

  // === 훅들 연결 ===
  useZoomWheel({ stageRef, panX, panY, zoom, setCanvasZoom, setPan });

  const {
    isSpace,
    isPanning,
    cursor,
    onMouseDownCapture,
    handlePanMouseMove,
    onMouseUp: panUp,
  } = useSpaceDragPan({ zoom, panX, panY, setPan, compensateZoom: true });

  const {
    marquee,
    onDown: marqueeDown,
    onMove: marqueeMove,
    onUp: marqueeUp,
  } = useMarqueeSelection({
    stageRef,
    panX,
    panY,
    zoom,
    sections,
    setSelectedIds,
  });

  const { overlaps, calcLive, resolveOnEnd } = useOverlapResolver(sections);

  const { selectedEls, guidelineEls } = useDomHandles({
    sections,
    selectedIds,
    snapToElements,
  });

  const snappable = snapToGrid || snapToElements || snapToGuides;
  const snapGrid = snapToGrid ? gridSize : 0;
  const activeId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : "";

  // === Stage 이벤트 ===
  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning) return;
    marqueeDown(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (handlePanMouseMove(e)) return; // 팬 중이면 여기서 종료
    marqueeMove(e);
  };

  const onMouseUp = () => {
    panUp();
    marqueeUp();
  };

  return (
    <div
      ref={stageRef}
      className="stage"
      onMouseDownCapture={onMouseDownCapture}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        position: "relative",
        border: "1px solid rgba(0,0,0,.12)",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        userSelect: "none",
      }}
    >
      {/* 줌/팬 레이어 */}
      <div
        ref={setZoomLayerRef}
        className="zoom-layer"
        style={{
          position: "relative",
          width: canvasWidth,
          height: canvasHeight,
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
          backgroundImage: showGrid ? gridBg : "none",
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : "auto",
          cursor,
        }}
      >
        <ColumnsOverlay />

        {sections
          .slice()
          .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
          .map(s => {
            const isSelected = selectedIds.includes(s.id);
            const isActive = activeId === s.id;

            return (
              <Box
                key={s.id}
                id={s.id}
                active={isActive}
                onActiveChange={act => {
                  if (act) setSelectedIds([s.id]);
                }}
                width={s.width}
                height={s.height}
                x={s.x}
                y={s.y}
                draggable
                resizable
                containerEl={containerEl as any}
                targets={selectedEls.length > 1 ? selectedEls : undefined}
                snappable={snappable}
                snapGridWidth={snapGrid}
                snapGridHeight={snapGrid}
                elementGuidelines={guidelineEls}
                // 실시간 겹침 하이라이트
                onDrag={(e: any) => {
                  if (isPanning) return;
                  const target = e.target as HTMLElement;
                  const cs = getComputedStyle(target);
                  const w = parseFloat(cs.width || "") || s.width;
                  const h = parseFloat(cs.height || "") || s.height;
                  const cand: Rect = { x: e.left, y: e.top, w, h };
                  calcLive(s.id, cand);
                }}
                onResize={(e: any) => {
                  if (isPanning) return;
                  const target = e.target as HTMLElement;
                  const l =
                    e.drag?.left ?? parseFloat(target.style.left || "") ?? s.x;
                  const t =
                    e.drag?.top ?? parseFloat(target.style.top || "") ?? s.y;
                  const w =
                    e.width ?? parseFloat(target.style.width || "") ?? s.width;
                  const h =
                    e.height ??
                    parseFloat(target.style.height || "") ??
                    s.height;
                  const cand: Rect = { x: l, y: t, w, h };
                  calcLive(s.id, cand);
                }}
                // 종료 시 겹침 해소 + 커밋
                onDragEnd={(e: any) => {
                  if (isPanning) return;
                  const el = e.target as HTMLElement;
                  const cs = getComputedStyle(el);
                  const nx =
                    e.lastEvent?.left ?? parseFloat(cs.left || "") ?? s.x;
                  const ny =
                    e.lastEvent?.top ?? parseFloat(cs.top || "") ?? s.y;
                  const w = parseFloat(cs.width || "") || s.width;
                  const h = parseFloat(cs.height || "") || s.height;

                  const proposal: Rect = { x: nx, y: ny, w, h };
                  const prev: Rect = {
                    x: s.x,
                    y: s.y,
                    w: s.width,
                    h: s.height,
                  };
                  const fixed = resolveOnEnd(s.id, proposal, prev); // GAP=1 보장

                  el.style.left = `${fixed.x}px`;
                  el.style.top = `${fixed.y}px`;

                  updateFrame(s.id, { x: fixed.x, y: fixed.y });
                  commitAfterTransform();
                }}
                onResizeEnd={(e: any) => {
                  if (isPanning) return;
                  const el = e.target as HTMLElement;
                  const cs = getComputedStyle(el);

                  const l = parseFloat(cs.left || "") || s.x;
                  const t = parseFloat(cs.top || "") || s.y;
                  const w =
                    e.lastEvent?.width ?? parseFloat(cs.width || "") ?? s.width;
                  const h =
                    e.lastEvent?.height ??
                    parseFloat(cs.height || "") ??
                    s.height;

                  const proposal: Rect = { x: l, y: t, w, h };
                  const prev: Rect = {
                    x: s.x,
                    y: s.y,
                    w: s.width,
                    h: s.height,
                  };
                  const fixed = resolveOnEnd(s.id, proposal, prev); // GAP=1 보장

                  el.style.left = `${fixed.x}px`;
                  el.style.top = `${fixed.y}px`;
                  el.style.width = `${w}px`;
                  el.style.height = `${h}px`;

                  updateFrame(s.id, {
                    x: fixed.x,
                    y: fixed.y,
                    width: w,
                    height: h,
                  });
                  commitAfterTransform();
                }}
              >
                <SectionItemView
                  item={s}
                  selected={isSelected}
                  onRequestSelect={multi =>
                    setSelectedIds(
                      multi
                        ? isSelected
                          ? selectedIds.filter(id => id !== s.id)
                          : [...selectedIds, s.id]
                        : [s.id],
                    )
                  }
                />
              </Box>
            );
          })}

        {/* 겹침 하이라이트 */}
        {overlaps.length > 0 && (
          <div aria-hidden>
            {overlaps.map((r, i) => (
              <div
                key={`ov-${i}-${r.x}-${r.y}-${r.w}-${r.h}`}
                style={{
                  position: "absolute",
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  height: r.h,
                  background: "rgba(220, 38, 38, 0.18)",
                  border: "1px solid rgba(220, 38, 38, 0.65)",
                  pointerEvents: "none",
                  mixBlendMode: "multiply",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        )}

        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
