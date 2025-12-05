// src/features/editor/components/canvas/CanvasStage.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import ResizeContainer from "@/shared/components/ui/resize/ResizeContainer";
import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";
import { useLayoutActions } from "@/shared/store/layout/store";
import type { Section } from "@/shared/store/layout/types";

import type { Rect } from "../../hooks/collision";
import { useDomHandles } from "../../hooks/useDomHandles";
import { useDragRect } from "../../hooks/useDragRect";
import { useKeyboardControl } from "../../hooks/useKeyboardControl";
import { useMarqueeSelection } from "../../hooks/useMarqueeSelection";
// 🔥 충돌 해결 훅 잠시 막기
// import { useOverlapResolver } from "../../hooks/useOverlapResolver";
import { useSpaceDragPan } from "../../hooks/useSpaceDragPan";
import { useZoomWheel } from "../../hooks/useZoomWheel";
import InsertPreview from "../overlays/InsertPreview";
import MarqueeSelection from "./MarqueeSelection";
import SectionItemView from "./SectionItemView";

// Moveable를 내부적으로 쓰는 Box는 클라이언트 전용 로딩 권장
const Box = dynamic(() => import("@/shared/components/ui/box/Box"), {
  ssr: false,
});

export default function CanvasStage() {
  useKeyboardControl();

  /* ========== Layout 상태 ========== */
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

  /* ========== 현재 스코프 컨테이너(드릴인한 섹션) 찾기 ========== */
  const scopeContainer = useMemo(() => {
    if (!scopeParentId) return null;
    return sections.find(s => s.id === scopeParentId) ?? null;
  }, [sections, scopeParentId]);

  /* ==========  현재 캔버스 크기(루트면 전체 캔버스 / 드릴이면 컨테이너 크기) ========== */
  const viewW = scopeContainer ? scopeContainer.width : canvasWidth;
  const viewH = scopeContainer ? scopeContainer.height : canvasHeight;

  // 현재 스코프 기준으로 보여줄 섹션 리스트
  const scopedSections = React.useMemo(() => {
    // 스코프 없으면 전체 (기본 동작 유지)
    if (!scopeParentId) return sections;

    // 스코프가 있으면:
    // 1) 그 섹션(프레임) 자체
    // 2) 그 섹션의 직계 자식들(parentId === scopeParentId)
    return sections.filter(
      s => s.id === scopeParentId || (s.parentId ?? null) === scopeParentId,
    );
  }, [sections, scopeParentId]);

  /* ========== 훅 결합 ========== */
  // Ctrl+휠 줌(커서 기준 줌, 페이지 스크롤 방지)
  useZoomWheel({ stageRef, panX, panY, zoom, setCanvasZoom, setPan });

  // Space+Drag 팬(줌과 무관하게 화면 px 기준으로 이동)
  const {
    isPanning,
    cursor: panCursor,
    onMouseDownCapture: panMouseDownCapture,
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
    sections: scopedSections,
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

  // 🔥 섹션 간 충돌/겹침 관련 로직 잠시 비활성화
  // const { overlaps, calcLive, resolveOnEnd, setOverlaps } =
  //   useOverlapResolver(scopedSections);

  // DOM 핸들 수집(그룹/가이드라인)
  const { selectedEls, guidelineEls } = useDomHandles({
    sections: scopedSections,
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

  // Stage용 capture 핸들
  const handleStageMouseDownCapture = (e: React.MouseEvent) => {
    // 1) 인서트 모드면: 여기서 바로 Rect 드로잉 시작
    if (insertTool) {
      onDragRectDown(e);
      setSelectedIds([]);
      e.preventDefault();
      return; // pan capture는 타지 않게 여기서 끝
    }

    // 2) 평상시에는 기존 pan capture 호출
    panMouseDownCapture(e);
  };
  /* ========== 유틸: 겹침 검사(사전 검사용) ========== */
  // 🔥 섹션끼리 겹침 검사는 일단 막아둠
  // const rectsIntersect = (a: Rect, b: Rect) =>
  //   !(
  //     a.x + a.w <= b.x ||
  //     b.x + b.w <= a.x ||
  //     a.y + a.h <= b.y ||
  //     b.y + b.h <= a.y
  //   );

  // const candOverlapsAny = (cand: Rect) =>
  //   scopedSections.some(s =>
  //     rectsIntersect(cand, { x: s.x, y: s.y, w: s.width, h: s.height }),
  //   );

  // 컨테이너(zoom-layer) 경계 밖 여부 판단(이건 그대로 유지)
  const isOutOfBounds = (r: Rect) => {
    return (
      r.x < 0 || r.y < 0 || r.x + r.w > canvasWidth || r.y + r.h > canvasHeight
    );
  };

  /* ========== Stage 이벤트 ========== */
  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning || insertTool) return; // 팬 중이면 마퀴/드로잉 막기

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
      // 인서트 가이드 사각형으로도 라이브 겹침 하이라이트 (현재 비활성화)
      if (dragRect.on) {
        // calcLive("__insert_preview__", {
        //   x: dragRect.x,
        //   y: dragRect.y,
        //   w: dragRect.w,
        //   h: dragRect.h,
        // } as Rect);

        // 드로잉 중 바깥 영역 여부 실시간 표시 (배경 빨간색 처리)
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

    // ---- InsertTool 모드에서 드로잉 끝났을 때 처리 ----
    if (insertTool && !dragRect.on) {
      setInsertTool(null);
      onDragRectUp();
      resetRect();
      return;
    }

    if (insertTool && dragRect.on && dragRect.w > 4 && dragRect.h > 4) {
      // 먼저 원본 dragRect가 경계를 벗어났는지 검사 (경계 밖이면 생성 불가)
      const originalCand: Rect = {
        x: dragRect.x,
        y: dragRect.y,
        w: dragRect.w,
        h: dragRect.h,
      };
      if (isOutOfBounds(originalCand)) {
        // OOB이면 생성 취소 + 상태 정리 (InsertTool 유지)
        onDragRectUp();
        resetRect();
        // setOverlaps([]);
        setIsOOB(false);
        return;
      }

      // 값이 canvas 영역을 벗어나지 않도록 한 번 감싸는 유틸
      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));

      const x = Math.round(clamp(dragRect.x, 0, canvasWidth));
      const y = Math.round(clamp(dragRect.y, 0, canvasHeight));
      const w = Math.round(clamp(dragRect.w, 0, canvasWidth - Math.max(0, x)));
      const h = Math.round(clamp(dragRect.h, 0, canvasHeight - Math.max(0, y)));

      const cand: Rect = { x, y, w, h };

      // 🔥 1) 섹션 간 겹침 검사 로직은 일단 비활성화
      // const hasOverlap = candOverlapsAny(cand);
      // if (hasOverlap) {
      //   onDragRectUp();
      //   resetRect();
      //   setOverlaps([]);
      //   setIsOOB(false);
      //   return;
      // }

      // 2) 바로 섹션 생성
      let init: Partial<Section> = {
        parentId: scopeParentId ?? "root",
        x,
        y,
        width: w,
        height: h,
      };

      if (insertTool === "search") {
        init = {
          ...init,
          title: "search",
        };
      } else if (insertTool === "single") {
        init = {
          ...init,
          title: "Single",
        };
      } else if (insertTool === "grid") {
        init = {
          ...init,
          title: "Grid",
        };
      } else if (insertTool === "tab") {
        init = {
          ...init,
          title: "Tab",
          // tabs: [
          //   { label: "Tab 1", content: "첫 번째" },
          //   { label: "Tab 2", content: "두 번째" },
          // ],
        };
      }

      const newId = setAddSection(insertTool, init);
      setSelectedIds([newId]);
      setCommitAfterTransform();

      // 가이드 정리 + 하이라이트 제거
      onDragRectUp();
      resetRect();
      // setOverlaps([]);

      // 성공 시에는 기존 UX 유지: 한 번 그리면 Select로 복귀
      setInsertTool(null);
      setIsOOB(false); // 성공 후 배경 복구
      return;
    }

    // InsertTool이 아니면 원래대로 마퀴 업
    if (!insertTool) {
      marqueeUp();
    }
  };

  /* ========== 렌더링 ========== */
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
      {/* 줌/팬 레이어 */}
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
        {scopedSections
          .slice()
          .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
          .map(s => {
            const isSelected = selectedIds.includes(s.id);
            const isActive = activeId === s.id;
            const isLocked = !!s.lock;

            return (
              <ResizeContainer
                key={s.id}
                id={s.id}
                active={isLocked ? false : isActive}
                onActiveChange={act => {
                  if (act) {
                    setSelectedIds([s.id]);
                    // InsertTool 활성 상태에서 기존 컴포넌트를 선택하면 툴 해제
                    // if (insertTool) setInsertTool(null);
                  }
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
                  if (isPanning || isLocked) return;
                  const target = e.target as HTMLElement;
                  const cs = getComputedStyle(target);

                  const w = parseFloat(cs.width || "") || s.width;
                  const h = parseFloat(cs.height || "") || s.height;
                  const cand: Rect = { x: e.left, y: e.top, w, h };
                  setIsOOB(isOutOfBounds(cand));
                  // calcLive(s.id, cand);
                }}
                /* ===== 실시간 겹침 하이라이트: 리사이즈 중 ===== */
                onResize={(e: any) => {
                  if (isPanning || isLocked) return;
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
                  // calcLive(s.id, cand);
                }}
                /* ===== Drag End ===== */
                onDragEnd={(e: any) => {
                  if (isPanning || isLocked) return;
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
                    // setOverlaps([]);
                  } else {
                    // fixed = resolveOnEnd(s.id, proposal, prev);
                    fixed = proposal;
                  }

                  el.style.left = `${fixed.x}px`;
                  el.style.top = `${fixed.y}px`;

                  setUpdateFrame(s.id, { x: fixed.x, y: fixed.y });
                  setCommitAfterTransform();
                  setIsOOB(false);
                }}
                /* ===== Resize End ===== */
                onResizeEnd={(e: any) => {
                  if (isPanning || isLocked) return;
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
                    // setOverlaps([]);
                  } else {
                    // fixed = resolveOnEnd(s.id, proposal, prev);
                    fixed = proposal;
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
                <div
                  style={{ width: "100%", height: "100%" }}
                  onDoubleClick={e => {
                    e.stopPropagation(); // 상위 zoom-layer 더블클릭으로 안 올라가게

                    // 이 섹션을 "현재 작업 중인 부모"로 채택
                    setScopeParentId(s.id);

                    // 선택은 이 섹션으로 맞추기
                    setSelectedIds([s.id]);

                    // 드릴인할 때 줌/팬 초기화(선택 사항)
                    setCanvasZoom(100);
                    setPan(0, 0);
                  }}
                >
                  <SectionItemView
                    item={s}
                    selected={isSelected}
                    onRequestSelect={multi => {
                      setSelectedIds(
                        multi
                          ? isSelected
                            ? selectedIds.filter(id => id !== s.id)
                            : [...selectedIds, s.id]
                          : [s.id],
                      );
                    }}
                  />
                </div>
              </ResizeContainer>
            );
          })}

        {/* 🔥 겹침 하이라이트 렌더링도 잠시 비활성화 */}
        {/*
        {overlaps.length > 0 && (
          <div aria-hidden>
            {overlaps.map((r, i) => (
              <div
                key={`ov-${i}-${r.x}-${r.y}-${r.w}-${r.h}`}
                style={{
                  zIndex: 999,
                  position: "absolute",
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  height: r.h,
                  background: "rgb(248, 177, 177)",
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
        )}
        */}

        {/* insertTool 드로잉 가이드 Rect */}
        {insertTool && dragRect.on && (
          <InsertPreview tool={insertTool} rect={dragRect} />
        )}

        {/* 마퀴 선택 */}
        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
