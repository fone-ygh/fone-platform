import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable from "react-moveable";

import useResizeStore from "@/shared/store/resize";

type TargetsType = (HTMLElement | SVGElement)[] | undefined;

interface Props {
  /* Selection */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  defaultActive?: boolean;

  /* Identity + features */
  id?: string;
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  throttleResize?: number;

  /* limits */
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  /* layout */
  width: number;
  height: number;
  x: number;
  y: number;
  rotate?: number;

  /* coords */
  zoom?: number;
  containerEl?: HTMLElement | null;

  /* group + snap */
  targets?: TargetsType;
  snappable?: boolean | string[];
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;

  /* events (single / group) */
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

  children: ReactNode;
}

export default function ResizeContainer({
  id = "",
  children,

  // selection
  active,
  onActiveChange,
  defaultActive = false,

  // features
  resizable,
  draggable,
  rotatable,
  throttleResize,

  // limits
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,

  // initial layout
  width: propWidth,
  height: propHeight,
  x: propX = 0,
  y: propY = 0,
  rotate = 0,

  // coords
  zoom = 1,
  containerEl,

  // group/snap
  targets,
  snappable = true,
  snapGridWidth = 16,
  snapGridHeight = 16,
  elementGuidelines,

  // callbacks
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
}: Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  // internal selection (uncontrolled fallback)
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = active ?? internalActive;

  // layout cache (zustand)
  const { resize, setResize } = useResizeStore();
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
  }, [id, propWidth, propHeight, propX, propY, setResize]);

  // resize anchor state (for N/W handles)
  const resizeStartRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
    dirX: number;
    dirY: number;
  } | null>(null);

  /** click → request select (bubble up) */
  const handlePointerDownCapture = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // only left button
    if (active !== undefined) {
      if (!active) onActiveChange?.(true);
    } else {
      if (!internalActive) setInternalActive(true);
      onActiveChange?.(true);
    }
  };

  /** Moveable: single vs group target 선택 */
  const hasGroup = isActive && targets && targets.length > 1;
  const moveableTarget = isActive && !hasGroup ? targetRef : undefined;
  const moveableTargets = hasGroup ? targets : undefined;

  return (
    <>
      <Moveable
        target={moveableTarget}
        targets={moveableTargets}
        draggable={!!draggable && isActive}
        resizable={!!resizable && isActive}
        rotatable={!!rotatable && isActive}
        origin={false}
        throttleResize={throttleResize}
        container={containerEl ?? undefined}
        rootContainer={containerEl ?? undefined}
        zoom={zoom}
        snappable={snappable}
        snapGridWidth={snapGridWidth}
        snapGridHeight={snapGridHeight}
        elementGuidelines={elementGuidelines ?? []}
        renderDirections={
          isActive ? ["nw", "n", "ne", "w", "e", "sw", "s", "se"] : []
        }
        /* ----- Drag (single) ----- */
        onDragStart={e => onDragStart?.(e)}
        onDrag={e => {
          const el = e.target as HTMLElement;
          el.style.left = `${e.left}px`;
          el.style.top = `${e.top}px`;
          onDrag?.(e);
        }}
        onDragEnd={e => onDragEnd?.(e)}
        /* ----- Drag (group) ----- */
        onDragGroupStart={e => onDragGroupStart?.(e)}
        onDragGroup={e => {
          // 미리보기: 각각의 타겟에 반영
          e.events.forEach((ev: any) => {
            const el = ev.target as HTMLElement;
            el.style.left = `${ev.left}px`;
            el.style.top = `${ev.top}px`;
          });
          onDragGroup?.(e);
        }}
        onDragGroupEnd={e => onDragGroupEnd?.(e)}
        /* ----- Resize (single) ----- */
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
          const newW = Math.max(minWidth, Math.min(e.width, maxWidth));
          const newH = Math.max(minHeight, Math.min(e.height, maxHeight));
          const target = e.target as HTMLElement;
          target.style.width = `${newW}px`;
          target.style.height = `${newH}px`;

          const start = resizeStartRef.current;
          if (start) {
            const { dirX, dirY } = start;
            if (dirX === -1) {
              const newLeft = start.left + (start.width - newW);
              target.style.left = `${newLeft}px`;
            }
            if (dirY === -1) {
              const newTop = start.top + (start.height - newH);
              target.style.top = `${newTop}px`;
            }
          }
          onResize?.(e);
        }}
        onResizeEnd={e => {
          const target = e.target as HTMLElement;
          const cs = getComputedStyle(target);

          const finalLeft = parseFloat(cs.left) || x || 0;
          const finalTop = parseFloat(cs.top) || y || 0;
          const finalW =
            (e?.lastEvent?.width as number) ??
            (parseFloat(cs.width) || width || 0);
          const finalH =
            (e?.lastEvent?.height as number) ??
            (parseFloat(cs.height) || height || 0);

          setResize(id, {
            width: finalW,
            height: finalH,
            x: draggable ? finalLeft : x,
            y: draggable ? finalTop : y,
          });
          resizeStartRef.current = null;
          onResizeEnd?.(e);
        }}
        /* ----- Resize (group) ----- */
        onResizeGroupStart={e => onResizeGroupStart?.(e)}
        onResizeGroup={e => {
          // 미리보기: 각각의 타겟에 반영
          e.events.forEach((ev: any) => {
            const target = ev.target as HTMLElement;
            const newW = Math.max(minWidth, Math.min(ev.width, maxWidth));
            const newH = Math.max(minHeight, Math.min(ev.height, maxHeight));

            target.style.width = `${newW}px`;
            target.style.height = `${newH}px`;

            // 좌/상 핸들 보정
            const { direction, drag } = ev;
            const [dirX, dirY] = (direction as number[]) || [0, 0];
            if (dirX === -1) target.style.left = `${drag.left}px`;
            if (dirY === -1) target.style.top = `${drag.top}px`;
          });
          onResizeGroup?.(e);
        }}
        onResizeGroupEnd={e => onResizeGroupEnd?.(e)}
        /* ----- Rotate (optional) ----- */
        onRotateStart={e => onRotateStart?.(e)}
        onRotate={e => onRotate?.(e)}
        onRotateEnd={e => onRotateEnd?.(e)}
      />

      <StyledContainer
        id={id}
        ref={targetRef}
        onPointerDownCapture={handlePointerDownCapture}
        width={width || "auto"}
        height={height || "auto"}
        x={x}
        y={y}
        draggable={draggable}
        style={{
          transform: rotate ? `rotate(${rotate}deg)` : "none",
          transformOrigin: "left top",
        }}
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
  position: ${({ draggable }) => (draggable ? "absolute" : "static")};
  left: ${({ x }) => `${x ?? 0}px`};
  top: ${({ y }) => `${y ?? 0}px`};
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === "number" ? `${height}px` : height};
`;
