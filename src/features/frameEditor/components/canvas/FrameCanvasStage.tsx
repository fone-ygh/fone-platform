// src/features/editor/components/canvas/FrameCanvasStage.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";

import {
  useEDITORActions,
  useEDITORStore,
} from "@/shared/store/editor/control/store";
import { useFrameLayoutVM } from "@/shared/store/editor/frameLayout/useFrameLayoutVM";

import type { Rect } from "../../hooks/collision";
import { useDomHandles } from "../../hooks/useDomHandles";
import { useMarqueeSelection } from "../../hooks/useMarqueeSelection";
import { useSpaceDragPan } from "../../hooks/useSpaceDragPan";
import { useZoomWheel } from "../../hooks/useZoomWheel";
import FrameRegionsLayer from "./FrameRegionsLayer";
import MarqueeSelection from "./MarqueeSelection";

export default function FrameCanvasStage() {
  const { frameWidth, frameHeight, regions, selectedIds, activeId, actions } =
    useFrameLayoutVM();

  const { setSelectedIds, setUpdateFrame, setCommitAfterTransform } = actions;

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

  // useMarqueeSelection이 string[] 기반이라 wrapper로 연결
  const setSelectedIdsFromMarquee = (ids: string[]) =>
    setSelectedIds(ids as any);

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
    sections: regions as any,
    setSelectedIds: setSelectedIdsFromMarquee,
  });

  const { selectedEls, guidelineEls } = useDomHandles({
    sections: regions as any,
    selectedIds: selectedIds as any,
    snapToElements,
  });

  const snappable = snapToGrid || snapToElements || snapToGuides;
  const snapGridSize = snapToGrid ? gridSize : 0;

  const isOutOfBounds = (r: Rect) => {
    const limitW = frameWidth;
    const limitH = frameHeight;
    return r.x < 0 || r.y < 0 || r.x + r.w > limitW || r.y + r.h > limitH;
  };

  const handleStageMouseDownCapture = (e: React.MouseEvent) => {
    panMouseDownCapture(e);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning) return;
    marqueeDown(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (handlePanMouseMove(e)) return;
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
          width: frameWidth,
          height: frameHeight,
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
          backgroundImage: showGrid ? gridBg : "none",
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : "auto",
          backgroundColor: "#fff",
          cursor: panCursor ? panCursor : "default",
        }}
      >
        <FrameRegionsLayer
          regions={regions as any}
          activeId={activeId as any}
          selectedIds={selectedIds as any}
          isPanning={isPanning}
          containerEl={containerEl}
          selectedEls={selectedEls}
          guidelineEls={guidelineEls}
          snappable={snappable}
          snapGridSize={snapGridSize}
          isOutOfBounds={isOutOfBounds}
          setIsOOB={setIsOOB}
          setSelectedIds={setSelectedIds}
          setUpdateFrame={setUpdateFrame as any}
          setCommitAfterTransform={setCommitAfterTransform}
        />

        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
