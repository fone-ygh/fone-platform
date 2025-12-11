// src/features/editor/components/canvas/CanvasStage.tsx
"use client";

/**
 * CanvasStage
 * ---------------------------------------------------------
 * - 줌/팬, 마퀴 선택, 인서트 드로잉, 드릴다운 스코프 등을 묶어서
 *   실제 "캔버스 전체"를 관리하는 레이어.
 *
 * - 좌표계 개념:
 *   1) 루트 스코프(scopeParentId === null)
 *      - sections[].x / y 는 캔버스(0,0) 기준 전역 좌표.
 *      - viewW / viewH = canvasWidth / canvasHeight
 *
 *   2) 드릴다운 스코프(scopeParentId === 어떤 섹션 id)
 *      - scopeContainer = 그 섹션 (전역 좌표)
 *      - displaySections 는 scopeContainer 좌측 상단을 (0,0)으로 한
 *        "로컬 좌표"로 변환된 섹션 리스트.
 *      - viewW / viewH = scopeContainer.width / height
 *
 *   - 마퀴/인서트/드래그/리사이즈는 모두 이 "현재 스코프 로컬 좌표" 기준으로 동작.
 *   - 저장(setUpdateFrame, setAddSection)할 때만 전역 좌표로 다시 환산.
 */
import React, { useMemo, useRef, useState } from "react";

import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";
import { useLayoutActions } from "@/shared/store/layout/store";
import type { Section } from "@/shared/store/layout/types";

import type { Rect } from "../../hooks/collision";
import { useDomHandles } from "../../hooks/useDomHandles";
import { useDragRect } from "../../hooks/useDragRect";
import { useKeyboardControl } from "../../hooks/useKeyboardControl";
import { useMarqueeSelection } from "../../hooks/useMarqueeSelection";
import { useSpaceDragPan } from "../../hooks/useSpaceDragPan";
import { useZoomWheel } from "../../hooks/useZoomWheel";
import InsertPreview from "../overlays/InsertPreview";
import MarqueeSelection from "./MarqueeSelection";
import SectionsLayer from "./SectionsLayer";

export default function CanvasStage() {
  useKeyboardControl();

  /* ===================== Layout 상태 ===================== */
  const {
    canvasWidth,
    canvasHeight,
    sections,
    selectedIds,
    insertTool,
    scopeParentId,
  } = useLayoutStore();

  const {
    setSelectedIds,
    setUpdateFrame,
    setCommitAfterTransform,
    setInsertTool,
    setAddSection,
    setScopeParentId,
  } = useLayoutActions() as any;

  /* ===================== Editor 상태(줌/팬/스냅) ===================== */
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

  // 25% ~ 200% 사이에서만 동작
  const zoom = Math.max(0.25, Math.min(2, canvasZoomPct / 100));

  /* ===================== Stage / Zoom Layer refs ===================== */
  const stageRef = useRef<HTMLDivElement | null>(null);

  // 실제로 scale/translate 되는 레이어 (Moveable 기준 컨테이너)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [isOOB, setIsOOB] = useState(false); // Out Of Bounds 표시

  const setZoomLayerRef = (node: HTMLDivElement | null) => setContainerEl(node);

  /* ===================== Grid 배경 ===================== */
  const gridBg = useMemo(
    () =>
      `linear-gradient(to right, ${gridColor} 1px, transparent 1px),
       linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    [gridColor],
  );

  /* ===================== 현재 스코프 컨테이너 ===================== */
  const scopeContainer = useMemo(() => {
    if (!scopeParentId) return null;
    return sections.find(s => s.id === scopeParentId) ?? null;
  }, [sections, scopeParentId]);

  // 스코프 기준 오프셋 (전역 → 로컬 변환용)
  const offsetX = scopeContainer ? scopeContainer.x : 0;
  const offsetY = scopeContainer ? scopeContainer.y : 0;

  /* ===================== 현재 view 크기 ===================== */
  const viewW = scopeContainer ? scopeContainer.width : canvasWidth;
  const viewH = scopeContainer ? scopeContainer.height : canvasHeight;

  /* ===================== 스코프 기준 섹션 목록 ===================== */
  // 1) 현재 스코프에 속한 섹션(전역 좌표)
  const scopedSections = useMemo(() => {
    if (!scopeParentId) return sections;
    return sections.filter(
      s => s.id === scopeParentId || (s.parentId ?? null) === scopeParentId,
    );
  }, [sections, scopeParentId]);

  // 2) 렌더링/선택에 사용하는 "로컬 좌표" 섹션 리스트
  const displaySections = useMemo(() => {
    if (!scopeContainer) return scopedSections; // 루트면 그대로 전역 좌표 사용
    return scopedSections.map(s => ({
      ...s,
      x: s.x - offsetX,
      y: s.y - offsetY,
    }));
  }, [scopedSections, scopeContainer, offsetX, offsetY]);

  /* ===================== 공통 훅들 결합 ===================== */

  // Ctrl + 휠 → 줌
  useZoomWheel({ stageRef, panX, panY, zoom, setCanvasZoom, setPan });

  // Space + Drag → 팬
  const {
    isPanning,
    cursor: panCursor,
    onMouseDownCapture: panMouseDownCapture,
    handlePanMouseMove,
    onMouseUp: panUp,
  } = useSpaceDragPan({ zoom, panX, panY, setPan, compensateZoom: true });

  // 배경 드래그 선택(마퀴) → 로컬 좌표 기준
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
    sections: displaySections,
    setSelectedIds,
  });

  // Insert 모드에서 드로잉할 사각형
  const {
    dragRect,
    // isDraggingRect, // 필요해지면 다시 꺼내 쓰기
    onDragRectDown,
    onDragRectMove,
    onDragRectUp,
    resetRect,
  } = useDragRect({ stageRef, panX, panY, zoom });

  // DOM 핸들: 선택/가이드라인 스냅용
  const { selectedEls, guidelineEls } = useDomHandles({
    sections: displaySections,
    selectedIds,
    snapToElements,
  });

  const snappable = snapToGrid || snapToElements || snapToGuides;
  const snapGridSize = snapToGrid ? gridSize : 0;

  // 마지막 선택된 섹션 id
  const activeId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : "";

  /* ===================== 경계 체크 함수 ===================== */
  // r은 항상 "현재 스코프의 로컬 좌표"
  const isOutOfBounds = (r: Rect) => {
    const limitW = scopeContainer ? scopeContainer.width : canvasWidth;
    const limitH = scopeContainer ? scopeContainer.height : canvasHeight;
    return r.x < 0 || r.y < 0 || r.x + r.w > limitW || r.y + r.h > limitH;
  };

  /* ===================== Stage 이벤트 핸들러 ===================== */

  // capture 단계에서 pan / insert 모드 우선 처리
  const handleStageMouseDownCapture = (e: React.MouseEvent) => {
    // InsertTool 모드면: 바로 Rect 드로잉 시작
    if (insertTool) {
      onDragRectDown(e);
      setSelectedIds([]);
      e.preventDefault();
      return;
    }

    // 평상시에는 pan 처리 먼저
    panMouseDownCapture(e);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning || insertTool) return;

    marqueeDown(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // 팬 중이면 여기서 끝
    if (handlePanMouseMove(e)) return;

    // Insert 모드인 경우: 드로잉 rect 업데이트
    if (insertTool) {
      onDragRectMove(e);
      if (dragRect.on) {
        setIsOOB(
          isOutOfBounds({
            x: dragRect.x,
            y: dragRect.y,
            w: dragRect.w,
            h: dragRect.h,
          } as Rect),
        );
      }
      return;
    }

    // 기본: 마퀴 이동
    marqueeMove(e);
  };

  const onMouseUp = () => {
    panUp();

    // ===== Insert 모드 종료 처리 =====
    if (insertTool && !dragRect.on) {
      // 클릭만 하고 드래그 안 했을 때: 인서트 취소
      setInsertTool(null);
      onDragRectUp();
      resetRect();
      return;
    }

    // 실제로 사각형을 그린 경우
    if (insertTool && dragRect.on && dragRect.w > 4 && dragRect.h > 4) {
      const drawRect: Rect = {
        x: dragRect.x,
        y: dragRect.y,
        w: dragRect.w,
        h: dragRect.h,
      };

      // 스코프 밖이면 생성 취소
      if (isOutOfBounds(drawRect)) {
        onDragRectUp();
        resetRect();
        setIsOOB(false);
        return;
      }

      const limitW = scopeContainer ? scopeContainer.width : canvasWidth;
      const limitH = scopeContainer ? scopeContainer.height : canvasHeight;

      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));

      // 로컬 좌표 기준에서 클램프
      const xLocal = Math.round(clamp(dragRect.x, 0, limitW));
      const yLocal = Math.round(clamp(dragRect.y, 0, limitH));
      const w = Math.round(clamp(dragRect.w, 0, limitW - Math.max(0, xLocal)));
      const h = Math.round(clamp(dragRect.h, 0, limitH - Math.max(0, yLocal)));

      // 실제 저장은 전역 좌표로 (스코프 오프셋 더해주기)
      const worldX = scopeContainer ? xLocal + offsetX : xLocal;
      const worldY = scopeContainer ? yLocal + offsetY : yLocal;

      let init: Partial<Section> = {
        parentId: scopeParentId ?? "root",
        x: worldX,
        y: worldY,
        width: w,
        height: h,
      };

      // 타입별 기본 타이틀
      if (insertTool === "search") {
        init = { ...init, title: "Search" };
      } else if (insertTool === "single") {
        init = { ...init, title: "Single" };
      } else if (insertTool === "grid") {
        init = { ...init, title: "Grid" };
      } else if (insertTool === "tab") {
        init = { ...init, title: "Tab" };
      }

      const newId = setAddSection(insertTool, init);
      setSelectedIds([newId]);
      setCommitAfterTransform();

      onDragRectUp();
      resetRect();
      setInsertTool(null);
      setIsOOB(false);
      return;
    }

    // Insert 모드가 아닌 경우 → 마퀴 선택 종료
    if (!insertTool) {
      marqueeUp();
    }
  };

  /* ===================== 렌더링 ===================== */
  return (
    <div
      ref={stageRef}
      className="stage"
      onMouseDownCapture={handleStageMouseDownCapture}
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
      {/* 줌/팬 레이어 (실제 좌표계 컨테이너) */}
      <div
        ref={setZoomLayerRef}
        className="zoom-layer"
        style={{
          position: "relative",
          width: viewW,
          height: viewH,
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
          backgroundImage: showGrid ? gridBg : "none",
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : "auto",
          backgroundColor: "#fff",
          cursor: insertTool ? "crosshair" : panCursor ? panCursor : "default",
        }}
      >
        {/* 섹션 렌더링/드래그/리사이즈 레이어 */}
        <SectionsLayer
          scopeContainer={scopeContainer}
          sections={displaySections}
          activeId={activeId}
          selectedIds={selectedIds}
          isPanning={isPanning}
          containerEl={containerEl}
          selectedEls={selectedEls}
          guidelineEls={guidelineEls}
          snappable={snappable}
          snapGridSize={snapGridSize}
          isOutOfBounds={isOutOfBounds}
          offsetX={offsetX}
          offsetY={offsetY}
          setIsOOB={setIsOOB}
          setSelectedIds={setSelectedIds}
          setUpdateFrame={setUpdateFrame}
          setCommitAfterTransform={setCommitAfterTransform}
          setScopeParentId={setScopeParentId}
          setCanvasZoom={setCanvasZoom}
          setPan={setPan}
        />

        {/* Insert 모드일 때 드로잉 가이드 Rect */}
        {insertTool && dragRect.on && (
          <InsertPreview tool={insertTool} rect={dragRect} />
        )}

        {/* 마퀴 선택 영역 */}
        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
