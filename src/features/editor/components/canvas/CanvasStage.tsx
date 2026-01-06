// src/features/editor/components/canvas/CanvasStage.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";

import type { Section } from "@/shared/store/editor/contentLayout/types";
import { useLayoutVM } from "@/shared/store/editor/contentLayout/useLayoutVM";
import {
  useEDITORActions,
  useEDITORStore,
} from "@/shared/store/editor/control/store";

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

  const {
    canvasWidth,
    canvasHeight,
    selectedIds,
    insertTool,
    scopeParentId,

    scopeContainer,
    offsetX,
    offsetY,
    viewW,
    viewH,
    displaySections,
    activeId,

    actions,
  } = useLayoutVM();

  const {
    setSelectedIds,
    setUpdateFrame,
    setCommitAfterTransform,
    setInsertTool,
    setAddSection,
    setScopeParentId,
  } = actions;

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

  const zoom = Math.max(0.25, Math.min(2, canvasZoomPct / 100));

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [isOOB, setIsOOB] = useState(false);

  const setZoomLayerRef = (node: HTMLDivElement | null) => setContainerEl(node);

  const gridBg = useMemo(
    () =>
      `linear-gradient(to right, ${gridColor} 1px, transparent 1px),
       linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    [gridColor],
  );

  useZoomWheel({ stageRef, panX, panY, zoom, setCanvasZoom, setPan });

  const {
    isPanning,
    cursor: panCursor,
    onMouseDownCapture: panMouseDownCapture,
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
    sections: displaySections,
    setSelectedIds,
  });

  const { dragRect, onDragRectDown, onDragRectMove, onDragRectUp, resetRect } =
    useDragRect({ stageRef, panX, panY, zoom });

  const { selectedEls, guidelineEls } = useDomHandles({
    sections: displaySections,
    selectedIds,
    snapToElements,
  });

  const snappable = snapToGrid || snapToElements || snapToGuides;
  const snapGridSize = snapToGrid ? gridSize : 0;

  const isOutOfBounds = (r: Rect) => {
    const limitW = scopeContainer ? scopeContainer.width : canvasWidth;
    const limitH = scopeContainer ? scopeContainer.height : canvasHeight;
    return r.x < 0 || r.y < 0 || r.x + r.w > limitW || r.y + r.h > limitH;
  };

  const handleStageMouseDownCapture = (e: React.MouseEvent) => {
    if (insertTool) {
      onDragRectDown(e);
      setSelectedIds([]);
      e.preventDefault();
      return;
    }
    panMouseDownCapture(e);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning || insertTool) return;
    marqueeDown(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (handlePanMouseMove(e)) return;

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

    marqueeMove(e);
  };

  const onMouseUp = () => {
    panUp();

    if (insertTool && !dragRect.on) {
      setInsertTool(null);
      onDragRectUp();
      resetRect();
      return;
    }

    if (insertTool && dragRect.on && dragRect.w > 4 && dragRect.h > 4) {
      const drawRect: Rect = {
        x: dragRect.x,
        y: dragRect.y,
        w: dragRect.w,
        h: dragRect.h,
      };

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

      const xLocal = Math.round(clamp(dragRect.x, 0, limitW));
      const yLocal = Math.round(clamp(dragRect.y, 0, limitH));
      const w = Math.round(clamp(dragRect.w, 0, limitW - Math.max(0, xLocal)));
      const h = Math.round(clamp(dragRect.h, 0, limitH - Math.max(0, yLocal)));

      const worldX = scopeContainer ? xLocal + offsetX : xLocal;
      const worldY = scopeContainer ? yLocal + offsetY : yLocal;

      let init: Partial<Section> = {
        parentId: scopeParentId ?? "root",
        x: worldX,
        y: worldY,
        width: w,
        height: h,
      };

      if (insertTool === "search") init = { ...init, title: "Search" };
      if (insertTool === "single") init = { ...init, title: "Single" };
      if (insertTool === "grid") init = { ...init, title: "Grid" };
      if (insertTool === "tab") init = { ...init, title: "Tab" };

      const newId = setAddSection(insertTool, init);
      setSelectedIds([newId]);
      setCommitAfterTransform();

      onDragRectUp();
      resetRect();
      setInsertTool(null);
      setIsOOB(false);
      return;
    }

    if (!insertTool) marqueeUp();
  };

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

        {insertTool && dragRect.on && (
          <InsertPreview tool={insertTool} rect={dragRect} />
        )}

        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
