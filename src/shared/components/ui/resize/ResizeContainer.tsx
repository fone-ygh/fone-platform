import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable from "react-moveable";

import useResizeStore from "@/shared/store/resize";

type TargetsType = (HTMLElement | SVGElement)[] | undefined;

interface Props {
  /** === Selection(외부 제어) === */
  active?: boolean; // 외부에서 선택 상태를 내려줌
  onActiveChange?: (active: boolean) => void; // 내부 상호작용으로 바꿔달라고 신호

  /** 테스트 편의: 내부 디폴트 활성 (Controlled 안 쓰는 샌드박스에서만) */
  defaultActive?: boolean;

  /** id & 레이아웃/동작 옵션 */
  id?: string;
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  throttleResize?: number;

  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  width: number;
  height: number;
  x: number;
  y: number;
  rotate?: number;

  /** 캔버스 좌표계/줌 */
  zoom?: number;
  containerEl?: HTMLElement | null;

  /** 그룹/스냅 */
  targets?: TargetsType;
  snappable?: boolean | string[];
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;

  /** Moveable 콜백들 */
  onResizeStart?: (e: any) => void;
  onResize?: (e: any) => void;
  onResizeEnd?: (e: any) => void;
  onDragStart?: (e: any) => void;
  onDrag?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onRotateStart?: (e: any) => void;
  onRotate?: (e: any) => void;
  onRotateEnd?: (e: any) => void;

  children: ReactNode;
}

export default function ResizeContainer({
  id = "",
  children,

  // Selection
  active,
  onActiveChange,
  defaultActive = false,

  // 기능
  resizable,
  draggable,
  rotatable,
  throttleResize,

  // 제한
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,

  // 초기 레이아웃
  width: propWidth,
  height: propHeight,
  x: propX = 0,
  y: propY = 0,
  rotate = 0,

  // 좌표계
  zoom = 1,
  containerEl,

  // 그룹/스냅
  targets,
  snappable = true,
  snapGridWidth = 16,
  snapGridHeight = 16,
  elementGuidelines,

  // 이벤트
  onResizeStart,
  onResize,
  onResizeEnd,
  onDragStart,
  onDrag,
  onDragEnd,
  onRotateStart,
  onRotate,
  onRotateEnd,
}: Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  // 내부 선택 상태 (Uncontrolled 용 / Controlled이면 active prop 우선)
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = active ?? internalActive;

  // 레이아웃 캐시 (zustand)
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

  // 리사이즈 기준값 저장
  const resizeStartRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
    dirX: number;
    dirY: number;
  } | null>(null);

  /** 컨테이너 클릭 → 선택 요청(상위로) */
  const handlePointerDownCapture = (e: React.PointerEvent) => {
    // 좌클릭만
    if (e.button !== 0) return;

    // Controlled이면 상위에게 “켜달라” 신호만 보냄
    if (active !== undefined) {
      if (!active) onActiveChange?.(true);
    } else {
      // Uncontrolled이면 내부 상태 켬 + 상위에도 알려줌(선택 싱크 맞춤)
      if (!internalActive) setInternalActive(true);
      onActiveChange?.(true);
    }
  };

  /** 선택 해제 요청 (원칙상 상위에서 배경 클릭으로 관리하는 걸 권장) */
  const requestDeactivate = () => {
    if (active !== undefined) onActiveChange?.(false);
    else setInternalActive(false);
  };

  return (
    <>
      {/* Moveable은 항상 마운트하지만, 선택된 경우에만 target 연결 */}
      <Moveable
        target={isActive ? targetRef : undefined}
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
        /* Drag */
        onDragStart={e => onDragStart?.(e)}
        onDrag={e => {
          const el = e.target as HTMLElement;
          el.style.left = `${e.left}px`;
          el.style.top = `${e.top}px`;
          onDrag?.(e);
        }}
        onDragEnd={e => onDragEnd?.(e)}
        /* Resize */
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
        /* Rotate (옵션) */
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
  /* 선택 상태 시 시각적 피드백을 주고 싶으면 여기에 outline 토글 로직 추가 */
`;
