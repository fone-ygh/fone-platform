// src/features/editor/components/canvas/FrameRegionsLayer.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

import ResizeContainer from "@/shared/components/ui/resize/ResizeContainer";
import type {
  FrameNode,
  FrameRegion,
} from "@/shared/store/editor/frameLayout/types";

import type { Rect } from "../../hooks/collision";

type Props = {
  regions: FrameNode[];
  selectedIds: FrameRegion[];
  activeId: FrameRegion | null;

  isPanning: boolean;

  containerEl: HTMLDivElement | null;
  selectedEls: HTMLElement[];
  guidelineEls: HTMLElement[];

  snappable: boolean;
  snapGridSize: number;

  isOutOfBounds: (rect: Rect) => boolean;
  setIsOOB: (val: boolean) => void;

  setSelectedIds: (ids: FrameRegion[]) => void;
  setUpdateFrame: (
    id: FrameRegion,
    patch: Partial<Pick<FrameNode, "x" | "y" | "width" | "height" | "rotate">>,
  ) => void;
  setCommitAfterTransform: () => void;
};

export default function FrameRegionsLayer(props: Props) {
  const router = useRouter();

  const {
    regions,
    selectedIds,
    activeId,
    isPanning,
    containerEl,
    selectedEls,
    guidelineEls,
    snappable,
    snapGridSize,
    isOutOfBounds,
    setIsOOB,
    setSelectedIds,
    setUpdateFrame,
    setCommitAfterTransform,
  } = props;

  return (
    <>
      {regions.map(region => {
        const isSelected = selectedIds.includes(region.id);
        const isActive = activeId === region.id;
        const isLocked = !!region.lock;
        const r = region;

        return (
          <ResizeContainer
            key={r.id}
            id={r.id}
            active={isLocked ? false : isActive}
            onActiveChange={act => {
              if (act) setSelectedIds([r.id]);
            }}
            width={r.width}
            height={r.height}
            x={r.x}
            y={r.y}
            draggable={isActive && !isPanning && !isLocked}
            resizable={!isLocked}
            containerEl={containerEl as any}
            targets={selectedEls.length > 1 ? selectedEls : undefined}
            snappable={snappable}
            snapGridWidth={snapGridSize}
            snapGridHeight={snapGridSize}
            elementGuidelines={guidelineEls}
            onDrag={(e: any) => {
              if (isPanning || isLocked) return;

              const target = e.target as HTMLElement;
              const cs = getComputedStyle(target);

              const w = parseFloat(cs.width || "") || r.width;
              const h = parseFloat(cs.height || "") || r.height;

              const cand: Rect = { x: e.left, y: e.top, w, h };
              setIsOOB(isOutOfBounds(cand));
            }}
            onResize={(e: any) => {
              if (isPanning || isLocked) return;

              const target = e.target as HTMLElement;
              const l =
                e.drag?.left ?? parseFloat(target.style.left || "") ?? r.x;
              const t =
                e.drag?.top ?? parseFloat(target.style.top || "") ?? r.y;
              const w =
                e.width ?? parseFloat(target.style.width || "") ?? r.width;
              const h =
                e.height ?? parseFloat(target.style.height || "") ?? r.height;

              const cand: Rect = { x: l, y: t, w, h };
              setIsOOB(isOutOfBounds(cand));
            }}
            onDragEnd={(e: any) => {
              if (isPanning || isLocked) return;

              const el = e.target as HTMLElement;
              const cs = getComputedStyle(el);

              const nx = e.lastEvent?.left ?? parseFloat(cs.left || "") ?? r.x;
              const ny = e.lastEvent?.top ?? parseFloat(cs.top || "") ?? r.y;
              const w = parseFloat(cs.width || "") || r.width;
              const h = parseFloat(cs.height || "") || r.height;

              const proposal: Rect = { x: nx, y: ny, w, h };
              const prev: Rect = { x: r.x, y: r.y, w: r.width, h: r.height };

              const fixed = isOutOfBounds(proposal) ? prev : proposal;

              el.style.left = `${fixed.x}px`;
              el.style.top = `${fixed.y}px`;

              setUpdateFrame(r.id, { x: fixed.x, y: fixed.y });
              setCommitAfterTransform();
              setIsOOB(false);
            }}
            onResizeEnd={(e: any) => {
              if (isPanning || isLocked) return;

              const el = e.target as HTMLElement;
              const cs = getComputedStyle(el);

              const l = parseFloat(cs.left || "") || r.x;
              const t = parseFloat(cs.top || "") || r.y;
              const w =
                e.lastEvent?.width ?? parseFloat(cs.width || "") ?? r.width;
              const h =
                e.lastEvent?.height ?? parseFloat(cs.height || "") ?? r.height;

              const proposal: Rect = { x: l, y: t, w, h };
              const prev: Rect = { x: r.x, y: r.y, w: r.width, h: r.height };

              const fixed = isOutOfBounds(proposal) ? prev : proposal;

              el.style.left = `${fixed.x}px`;
              el.style.top = `${fixed.y}px`;
              el.style.width = `${fixed.w}px`;
              el.style.height = `${fixed.h}px`;

              setUpdateFrame(r.id, {
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
              style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                border: isSelected
                  ? "2px solid rgba(99,102,241,0.9)"
                  : "1px solid rgba(148,163,184,0.5)",
                background: r.bg ?? "rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                color: r.color ?? "#111827",
              }}
              onMouseDown={e => {
                e.stopPropagation();
                const multi = e.shiftKey || e.metaKey || e.ctrlKey;

                setSelectedIds(
                  multi
                    ? isSelected
                      ? (selectedIds.filter(id => id !== r.id) as FrameRegion[])
                      : ([...selectedIds, r.id] as FrameRegion[])
                    : ([r.id] as FrameRegion[]),
                );
              }}
              onDoubleClick={e => {
                e.stopPropagation();

                // ✅ 요청했던 UX: Frame 모드에서 content 더블클릭 → 패턴 갤러리
                if (r.id === "content") router.push("/pattern");
              }}
            >
              {r.title ?? r.type}
            </div>
          </ResizeContainer>
        );
      })}
    </>
  );
}
