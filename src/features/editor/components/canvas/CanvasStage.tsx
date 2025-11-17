"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";
import { useLayoutActions } from "@/shared/store/layout/store";
import type { Section } from "@/shared/store/layout/types";

import type { Rect } from "../../hooks/collision";
import { useDomHandles } from "../../hooks/useDomHandles";
import { useDragRect } from "../../hooks/useDragRect";
import { useKeyboardControl } from "../../hooks/useKeyboardControl";
import { useMarqueeSelection } from "../../hooks/useMarqueeSelection";
import { useOverlapResolver } from "../../hooks/useOverlapResolver";
import { useSpaceDragPan } from "../../hooks/useSpaceDragPan";
import { useZoomWheel } from "../../hooks/useZoomWheel";
import MarqueeSelection from "./MarqueeSelection";
import SectionItemView from "./SectionItemView";

// Moveable를 내부적으로 쓰는 Box는 클라이언트 전용 로딩 권장
const Box = dynamic(() => import("@/shared/components/ui/box/Box"), {
  ssr: false,
});

export default function CanvasStage() {
  useKeyboardControl();

  /* ========== Layout 상태 ========== */
  const { canvasWidth, canvasHeight, sections, selectedIds, insertTool } =
    useLayoutStore();

  const {
    setSelectedIds,
    setUpdateFrame,
    setCommitAfterTransform,
    setInsertTool,
  } = useLayoutActions() as any;

  const addSection = useLayoutStore(s => s.actions.setAddSection);

  /* ========== Editor 전역 상태(줌/팬/그리드/스냅) ========== */
  const {
    showGrid,
    gridSize,
    gridColor,
    canvasZoom: canvasZoomPct,
    panX,
    panY,
    snapToGrid,
    snapToElements,
    snapToGuides,
  } = useEDITORStore();
  const { setCanvasZoom, setPan } = useEDITORActions();

  // 25%~200% 사이에서 동작하도록 보정
  const zoom = Math.max(0.25, Math.min(2, canvasZoomPct / 100));

  /* ========== Stage/Zoom-Layer Ref ========== */
  const stageRef = useRef<HTMLDivElement | null>(null);

  // 실제로 scale/translate 되는 레이어 (좌표계 기준 컨테이너)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [isOOB, setIsOOB] = useState(false);

  const setZoomLayerRef = (node: HTMLDivElement | null) => setContainerEl(node);

  /* ========== 배경 격자 ========== */
  const gridBg = useMemo(
    () =>
      `linear-gradient(to right, ${gridColor} 1px, transparent 1px),
       linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    [gridColor],
  );

  /* ========== 훅 결합 ========== */

  // Ctrl+휠 줌(커서 기준 줌, 페이지 스크롤 방지)
  useZoomWheel({ stageRef, panX, panY, zoom, setCanvasZoom, setPan });

  // Space+Drag 팬(줌과 무관하게 화면 px 기준으로 이동)
  const {
    isPanning,
    cursor,
    onMouseDownCapture,
    handlePanMouseMove,
    onMouseUp: panUp,
  } = useSpaceDragPan({ zoom, panX, panY, setPan, compensateZoom: true });

  // 배경 마퀴 드래그 선택(교차 선택)
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

  // InsertTool용 Rect 드로잉
  const {
    dragRect,
    isDraggingRect,
    onDragRectDown,
    onDragRectMove,
    onDragRectUp,
    resetRect,
  } = useDragRect({ stageRef, panX, panY, zoom });

  // 겹침 하이라이트(드래그/리사이즈 중), 종료 시 1px도 겹치지 않도록 해소
  const { overlaps, calcLive, resolveOnEnd, setOverlaps } =
    useOverlapResolver(sections);

  // DOM 핸들 수집(그룹/가이드라인)
  const { selectedEls, guidelineEls } = useDomHandles({
    sections,
    selectedIds,
    snapToElements,
  });

  // 스냅 설정
  const snappable = snapToGrid || snapToElements || snapToGuides;
  const snapGridSize = snapToGrid ? gridSize : 0;

  // 활성 아이템(마지막 선택)
  const activeId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : "";

  /* ========== Stage 이벤트 ========== */
  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning) return; // 팬 중이면 마퀴/드로잉 막기

    // InsertTool이 켜져 있으면 Rect 드로잉 시작
    if (insertTool) {
      onDragRectDown(e);
      setSelectedIds([]);
      e.preventDefault();
      return;
    }

    // 기본: 마퀴 선택
    marqueeDown(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // 팬 중이면 여기서 처리 완료
    if (handlePanMouseMove(e)) return;

    if (insertTool) {
      onDragRectMove(e);
      return;
    }

    marqueeMove(e);
  };

  const onMouseUp = () => {
    panUp();

    // ---- InsertTool 모드에서 드로잉 끝났을 때 섹션 생성 ----
    // 드래그 Rect가 있고 (dragRect.on === true),
    // 최소 크기 (4px) 이상일 때만 실제 섹션을 만든다.
    // (오차로 생긴 아주 작은 드래그는 무시)
    if (insertTool && dragRect.on && dragRect.w > 4 && dragRect.h > 4) {
      // 값이 canvas 영역을 벗어나지 않도록 한 번 감싸는 유틸
      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));

      const x = Math.round(clamp(dragRect.x, 0, canvasWidth));
      const y = Math.round(clamp(dragRect.y, 0, canvasHeight));
      const w = Math.round(clamp(dragRect.w, 0, canvasWidth - Math.max(0, x)));
      const h = Math.round(clamp(dragRect.h, 0, canvasHeight - Math.max(0, y)));

      let init: Partial<Section> = {
        x,
        y,
        width: w,
        height: h,
      };

      if (insertTool === "box") {
        init = {
          ...init,
          title: "Box",
        };
      } else if (insertTool === "button") {
        init = {
          ...init,
          title: "Button",
          btnLabel: "Button",
        };
      } else if (insertTool === "tabs") {
        init = {
          ...init,
          title: "Tabs",
          tabs: [
            { label: "Tab 1", content: "첫 번째" },
            { label: "Tab 2", content: "두 번째" },
          ],
        };
      }

      const newId = addSection(insertTool, init);
      setSelectedIds([newId]);
      setCommitAfterTransform();
    } else if (!insertTool) {
      // InsertTool이 꺼져 있으면 원래대로 마퀴 업
      marqueeUp();
    }

    onDragRectUp();
    resetRect();

    // 한 번 그린 뒤 Select 모드로 복귀
    if (insertTool) {
      setInsertTool(null);
    }
  };

  // 컨테이너(zoom-layer) 경계 밖 여부 판단
  const isOutOfBounds = (r: Rect) => {
    return (
      r.x < 0 || r.y < 0 || r.x + r.w > canvasWidth || r.y + r.h > canvasHeight
    );
  };

  /* ========== 렌더링 ========== */
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
        overflow: "hidden",
        background: isOOB ? "rgba(220, 38, 38, 0.18)" : "#E5E7EB",
        userSelect: "none",
        width: "100%",
        height: "100%",
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
          backgroundColor: "#fff",
          cursor,
        }}
      >
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
                snapGridWidth={snapGridSize}
                snapGridHeight={snapGridSize}
                elementGuidelines={guidelineEls}
                /* ===== 실시간 겹침 하이라이트: 드래그 중 ===== */
                onDrag={(e: any) => {
                  if (isPanning) return;
                  const target = e.target as HTMLElement;
                  const cs = getComputedStyle(target);

                  const w = parseFloat(cs.width || "") || s.width;
                  const h = parseFloat(cs.height || "") || s.height;
                  const cand: Rect = { x: e.left, y: e.top, w, h };
                  setIsOOB(isOutOfBounds(cand));
                  calcLive(s.id, cand);
                }}
                /* ===== 실시간 겹침 하이라이트: 리사이즈 중 ===== */
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
                  setIsOOB(isOutOfBounds(cand));
                  calcLive(s.id, cand);
                }}
                /* ===== Drag End ===== */
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

                  let fixed = proposal;

                  if (isOutOfBounds(proposal)) {
                    fixed = prev;
                    setOverlaps([]);
                  } else {
                    fixed = resolveOnEnd(s.id, proposal, prev);
                  }

                  el.style.left = `${fixed.x}px`;
                  el.style.top = `${fixed.y}px`;

                  setUpdateFrame(s.id, { x: fixed.x, y: fixed.y });
                  setCommitAfterTransform();
                  setIsOOB(false);
                }}
                /* ===== Resize End ===== */
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

                  let fixed = proposal;

                  if (isOutOfBounds(proposal)) {
                    fixed = prev;
                    setOverlaps([]);
                  } else {
                    fixed = resolveOnEnd(s.id, proposal, prev);
                  }

                  el.style.left = `${fixed.x}px`;
                  el.style.top = `${fixed.y}px`;
                  el.style.width = `${fixed.w}px`;
                  el.style.height = `${fixed.h}px`;

                  setUpdateFrame(s.id, {
                    x: fixed.x,
                    y: fixed.y,
                    width: fixed.w,
                    height: fixed.h,
                  });
                  setCommitAfterTransform();
                  setIsOOB(false);
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

        {/* insertTool 드로잉 가이드 Rect */}
        {insertTool && dragRect.on && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: dragRect.x,
              top: dragRect.y,
              width: dragRect.w,
              height: dragRect.h,
              border: "1px dashed #2563eb",
              background: "rgba(37, 99, 235, 0.12)",
              pointerEvents: "none",
              borderRadius: 4,
            }}
          />
        )}

        {/* 마퀴 선택 */}
        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
