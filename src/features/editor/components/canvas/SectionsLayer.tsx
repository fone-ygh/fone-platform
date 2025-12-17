// src/features/editor/components/canvas/SectionsLayer.tsx
"use client";

import React from "react";

import ResizeContainer from "@/shared/components/ui/resize/ResizeContainer";
import { useEDITORStore } from "@/shared/store/control";
import type { AnySection, Section } from "@/shared/store/layout/types";

import type { Rect } from "../../hooks/collision";
import SectionItemView from "./SectionItemView";

/**
 * SectionsLayer
 * ------------------------------------------------------------------
 * - 현재 "스코프" 기준으로 섹션들을 렌더링하는 레이어.
 * - CanvasStage 쪽에서 이미 좌표계를 맞춰서 넘겨줌:
 *
 *   - 루트 화면일 때: sections의 x, y 는 전역 좌표(캔버스 기준 0,0)
 *   - 드릴다운(sco peParentId 존재)일 때:
 *       displaySections 로 x, y 가 부모 섹션의 좌측 상단을 (0,0)으로
 *       보정된 "로컬 좌표"가 넘어옴.
 *
 * - 드래그 / 리사이즈 중에는 이 로컬 좌표 기준으로 움직이고,
 *   최종 저장(setUpdateFrame) 할 때만 다시 전역 좌표로 환산해서 저장.
 */

type SectionsLayerProps = {
  /** 드릴다운 중이면 부모 섹션, 아니면 null */
  scopeContainer: Section | null;

  /** 현재 스코프 기준으로 보이는 섹션들 (좌표는 이미 로컬 기준) */
  sections: AnySection[];

  /** 선택 정보 */
  selectedIds: string[];
  activeId: string;

  /** 현재 캔버스가 panning 중인지 여부 */
  isPanning: boolean;

  /** moveable가 사용할 실제 DOM 컨테이너 */
  containerEl: HTMLDivElement | null;

  /** group transform / snap용 DOM 핸들들 */
  selectedEls: HTMLElement[];
  guidelineEls: HTMLElement[];

  /** 스냅 관련 옵션 */
  snappable: boolean;
  snapGridSize: number;

  /**
   * 전역 좌표계로 되돌리기 위한 오프셋
   * - scopeContainer가 있을 때만 의미 있음
   * - worldX = localX + offsetX 형태로 사용
   */
  offsetX: number;
  offsetY: number;

  /** 현재 rect가 스코프 경계를 벗어났는지 검사하는 함수 (로컬 좌표 기준) */
  isOutOfBounds: (rect: Rect) => boolean;

  /** 바깥 영역 여부를 CanvasStage 쪽에 알려주는 setter */
  setIsOOB: (val: boolean) => void;

  /** 상태 업데이트 콜백들 (Zustand actions) */
  setSelectedIds: (ids: string[]) => void;
  setUpdateFrame: (
    id: string,
    patch: Partial<Pick<Section, "x" | "y" | "width" | "height" | "rotate">>,
  ) => void;
  setCommitAfterTransform: () => void;
  setScopeParentId: (id: string | null) => void;

  /** (현재는 사용 안 하지만, 향후 드릴다운 시 자동 fit 등에 쓸 수 있는 reserved props) */
  setCanvasZoom?: (pct: number) => void;
  setPan?: (x: number, y: number) => void;
};

export default function SectionsLayer(props: SectionsLayerProps) {
  const {
    scopeContainer,
    sections,
    selectedIds,
    activeId,
    isPanning,
    containerEl,
    selectedEls,
    guidelineEls,
    snappable,
    snapGridSize,
    offsetX,
    offsetY,
    isOutOfBounds,
    setIsOOB,
    setSelectedIds,
    setUpdateFrame,
    setCommitAfterTransform,
    setScopeParentId,

    setCanvasZoom: _setCanvasZoom,
    setPan: _setPan,
  } = props;
  const { editorMode } = useEDITORStore();
  /** 로컬 좌표(rect)를 전역 좌표로 변환하는 헬퍼 */
  const toWorldRect = (local: Rect): Rect => {
    if (!scopeContainer) return local; // 루트이면 그대로
    return {
      x: local.x + offsetX,
      y: local.y + offsetY,
      w: local.w,
      h: local.h,
    };
  };

  /** 섹션들을 z-order 순으로 정렬 */
  // const sortedSections = React.useMemo(
  //   () => sections.slice().sort((a, b) => (a.z ?? 0) - (b.z ?? 0)),
  //   [sections],
  // );
  const scopeKey = scopeContainer ? scopeContainer.id : "root";
  const blockDrag =
    editorMode.kind === "contentEdit" &&
    scopeContainer &&
    scopeContainer.id !== null &&
    editorMode.sectionId === scopeContainer.id;
  console.log("scopeContainer : ", scopeContainer);

  return (
    <>
      {scopeContainer && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 10,
            width: scopeContainer.width,
            height: scopeContainer.height,
            border: "1px solid rgba(99,102,241,0.35)",
            background: scopeContainer.bg,
            // pointerEvents: "none",
            boxSizing: "border-box",
          }}
        >
          <SectionItemView
            item={scopeContainer}
            selected={true}
            onRequestSelect={multi => {
              // shift/meta 선택 멀티 셀렉션
              setSelectedIds([scopeContainer.id]);
            }}
          />
        </div>
      )}
      {sections.map(section => {
        const isSelected = selectedIds.includes(section.id);
        const isActive = activeId === section.id;
        const isLocked = !!section.lock;

        // 가독성을 위해 변수 짧게
        const s = section;

        return (
          <ResizeContainer
            key={`${scopeKey}-${s.id}`}
            id={s.id}
            active={isLocked ? false : isActive}
            onActiveChange={act => {
              if (act) {
                setSelectedIds([s.id]);
              }
            }}
            // 여기서의 x, y, width, height 는 "현재 스코프 기준 로컬 좌표"
            width={s.width}
            height={s.height}
            x={s.x}
            y={s.y}
            draggable={isActive && !blockDrag}
            resizable
            containerEl={containerEl as any}
            targets={selectedEls.length > 1 ? selectedEls : undefined}
            snappable={snappable}
            snapGridWidth={snapGridSize}
            snapGridHeight={snapGridSize}
            elementGuidelines={guidelineEls}
            onDragStart={e => {
              if (blockDrag) {
                e.stop?.();
                return;
              }
            }}
            /* ===== 드래그 중 (move) ===== */
            onDrag={(e: any) => {
              if (isPanning || isLocked) return;

              const target = e.target as HTMLElement;
              const cs = getComputedStyle(target);

              const w = parseFloat(cs.width || "") || s.width;
              const h = parseFloat(cs.height || "") || s.height;

              // moveable이 주는 left/top 은 현재 스코프 기준 로컬 좌표
              const cand: Rect = { x: e.left, y: e.top, w, h };
              setIsOOB(isOutOfBounds(cand));
            }}
            /* ===== 리사이즈 중 ===== */
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
                e.height ?? parseFloat(target.style.height || "") ?? s.height;

              const cand: Rect = { x: l, y: t, w, h };
              setIsOOB(isOutOfBounds(cand));
            }}
            /* ===== 드래그 끝 (drop) ===== */
            onDragEnd={(e: any) => {
              if (isPanning || isLocked) return;

              const el = e.target as HTMLElement;
              const cs = getComputedStyle(el);

              const nx = e.lastEvent?.left ?? parseFloat(cs.left || "") ?? s.x;
              const ny = e.lastEvent?.top ?? parseFloat(cs.top || "") ?? s.y;
              const w = parseFloat(cs.width || "") || s.width;
              const h = parseFloat(cs.height || "") || s.height;

              const proposalLocal: Rect = { x: nx, y: ny, w, h };
              const prevLocal: Rect = {
                x: s.x,
                y: s.y,
                w: s.width,
                h: s.height,
              };

              // 경계를 벗어나면 이전 위치로 롤백
              const fixedLocal = isOutOfBounds(proposalLocal)
                ? prevLocal
                : proposalLocal;

              // DOM 위치도 고정된 값으로 맞춰줌
              el.style.left = `${fixedLocal.x}px`;
              el.style.top = `${fixedLocal.y}px`;

              // 저장은 전역 좌표로
              const world = toWorldRect(fixedLocal);
              setUpdateFrame(s.id, { x: world.x, y: world.y });
              setCommitAfterTransform();
              setIsOOB(false);
            }}
            /* ===== 리사이즈 끝 ===== */
            onResizeEnd={(e: any) => {
              if (isPanning || isLocked) return;

              const el = e.target as HTMLElement;
              const cs = getComputedStyle(el);

              const l = parseFloat(cs.left || "") || s.x;
              const t = parseFloat(cs.top || "") || s.y;
              const w =
                e.lastEvent?.width ?? parseFloat(cs.width || "") ?? s.width;
              const h =
                e.lastEvent?.height ?? parseFloat(cs.height || "") ?? s.height;

              const proposalLocal: Rect = { x: l, y: t, w, h };
              const prevLocal: Rect = {
                x: s.x,
                y: s.y,
                w: s.width,
                h: s.height,
              };

              const fixedLocal = isOutOfBounds(proposalLocal)
                ? prevLocal
                : proposalLocal;

              el.style.left = `${fixedLocal.x}px`;
              el.style.top = `${fixedLocal.y}px`;
              el.style.width = `${fixedLocal.w}px`;
              el.style.height = `${fixedLocal.h}px`;

              const world = toWorldRect(fixedLocal);

              setUpdateFrame(s.id, {
                x: world.x,
                y: world.y,
                width: fixedLocal.w,
                height: fixedLocal.h,
              });
              setCommitAfterTransform();
              setIsOOB(false);
            }}
          >
            {/* 실제 섹션 안쪽 내용 + 더블클릭 드릴다운 */}
            <div
              style={{ width: "100%", height: "100%" }}
              onDoubleClick={e => {
                e.stopPropagation();

                // 이 섹션을 "현재 스코프"로 설정 → 드릴다운
                setScopeParentId(s.id);
                setSelectedIds([s.id]);
              }}
            >
              <SectionItemView
                item={s}
                selected={isSelected}
                onRequestSelect={multi => {
                  // shift/meta 선택 멀티 셀렉션
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
    </>
  );
}
