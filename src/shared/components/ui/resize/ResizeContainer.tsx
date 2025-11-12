import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable, {
  ElementGuidelineValueOption,
  MoveableRefType,
} from "react-moveable";

import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import useResizeStore from "@/shared/store/resize";

/** Moveable 그룹 타겟 타입 */
type TargetsType =
  | ((ElementGuidelineValueOption | MoveableRefType<Element>)[] &
      (HTMLElement | SVGElement)[])
  | (HTMLElement | SVGElement)[]
  | undefined;

interface Props {
  /** 컨트롤(조작 핸들) 표시 여부 - Controlled */
  active?: boolean;
  /** active 변경 시 알림(외부 클릭 등으로 비활성 요청) */
  onActiveChange?: (active: boolean) => void;

  /** Moveable 그룹 대상 */
  targets?: TargetsType;

  /** 컴포넌트를 구분하는 ID */
  id?: string;

  /** 리사이즈/드래그 가능 여부 */
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;

  /** 리사이즈, 드래그 최소 단위 */
  throttleResize?: number;

  /** 최소/최대 너비/높이 */
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  /** 자식 요소 */
  children: ReactNode;

  /** 초기 크기/좌표(논리 px) */
  width: number;
  height: number;
  x: number;
  y: number;

  /** 회전 각도(도) */
  rotate?: number;

  /** 뷰포트 줌값 (ex. 1.25) */
  zoom?: number;

  /** 스케일이 적용된 레이어 DOM (좌표계 기준 컨테이너) */
  containerEl?: HTMLElement | null;

  /* Moveable 이벤트 */
  onResizeStart?: (e: any) => void;
  onResize?: (e: any) => void;
  onResizeEnd?: (e: any) => void;
  onResizeGroupStart?: (e: any) => void;
  onResizeGroup?: (e: any) => void;
  onResizeGroupEnd?: (e: any) => void;
  onDragStart?: (e: any) => void;
  onDrag?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onDragGroupStart?: (e: any) => void;
  onDragGroup?: (e: any) => void;
  onDragGroupEnd?: (e: any) => void;
  onRotateStart?: (e: any) => void;
  onRotate?: (e: any) => void;
  onRotateEnd?: (e: any) => void;

  /** 스냅 */
  snappable?: boolean | (string[] & false) | (string[] & true);
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?:
    | ((ElementGuidelineValueOption | MoveableRefType<Element>)[] &
        (HTMLDivElement | null)[])
    | HTMLElement
    | MoveableRefType<Element>
    | ElementGuidelineValueOption
    | null
    | any;
}

export default function ResizeContainer({
  id = "",
  children,

  /** Controlled 표시 여부 */
  active = false,
  onActiveChange,

  /** 기능 */
  resizable,
  draggable,
  rotatable,
  throttleResize,

  /** 제한 */
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,

  /** 초기 상태 */
  width: propWidth,
  height: propHeight,
  x: propX = 0,
  y: propY = 0,
  rotate = 0,

  /** 좌표계/줌 */
  zoom = 1,
  containerEl,

  /** 이벤트 */
  onResizeStart,
  onResize,
  onResizeEnd,
  onResizeGroupStart,
  onResizeGroup,
  onResizeGroupEnd,
  onDragStart,
  onDrag,
  onDragEnd,
  onDragGroupStart,
  onDragGroup,
  onDragGroupEnd,
  onRotateStart,
  onRotate,
  onRotateEnd,

  /** 그룹/스냅 */
  targets,
  snappable = true,
  snapGridWidth = 16,
  snapGridHeight = 16,
  elementGuidelines,
}: Props) {
  /** 외부 클릭 시 비활성화 요청 */
  const moveableRef = useOutsideClick(() => onActiveChange?.(false));

  /** 레이아웃(크기/좌표) 캐시 */
  const { resize, setResize, setId } = useResizeStore();

  const width = resize[id]?.width ?? propWidth;
  const height = resize[id]?.height ?? propHeight;
  const x = resize[id]?.x ?? propX ?? 0;
  const y = resize[id]?.y ?? propY ?? 0;

  useEffect(() => {
    setResize(id, {
      width: propWidth || 0,
      height: propHeight || 0,
      x: propX || 0,
      y: propY || 0,
    });
    setId(id);
  }, [id, propWidth, propHeight, propX, propY, setId, setResize]);

  // 리사이즈 시작 기준값
  const resizeStartRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
    dirX: number;
    dirY: number;
  } | null>(null);

  return (
    <>
      {/* Moveable는 active일 때만 렌더 → 배경 클릭으로 selectedIds가 비면 자동 숨김 */}
      {active && (
        <Moveable
          /* 단일/그룹 전환 */
          target={moveableRef}
          targets={targets || undefined}
          draggable={draggable}
          resizable={resizable}
          rotatable={rotatable}
          origin={false}
          throttleResize={throttleResize}
          /* 좌표계 고정 */
          container={containerEl ?? undefined}
          rootContainer={containerEl ?? undefined}
          zoom={zoom}
          /* 스냅 */
          snappable={snappable}
          snapGridWidth={snapGridWidth}
          snapGridHeight={snapGridHeight}
          elementGuidelines={elementGuidelines ?? []}
          /* ===== Drag ===== */
          onDragStart={e => {
            onDragStart?.(e);
          }}
          onDrag={e => {
            // 미리보기
            const el = e.target as HTMLElement;
            el.style.left = `${e.left}px`;
            el.style.top = `${e.top}px`;
            onDrag?.(e);
          }}
          onDragEnd={e => {
            onDragEnd?.(e);
          }}
          /* ===== Resize ===== */
          onResizeStart={e => {
            const cs = getComputedStyle(e.target as HTMLElement);
            const startWidth = parseFloat(cs.width) || 0;
            const startHeight = parseFloat(cs.height) || 0;
            const startLeft = parseFloat(cs.left) || 0;
            const startTop = parseFloat(cs.top) || 0;
            const [dirX, dirY] = (e.direction as number[]) || [0, 0];
            resizeStartRef.current = {
              width: startWidth,
              height: startHeight,
              left: startLeft,
              top: startTop,
              dirX,
              dirY,
            };
            onResizeStart?.(e);
          }}
          onResize={e => {
            const newWidth = Math.max(minWidth, Math.min(e.width, maxWidth));
            const newHeight = Math.max(
              minHeight,
              Math.min(e.height, maxHeight),
            );
            const target = e.target as HTMLElement;

            // 크기 반영
            target.style.width = `${newWidth}px`;
            target.style.height = `${newHeight}px`;

            // 상/좌측 핸들 보정
            const start = resizeStartRef.current;
            if (start) {
              const { dirX, dirY } = start;
              if (dirX === -1) {
                const newLeft = start.left + (start.width - newWidth);
                target.style.left = `${newLeft}px`;
              }
              if (dirY === -1) {
                const newTop = start.top + (start.height - newHeight);
                target.style.top = `${newTop}px`;
              }
            }
            onResize?.(e);
          }}
          onResizeEnd={e => {
            // e.lastEvent가 없을 수 있으니 안전하게 처리
            const target = e.target as HTMLElement;
            const cs = getComputedStyle(target);
            const finalLeft = parseFloat(cs.left) || x || 0;
            const finalTop = parseFloat(cs.top) || y || 0;

            const lastW = e?.lastEvent?.width;
            const lastH = e?.lastEvent?.height;

            const finalW =
              typeof lastW === "number"
                ? lastW
                : parseFloat(cs.width) || width || 0;
            const finalH =
              typeof lastH === "number"
                ? lastH
                : parseFloat(cs.height) || height || 0;

            setResize(id, {
              width: finalW,
              height: finalH,
              x: draggable ? finalLeft : x,
              y: draggable ? finalTop : y,
            });
            resizeStartRef.current = null;

            onResizeEnd?.(e);
          }}
          /* ===== Rotate ===== */
          onRotateStart={e => onRotateStart?.(e)}
          onRotate={e => onRotate?.(e)}
          onRotateEnd={e => onRotateEnd?.(e)}
          /* 그룹 이벤트 패스스루 */
          onResizeGroupStart={e => onResizeGroupStart?.(e)}
          onResizeGroup={e => onResizeGroup?.(e)}
          onResizeGroupEnd={e => onResizeGroupEnd?.(e)}
          onDragGroupStart={e => onDragGroupStart?.(e)}
          onDragGroup={e => onDragGroup?.(e)}
          onDragGroupEnd={e => onDragGroupEnd?.(e)}
          /* 핸들 방향 */
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        />
      )}

      <StyledContainer
        id={id}
        ref={moveableRef}
        width={width || "auto"}
        height={height || "auto"}
        x={x}
        y={y}
        draggable={draggable}
        style={{
          transform: rotate ? `rotate(${rotate}deg)` : "none",
          transformOrigin: "left top",
        }}
        // 내부에서 활성 전환이 필요하면 아래 주석을 사용
        // onMouseDown={() => onActiveChange?.(true)}
      >
        {children}
      </StyledContainer>
    </>
  );
}

interface StyledContainerProps {
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  draggable?: boolean;
}

const StyledContainer = styled.div<StyledContainerProps>`
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === "number" ? `${height}px` : height};
  position: ${({ draggable }) => (draggable ? "absolute" : "static")};
  left: ${({ x }) => `${x}px`};
  top: ${({ y }) => `${y}px`};
`;
