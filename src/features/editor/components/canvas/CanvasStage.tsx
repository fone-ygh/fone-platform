// src/features/editor/components/canvas/CanvasStage.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Box from "@/shared/components/ui/box/Box";
import { useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";

import ColumnsOverlay from "../overlays/ColumnsOverlay";
import GuidesLayer from "../overlays/GuidesLayer";
import MarqueeSelection from "./MarqueeSelection";
import SectionItemView from "./SectionItemView";

export default function CanvasStage() {
  // ---- layout ----
  const canvasWidth = useLayoutStore(s => s.canvasWidth);
  const canvasHeight = useLayoutStore(s => s.canvasHeight);
  const sections = useLayoutStore(s => s.sections);
  const selectedIds = useLayoutStore(s => s.selectedIds);

  const setSelectedIds = useLayoutStore(s => s.actions.setSelectedIds);
  const updateFrame = useLayoutStore(s => s.actions.updateFrame);
  const commitAfterTransform = useLayoutStore(
    s => s.actions.commitAfterTransform,
  );

  // 선택/복제/삭제 액션 (오른쪽 패널에서 쓰던 것 재활용)
  const deleteSelected = useLayoutStore(s => s.actions.deleteSelected);
  const duplicateSelected = useLayoutStore(s => s.actions.duplicateSelected);

  const guideLines = useLayoutStore(s => s.guideLines); // 필요 시 GuidesLayer 사용

  // ---- editor (그리드/줌/팬/스냅) ----
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
  const snapTolerance = useEDITORStore(s => s.snapTolerance); // 필요시 Box/Moveable에 전달

  const zoom = Math.max(0.25, Math.min(2, canvasZoomPct / 100));

  const stageRef = useRef<HTMLDivElement | null>(null);

  // ✅ 줌/팬 레이어 DOM을 state로 (렌더 중 ref.current 접근 금지 규칙 회피)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const setZoomLayerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  // ---- 상태: 마퀴, 팬, 스냅 임시 해제 ----
  const [marquee, setMarquee] = useState({ on: false, x: 0, y: 0, w: 0, h: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [altPressed, setAltPressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    sx: number;
    sy: number;
    px: number;
    py: number;
  } | null>(null);

  const gridBg = useMemo(
    () =>
      `linear-gradient(to right, ${gridColor} 1px, transparent 1px),
       linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    [gridColor],
  );

  // 화면좌표 → 논리좌표
  const toLogical = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current!;
      const rect = stage.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return { x: (sx - panX) / zoom, y: (sy - panY) / zoom };
    },
    [panX, panY, zoom],
  );

  // CTRL+휠 줌(스테이지 위에서만), 기본 페이지 줌 차단
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) return;

      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const cx = (sx - panX) / zoom;
      const cy = (sy - panY) / zoom;

      const prev = zoom;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const next = Math.max(0.25, Math.min(2, prev * factor));
      const nextPct = Math.round(next * 100);

      // 포커스 지점 고정: pan' = pan + (prev - next) * C
      const newPanX = panX + cx * (prev - next);
      const newPanY = panY + cy * (prev - next);

      setCanvasZoom(nextPct);
      setPan(newPanX, newPanY);
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    window.addEventListener("wheel", handleWheel, opts);
    return () => window.removeEventListener("wheel", handleWheel, opts);
  }, [panX, panY, zoom, setCanvasZoom, setPan]);

  // ---- 키보드 숏컷 & 모디파이어 키 ----
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      return (
        el.closest(
          "input, textarea, select, [contenteditable='true'], [role='textbox']",
        ) !== null
      );
    };
    const isCmdOrCtrl = (e: KeyboardEvent) => e.metaKey || e.ctrlKey;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;

      // 모디파이어 트래킹
      if (e.key === "Alt") setAltPressed(true);
      if (e.key === " ") {
        setSpacePressed(true);
        // 스페이스 기본 스크롤 방지
        e.preventDefault();
      }

      // 삭제
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length) {
          e.preventDefault();
          deleteSelected?.();
          setSelectedIds([]);
          commitAfterTransform?.();
        }
        return;
      }

      // 복제
      if ((e.key === "d" || e.key === "D") && isCmdOrCtrl(e)) {
        if (selectedIds.length) {
          e.preventDefault();
          duplicateSelected?.();
          commitAfterTransform?.();
        }
        return;
      }

      // 모두 선택
      if ((e.key === "a" || e.key === "A") && isCmdOrCtrl(e)) {
        e.preventDefault();
        setSelectedIds(sections.map(s => s.id));
        return;
      }

      // 선택 해제
      if (e.key === "Escape") {
        setSelectedIds([]);
        return;
      }

      // 미세 이동 (Shift: 10px)
      const step = e.shiftKey ? 10 : 1;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const dx =
          e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy =
          e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        if (selectedIds.length) {
          selectedIds.forEach(id => {
            const s = sections.find(x => x.id === id);
            if (!s) return;
            updateFrame(id, { x: s.x + dx, y: s.y + dy });
          });
          commitAfterTransform();
        }
        return;
      }

      // 키보드 줌 (뷰 중앙 기준)
      const zoomAroundCenter = (factor: number) => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        // 화면 중앙 기준 앵커
        const sx = rect.left + rect.width / 2;
        const sy = rect.top + rect.height / 2;
        const cx = (sx - rect.left - panX) / zoom;
        const cy = (sy - rect.top - panY) / zoom;

        const prev = zoom;
        const next = Math.max(0.25, Math.min(2, prev * factor));
        const nextPct = Math.round(next * 100);
        const newPanX = panX + cx * (prev - next);
        const newPanY = panY + cy * (prev - next);
        setCanvasZoom(nextPct);
        setPan(newPanX, newPanY);
      };

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomAroundCenter(1.1);
        return;
      }
      if (e.key === "-") {
        e.preventDefault();
        zoomAroundCenter(1 / 1.1);
        return;
      }
      if (e.key === "0" && isCmdOrCtrl(e)) {
        e.preventDefault();
        // 100%로 리셋 (중앙 앵커)
        const stage = stageRef.current;
        if (stage) {
          const rect = stage.getBoundingClientRect();
          const sx = rect.left + rect.width / 2;
          const sy = rect.top + rect.height / 2;
          const cx = (sx - rect.left - panX) / zoom;
          const cy = (sy - rect.top - panY) / zoom;
          const prev = zoom;
          const next = 1;
          const nextPct = 100;
          const newPanX = panX + cx * (prev - next);
          const newPanY = panY + cy * (prev - next);
          setCanvasZoom(nextPct);
          setPan(newPanX, newPanY);
        } else {
          setCanvasZoom(100);
        }
        return;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(false);
      if (e.key === " ") setSpacePressed(false);
    };

    const onBlur = () => {
      setAltPressed(false);
      setSpacePressed(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [
    selectedIds,
    sections,
    zoom,
    panX,
    panY,
    setSelectedIds,
    updateFrame,
    commitAfterTransform,
    setCanvasZoom,
    setPan,
    deleteSelected,
    duplicateSelected,
  ]);

  // ---- 마퀴 / 팬 동작 ----
  const onMouseDown = (e: React.MouseEvent) => {
    // Space 누른 상태면 팬 시작 (섹션 클릭 여부 무시)
    if (spacePressed) {
      setIsPanning(true);
      panStartRef.current = {
        sx: e.clientX,
        sy: e.clientY,
        px: panX,
        py: panY,
      };
      return;
    }

    // 섹션 내부 클릭이면 마퀴 시작 X (선택 이벤트는 SectionItemView에서 처리)
    if ((e.target as HTMLElement).closest(".section-item")) return;

    const { x, y } = toLogical(e.clientX, e.clientY);
    setSelectedIds([]);
    setMarquee({ on: true, x, y, w: 0, h: 0 });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // 팬 중이면 pan만 업데이트
    if (isPanning && panStartRef.current) {
      const { sx, sy, px, py } = panStartRef.current;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      setPan(px + dx, py + dy);
      return;
    }

    if (!marquee.on) return;
    const { x, y } = toLogical(e.clientX, e.clientY);
    const nx = Math.min(marquee.x, x);
    const ny = Math.min(marquee.y, y);
    const nw = Math.abs(x - marquee.x);
    const nh = Math.abs(y - marquee.y);
    setMarquee({ on: true, x: nx, y: ny, w: nw, h: nh });

    // AABB 교차 선택
    const hit = sections
      .filter(
        s =>
          !(
            nx + nw <= s.x ||
            s.x + s.width <= nx ||
            ny + nh <= s.y ||
            s.y + s.height <= ny
          ),
      )
      .map(s => s.id);
    setSelectedIds(hit);
  };

  const finishPointerOps = () => {
    setMarquee(m => ({ ...m, on: false }));
    setIsPanning(false);
    panStartRef.current = null;
  };

  const onMouseUp = () => finishPointerOps();
  const onMouseLeave = () => finishPointerOps();

  // ---- 그룹 타겟/가이드 DOM 수집 ----
  const [domEpoch, setDomEpoch] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDomEpoch(e => e + 1));
    return () => cancelAnimationFrame(id);
  }, [sections, selectedIds, zoom, panX, panY]);

  // getElementById는 HTMLElement | null을 반환 → HTMLElement로만 좁혀야 함
  const selectedEls: HTMLElement[] = useMemo(
    () =>
      selectedIds
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el),
    [selectedIds],
  );

  const guidelineEls: HTMLElement[] = useMemo(() => {
    if (!snapToElements) return [];
    return sections
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el && !selectedIds.includes(el.id));
  }, [sections, selectedIds, snapToElements]);

  // Alt(Option)로 스냅 임시 해제
  const snappableBase = snapToGrid || snapToElements || snapToGuides;
  const snappable = snappableBase && !altPressed;
  const snapGrid = snapToGrid ? gridSize : 0;

  const activeId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : "";

  return (
    <div
      ref={stageRef}
      className="stage"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{
        position: "relative",
        border: "1px solid rgba(0,0,0,.12)",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        userSelect: "none",
        // Space로 팬 모드 시 커서 힌트
        cursor: spacePressed ? (isPanning ? "grabbing" : "grab") : "default",
      }}
    >
      {/* 🔹 줌/팬이 적용되는 레이어 */}
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
                  if (act) setSelectedIds([s.id]); // 활성화 시 단일 선택
                }}
                width={s.width}
                height={s.height}
                x={s.x}
                y={s.y}
                rotate={s.rotate ?? 0}
                draggable
                resizable
                rotatable
                zoom={zoom}
                containerEl={containerEl}
                // ✅ HTMLElement[]은 (HTMLElement | SVGElement)[]에 할당 가능
                targets={selectedEls.length > 1 ? selectedEls : undefined}
                snappable={snappable}
                snapGridWidth={snapGrid}
                snapGridHeight={snapGrid}
                elementGuidelines={guidelineEls}
                // === Drag 커밋 ===
                onDragEnd={e => {
                  const nx =
                    e.lastEvent?.left ??
                    parseFloat((e.target as HTMLElement).style.left) ??
                    s.x;
                  const ny =
                    e.lastEvent?.top ??
                    parseFloat((e.target as HTMLElement).style.top) ??
                    s.y;
                  updateFrame(s.id, { x: nx, y: ny });
                  commitAfterTransform();
                }}
                // === Resize 커밋 ===
                onResizeEnd={e => {
                  const cs = getComputedStyle(e.target as HTMLElement);
                  const nx = parseFloat(cs.left) || s.x;
                  const ny = parseFloat(cs.top) || s.y;
                  const nw =
                    e.lastEvent?.width ?? parseFloat(cs.width) ?? s.width;
                  const nh =
                    e.lastEvent?.height ?? parseFloat(cs.height) ?? s.height;
                  updateFrame(s.id, { x: nx, y: ny, width: nw, height: nh });
                  commitAfterTransform();
                }}
                // === Rotate 커밋 ===
                onRotateEnd={e => {
                  const angle = e.lastEvent?.rotate ?? 0;
                  updateFrame(s.id, { rotate: angle });
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

        {/* <GuidesLayer lines={guideLines} /> */}
        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
