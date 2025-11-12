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
// import GuidesLayer from "../overlays/GuidesLayer";
import MarqueeSelection from "./MarqueeSelection";
import SectionItemView from "./SectionItemView";

/* =================== Overlap/Collision helpers =================== */
type Rect = { x: number; y: number; w: number; h: number; id?: string };

function intersects(a: Rect, b: Rect) {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

function intersectionRect(a: Rect, b: Rect): Rect | null {
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(a.x + a.w, b.x + b.w);
  const iy2 = Math.min(a.y + a.h, b.y + b.h);
  if (ix2 > ix1 && iy2 > iy1) {
    return { x: ix1, y: iy1, w: ix2 - ix1, h: iy2 - iy1 };
  }
  return null;
}

// a와 b가 겹칠 때 a를 b 바깥으로 내보내는 최소 이동량(MTV)
function pushOutOnce(
  a: Rect,
  b: Rect,
  prevX: number,
  prevY: number,
): { x: number; y: number } {
  const ax1 = a.x,
    ay1 = a.y,
    ax2 = a.x + a.w,
    ay2 = a.y + a.h;
  const bx1 = b.x,
    by1 = b.y,
    bx2 = b.x + b.w,
    by2 = b.y + b.h;

  const overlapX = Math.min(ax2 - bx1, bx2 - ax1);
  const overlapY = Math.min(ay2 - by1, by2 - ay1);

  // 이전 중심과 b 중심 비교로 진입 방향 추정
  const prevCx = prevX + a.w / 2;
  const prevCy = prevY + a.h / 2;
  const bCx = b.x + b.w / 2;
  const bCy = b.y + b.h / 2;

  if (overlapX < overlapY) {
    const fromLeft = prevCx < bCx;
    const dx = fromLeft ? -(ax2 - bx1) : bx2 - ax1;
    return { x: a.x + dx, y: a.y };
  } else {
    const fromTop = prevCy < bCy;
    const dy = fromTop ? -(ay2 - by1) : by2 - ay1;
    return { x: a.x, y: a.y + dy };
  }
}

// 여러 충돌체에 대해 반복적으로 겹침 제거
function resolveNoOverlap(
  a: Rect,
  colliders: Rect[],
  prevX: number,
  prevY: number,
  maxIter = 16,
): Rect {
  let out = { ...a };
  for (let i = 0; i < maxIter; i++) {
    const hit = colliders.find(b => intersects(out, b));
    if (!hit) break;
    const next = pushOutOnce(out, hit, prevX, prevY);
    if (next.x === out.x && next.y === out.y) break;
    out = { ...out, ...next };
  }
  return out;
}
/* ================================================================ */

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
  // const guideLines = useLayoutStore(s => s.guideLines);

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
  // const snapTolerance = useEDITORStore(s => s.snapTolerance);

  const zoom = Math.max(0.25, Math.min(2, canvasZoomPct / 100));

  const stageRef = useRef<HTMLDivElement | null>(null);

  // 줌/팬 레이어 DOM (렌더 중 ref.current 직접접근 X → state에 넣어 전달)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const setZoomLayerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  // 마퀴(논리좌표)
  const [marquee, setMarquee] = useState({ on: false, x: 0, y: 0, w: 0, h: 0 });

  // 🔴 겹침 하이라이트(교집합 사각형들)
  const [overlaps, setOverlaps] = useState<Rect[]>([]);

  // ✅ 배경 클릭/드래그 구분용 상태
  const [bgDown, setBgDown] = useState(false);
  const [downPt, setDownPt] = useState<{ x: number; y: number } | null>(null);
  const DRAG_THRESHOLD = 3; // px

  // 🔹 Space+Drag 팬 상태
  const [isSpace, setIsSpace] = useState(false);
  const isSpaceRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);

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

  // 입력 필드 포커스 중인지 여부(스페이스 팬 제외)
  const isTypingTarget = () => {
    if (typeof document === "undefined") return false;
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return (
      el.isContentEditable ||
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    );
  };

  // Space 키로 팬 모드 토글(입력 중 제외)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isTypingTarget()) return;
      if (!isSpaceRef.current) {
        isSpaceRef.current = true;
        setIsSpace(true);
      }
      // 페이지 스크롤 방지
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      isSpaceRef.current = false;
      setIsSpace(false);
      setIsPanning(false);
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);

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

      // 포커스 지점 고정
      const newPanX = panX + cx * (prev - next);
      const newPanY = panY + cy * (prev - next);

      setCanvasZoom(nextPct);
      setPan(newPanX, newPanY);
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    window.addEventListener("wheel", handleWheel, opts);
    return () => window.removeEventListener("wheel", handleWheel, opts);
  }, [panX, panY, zoom, setCanvasZoom, setPan]);

  /* =================== Space+Drag 팬: 캡처 단계에서 시작 =================== */
  const onMouseDownCapture = (e: React.MouseEvent) => {
    if (!isSpaceRef.current) return;
    if (e.button !== 0) return; // 좌클릭만
    // 팬 시작: 자식(Box/Moveable) 이벤트 차단
    e.preventDefault();
    e.stopPropagation();

    setIsPanning(true);
    setOverlaps([]); // 하이라이트 제거
    setBgDown(false);
    setMarquee({ on: false, x: 0, y: 0, w: 0, h: 0 });

    mouseStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panX, y: panY };
  };
  /* ======================================================================== */

  /* =================== 배경 클릭/마퀴 선택 =================== */
  const onMouseDown = (e: React.MouseEvent) => {
    if (isPanning || isSpaceRef.current) return; // 팬 중/팬 모드면 무시

    // 아이템 위면 무시 (아이템은 SectionItemView에서 stopPropagation)
    if ((e.target as HTMLElement).closest(".section-item")) return;

    // 배경에서만 pending 시작
    const p = toLogical(e.clientX, e.clientY);
    setBgDown(true);
    setDownPt(p);

    // 깜빡이는 마퀴 방지: 여기선 마퀴 시작하지 않음
    setMarquee({ on: false, x: 0, y: 0, w: 0, h: 0 });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // 팬 모드: 마우스 이동량에 따라 pan 갱신(zoom 보정 X)
    if (isPanning && mouseStartRef.current && panStartRef.current) {
      //  줌으로 나누지 말고, 화면 px 이동량 그대로 더해준다.
      const dx = e.clientX - mouseStartRef.current.x;
      const dy = e.clientY - mouseStartRef.current.y;
      setPan(panStartRef.current.x + dx, panStartRef.current.y + dy);
      return; // 팬 중에는 선택/마퀴 무시
    }
    if (!bgDown || !downPt) return;

    const p = toLogical(e.clientX, e.clientY);
    const dx = Math.abs(p.x - downPt.x);
    const dy = Math.abs(p.y - downPt.y);

    // 임계치 넘으면 그때 마퀴 시작
    if (!marquee.on) {
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        const nx = Math.min(downPt.x, p.x);
        const ny = Math.min(downPt.y, p.y);
        const nw = Math.abs(p.x - downPt.x);
        const nh = Math.abs(p.y - downPt.y);
        setMarquee({ on: true, x: nx, y: ny, w: nw, h: nh });
        // 마퀴 시작 시 선택 초기화
        setSelectedIds([]);
      }
      return;
    }

    // 마퀴 업데이트
    const nx = Math.min(downPt.x, p.x);
    const ny = Math.min(downPt.y, p.y);
    const nw = Math.abs(p.x - downPt.x);
    const nh = Math.abs(p.y - downPt.y);
    setMarquee({ on: true, x: nx, y: ny, w: nw, h: nh });

    // 교차 선택
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

  const onMouseUp = () => {
    // 팬 종료
    if (isPanning) {
      setIsPanning(false);
      mouseStartRef.current = null;
      panStartRef.current = null;
      return;
    }

    // 배경에서 클릭만 한 경우(마퀴 미시작) → 선택 해제
    if (bgDown && !marquee.on) {
      setSelectedIds([]);
    }
    // 상태 초기화
    setBgDown(false);
    setDownPt(null);
    setMarquee(m => ({ ...m, on: false }));
  };
  /* ========================================================= */

  // 선택된 DOM(그룹 핸들)
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

  const snappable = snapToGrid || snapToElements || snapToGuides;
  const snapGrid = snapToGrid ? gridSize : 0;
  const activeId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : "";

  // 다른 아이템들 Rect
  const rectsExcept = useCallback(
    (selfId: string): Rect[] =>
      sections
        .filter(s => s.id !== selfId)
        .map(s => ({ id: s.id, x: s.x, y: s.y, w: s.width, h: s.height })),
    [sections],
  );

  // 실시간 겹침 하이라이트 계산 (막지는 않음)
  const calcOverlapsLive = useCallback(
    (selfId: string, cand: Rect) => {
      const others = rectsExcept(selfId);
      const merged: Rect[] = [];
      for (const ob of others) {
        const r = intersectionRect(cand, ob);
        if (r) merged.push(r);
      }
      setOverlaps(merged);
    },
    [rectsExcept],
  );

  // 종료 시 겹침 해소(밀어내기)
  const resolveAtEnd = useCallback(
    (selfId: string, proposal: Rect, prev: Rect) => {
      const others = rectsExcept(selfId);
      const fixed = resolveNoOverlap(proposal, others, prev.x, prev.y);
      setOverlaps([]); // 종료 후 하이라이트 제거
      return fixed;
    },
    [rectsExcept],
  );

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
          cursor: isPanning ? "grabbing" : isSpace ? "grab" : "default",
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
                // rotatable
                containerEl={containerEl as any}
                targets={selectedEls.length > 1 ? selectedEls : undefined}
                snappable={snappable}
                snapGridWidth={snapGrid}
                snapGridHeight={snapGrid}
                elementGuidelines={guidelineEls}
                // ===== 실시간 하이라이트: drag 중
                onDrag={(e: any) => {
                  if (isPanning) return; // 팬 중엔 무시
                  const target = e.target as HTMLElement;
                  const cs = getComputedStyle(target);
                  const w = parseFloat(cs.width || "") || s.width;
                  const h = parseFloat(cs.height || "") || s.height;
                  const cand: Rect = { x: e.left, y: e.top, w, h };
                  calcOverlapsLive(s.id, cand);
                }}
                // ===== 실시간 하이라이트: resize 중
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
                  calcOverlapsLive(s.id, cand);
                }}
                // ===== Drag End: 여기서만 겹침 해소 + 커밋
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
                  const fixed = resolveAtEnd(s.id, proposal, prev);

                  // DOM 보정
                  el.style.left = `${fixed.x}px`;
                  el.style.top = `${fixed.y}px`;

                  updateFrame(s.id, { x: fixed.x, y: fixed.y });
                  commitAfterTransform();
                }}
                // ===== Resize End: 여기서만 겹침 해소 + 커밋
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
                  const fixed = resolveAtEnd(s.id, proposal, prev);

                  // DOM 보정
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

        {/* 겹침 하이라이트 레이어 */}
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
                  background: "rgba(220, 38, 38, 0.18)", // 빨강 반투명
                  border: "1px solid rgba(220, 38, 38, 0.65)",
                  pointerEvents: "none",
                  mixBlendMode: "multiply",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        )}

        {/* <GuidesLayer lines={guideLines} /> */}
        {marquee.on && <MarqueeSelection rect={marquee} />}
      </div>
    </div>
  );
}
