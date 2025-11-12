import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable, {
  ElementGuidelineValueOption,
  MoveableRefType,
} from "react-moveable";

import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import useResizeStore from "@/shared/store/resize";

interface Props {
  id?: string;

  // 활성화 제어(외부/내부 둘 다 가능)
  active?: boolean;
  onActiveChange?: (active: boolean) => void;

  // Moveable 대상(그룹)
  targets?: (HTMLElement | SVGElement)[];

  // 기능 플래그
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;

  // 보정/스냅/좌표계
  zoom?: number; // ← NEW (배율 보정은 Moveable에 맡김)
  containerEl?: HTMLElement | null; // ← NEW (좌표계 기준 컨테이너)

  throttleResize?: number;

  // 최소/최대 크기
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // 자식
  children: ReactNode;

  // 초기 프레임(논리 px)
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotate?: number; // ← NEW (커밋된 회전값을 스타일에 반영)

  // 핸들 방향
  renderDirections: string[];

  // 이벤트들
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

  onRotateStart?: (e: any) => void; // ← NEW
  onRotate?: (e: any) => void; // ← NEW
  onRotateEnd?: (e: any) => void; // ← NEW
  onRotateGroupStart?: (e: any) => void; // ← NEW
  onRotateGroup?: (e: any) => void; // ← NEW
  onRotateGroupEnd?: (e: any) => void; // ← NEW

  // 스냅
  snappable?: boolean | (string[] & false) | (string[] & true);
  snapGridWidth?: number;
  snapGridHeight?: number;
  snapDigit?: number;
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
  active: activeProp,
  onActiveChange,
  resizable,
  draggable,
  rotatable,
  throttleResize,
  renderDirections,
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,
  width: propWidth,
  height: propHeight,
  x: propX = 0,
  y: propY = 0,
  rotate: propRotate = 0,
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
  onRotateGroupStart,
  onRotateGroup,
  onRotateGroupEnd,
  targets,
  snappable = true,
  snapGridWidth = 16,
  snapGridHeight = 16,
  snapDigit,
  elementGuidelines,
  zoom = 1,
  containerEl,
}: Props) {
  const [internalActive, setInternalActive] = useState(false);
  const active = activeProp ?? internalActive;

  const moveableRef = useOutsideClick(() => {
    if (onActiveChange) onActiveChange(false);
    else setInternalActive(false);
  });

  const { resize, setResize, setId } = useResizeStore();

  const width = resize[id]?.width ?? propWidth;
  const height = resize[id]?.height ?? propHeight;
  const x = resize[id]?.x ?? propX ?? 0;
  const y = resize[id]?.y ?? propY ?? 0;
  const rotate = resize[id]?.rotate ?? propRotate ?? 0; // 회전값도 저장 가능하도록 확장

  useEffect(() => {
    setResize(id, {
      width: propWidth || 0,
      height: propHeight || 0,
      x: propX || 0,
      y: propY || 0,
      rotate: propRotate || 0,
    });
    setId(id);
  }, [id, propWidth, propHeight, propX, propY, propRotate, setId, setResize]);

  // 리사이즈 시작 시 기준값 저장
  const resizeStartRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
    dirX: number;
    dirY: number;
  } | null>(null);

  // 클릭으로 활성화 (비제어 모드에서만)
  const handleClick = () => {
    if (onActiveChange) onActiveChange(true);
    else setInternalActive(true);
  };

  return (
    <>
      {active && (
        <Moveable
          target={moveableRef}
          targets={targets || undefined}
          resizable={resizable}
          draggable={draggable}
          rotatable={rotatable}
          origin={false}
          throttleResize={throttleResize}
          renderDirections={renderDirections}
          snappable={snappable}
          snapGridWidth={snapGridWidth}
          snapGridHeight={snapGridHeight}
          elementGuidelines={elementGuidelines ?? []}
          container={containerEl ?? undefined}
          rootContainer={containerEl ?? undefined}
          zoom={zoom}
          snapDigit={snapDigit}
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
            e.target.style.width = `${newWidth}px`;
            e.target.style.height = `${newHeight}px`;

            // 상/좌측 리사이즈 시 보정
            if (draggable) {
              const start = resizeStartRef.current;
              if (start) {
                const { dirX, dirY } = start; // -1 / 0 / 1
                if (dirX === -1) {
                  const newLeft = start.left + (start.width - newWidth);
                  (e.target as HTMLElement).style.left = `${newLeft}px`;
                }
                if (dirY === -1) {
                  const newTop = start.top + (start.height - newHeight);
                  (e.target as HTMLElement).style.top = `${newTop}px`;
                }
              }
            }
            onResize?.(e);
          }}
          onResizeEnd={e => {
            const cs = getComputedStyle(e.target as HTMLElement);
            const finalLeft = parseFloat(cs.left) || x || 0;
            const finalTop = parseFloat(cs.top) || y || 0;
            setResize(id, {
              width: e.lastEvent.width,
              height: e.lastEvent.height,
              x: draggable ? finalLeft : x,
              y: draggable ? finalTop : y,
              rotate, // 유지
            });
            resizeStartRef.current = null;
            onResizeEnd?.(e);
          }}
          /* ===== Drag ===== */
          onDragStart={e => onDragStart?.(e)}
          onDrag={e => {
            e.target.style.left = `${e.left}px`;
            e.target.style.top = `${e.top}px`;
            onDrag?.(e);
          }}
          onDragEnd={e => {
            setResize(id, {
              width,
              height,
              x: e.lastEvent?.left ?? x,
              y: e.lastEvent?.top ?? y,
              rotate,
            });
            onDragEnd?.(e);
          }}
          /* ===== Rotate ===== */
          onRotateStart={e => onRotateStart?.(e)}
          onRotate={e => onRotate?.(e)}
          onRotateEnd={e => {
            // 종료 시 최종 각도는 lastEvent에서
            const angle = e.lastEvent?.rotate ?? 0;
            setResize(id, { width, height, x, y, rotate: angle });
            onRotateEnd?.(e);
          }}
          /* ===== Group ===== */
          onResizeGroupStart={e => onResizeGroupStart?.(e)}
          onResizeGroup={e => onResizeGroup?.(e)}
          onResizeGroupEnd={e => onResizeGroupEnd?.(e)}
          onDragGroupStart={e => onDragGroupStart?.(e)}
          onDragGroup={e => onDragGroup?.(e)}
          onDragGroupEnd={e => onDragGroupEnd?.(e)}
          onRotateGroupStart={e => onRotateGroupStart?.(e)}
          onRotateGroup={e => onRotateGroup?.(e)}
          onRotateGroupEnd={e => onRotateGroupEnd?.(e)}
        />
      )}

      <StyledContainer
        id={id}
        ref={moveableRef}
        onClick={handleClick}
        width={width || "auto"}
        height={height || "auto"}
        x={x}
        y={y}
        draggable={draggable}
        rotate={rotate}
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
  rotate?: number;
}

const StyledContainer = styled.div<StyledContainerProps>`
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === "number" ? `${height}px` : height};
  position: ${({ draggable }) => (draggable ? "absolute" : "static")};
  left: ${({ x }) => `${x ?? 0}px`};
  top: ${({ y }) => `${y ?? 0}px`};
  transform: ${({ rotate }) => (rotate ? `rotate(${rotate}deg)` : "none")};
  transform-origin: center center;
`;
