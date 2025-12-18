import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable from "react-moveable";

type TargetsType = (HTMLElement | SVGElement)[] | undefined;

interface Props {
  /* Selection */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  defaultActive?: boolean;
  renderDirections?: string[];

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
  renderDirections,

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

  // controlled layout
  width,
  height,
  x,
  y,
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
  const moveableRef = useRef<any>(null);

  // internal selection (uncontrolled fallback)
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = active ?? internalActive;

  /**
   * props(x/y/w/h)가 바뀌면 DOM에 반영
   * - 드래그 중에는 부모 props가 안 바뀌는 게 보통이라 (=end에서만 커밋)
   *   이 effect가 드래그 DOM을 덮어쓰지 않음
   */
  useLayoutEffect(() => {
    if (!targetRef.current) return;

    targetRef.current.style.left = `${x}px`;
    targetRef.current.style.top = `${y}px`;
    targetRef.current.style.width = `${width}px`;
    targetRef.current.style.height = `${height}px`;

    // Moveable 컨트롤 박스 sync
    // (컨테이너/줌 바뀔 때도 rect 갱신 필요)
    moveableRef.current?.updateRect();
  }, [x, y, width, height, zoom, containerEl]);

  // resize anchor state (N/W 핸들에서 좌표 보정용)
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

  // 키보드 이동: 선택(active) && draggable일 때 화살표로 이동
  useEffect(() => {
    if (!isActive || !draggable) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (
        key !== "ArrowLeft" &&
        key !== "ArrowRight" &&
        key !== "ArrowUp" &&
        key !== "ArrowDown"
      )
        return;

      const step = 1;

      let dx = 0;
      let dy = 0;

      if (key === "ArrowLeft") dx = -step;
      if (key === "ArrowRight") dx = step;
      if (key === "ArrowUp") dy = -step;
      if (key === "ArrowDown") dy = step;

      const mv = moveableRef.current;

      if (!mv) return;

      try {
        const requester = mv.request("draggable");
        requester.request({ deltaX: dx, deltaY: dy });
        requester.requestEnd();
        e.preventDefault();
      } catch {}
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, draggable]);

  return (
    <>
      <Moveable
        ref={moveableRef}
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
          isActive
            ? (renderDirections ?? ["nw", "n", "ne", "w", "e", "sw", "s", "se"])
            : []
        }
        /* ----- Drag (single) ----- */
        onDragStart={e => onDragStart?.(e)}
        onDrag={e => {
          const el = e.target as HTMLElement;

          // 드래그 중은 DOM만 변경 (부모 state는 end에서 커밋)
          el.style.left = `${e.left}px`;
          el.style.top = `${e.top}px`;
          onDrag?.(e);
        }}
        onDragEnd={e =>
          // 커밋은 바깥(SectionsLayer)에서 setUpdateFrame으로 처리
          onDragEnd?.(e)
        }
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
          resizeStartRef.current = null;
          // 커밋은 바깥에서 처리
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

const StyledContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  /* width/height/left/top은 useLayoutEffect에서 inline style로 넣음 */
`;
