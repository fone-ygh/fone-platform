import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable, {
  ElementGuidelineValueOption,
  MoveableRefType,
} from "react-moveable";

import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import useResizeStore from "@/shared/store/resize";

// Moveable 그룹 타겟 타입(일반 HTMLElement/SVGElement, CSS selector, 혹은 RefObject까지 허용)

interface Props {
  targets?: (HTMLElement | SVGElement)[];

  /** 컴포넌트를 구분하는 ID */
  id?: string;

  /** 리사이즈 가능 여부 */
  resizable?: boolean;

  /** 드래그 가능 여부 */
  draggable?: boolean;

  /** 리사이즈, 드래그 최소 단위 */
  throttleResize?: number;

  /** 최소 너비 */
  minWidth?: number;

  /** 최대 너비 */
  maxWidth?: number;

  /** 최소 높이 */
  minHeight?: number;

  /** 최대 높이 */
  maxHeight?: number;

  /** 자식 요소 */
  children: ReactNode;

  /** 초기 너비 */
  width?: number;

  /** 초기 높이 */
  height?: number;

  /** 초기 X 좌표 */
  x?: number;

  /** 초기 Y 좌표 */
  y?: number;

  /** 리사이즈 가능한 방향 */
  renderDirections: string[];

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

  /** 스냅 기능 on/off */
  snappable?: boolean | (string[] & false) | (string[] & true);

  /** 세로(수직) 방향 그리드 간격. 0보다 크면 x축 이동/리사이즈가 그리드 단위로 스냅 */
  snapGridWidth?: number;

  /** 가로(수평) 방향 그리드 간격. 0보다 크면 y축 이동/리사이즈가 그리드 단위로 스냅. */
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
  resizable,
  draggable,
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
  targets,
  snappable = true,
  snapGridWidth = 16,
  snapGridHeight = 16,
  elementGuidelines,
}: Props) {
  const [active, setActive] = useState(false);

  const moveableRef = useOutsideClick(() => setActive(false));

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

  // 리사이즈 시작 시 기준값 저장(좌측/상단 핸들에서 위로/왼쪽으로 늘릴 때 top/left 조정 필요)
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
      {active && (
        <Moveable
          target={moveableRef}
          targets={targets || undefined}
          resizable={resizable}
          draggable={draggable}
          origin={false}
          throttleResize={throttleResize}
          renderDirections={renderDirections}
          snappable={snappable}
          snapGridWidth={snapGridWidth}
          snapGridHeight={snapGridHeight}
          elementGuidelines={elementGuidelines ?? []}
          // elementSnapDirections={{
          //   left: true,
          //   top: true,
          //   right: true,
          //   bottom: true,
          //   center: true,
          //   middle: true,
          // }}
          // snapThreshold={8}
          // snapDigit={0}
          // horizontalGuidelines={[100, 200, 500]} // 선택: 고정 가이드
          // verticalGuidelines={[120, 400]}
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

            // 상/좌측 리사이즈 시, top/left를 보정하여 위/왼쪽으로 확장되도록 처리
            if (draggable) {
              const start = resizeStartRef.current;
              if (start) {
                // 방향: 좌(-1)/무(0)/우(1), 상(-1)/무(0)/하(1)
                const { dirX, dirY } = start;
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
            // 최종 좌표를 커밋(상/좌 리사이즈 시 이동된 top/left 반영)
            const cs = getComputedStyle(e.target as HTMLElement);
            const finalLeft = parseFloat(cs.left) || x || 0;
            const finalTop = parseFloat(cs.top) || y || 0;
            setResize(id, {
              width: e.lastEvent.width,
              height: e.lastEvent.height,
              x: draggable ? finalLeft : x,
              y: draggable ? finalTop : y,
            });
            resizeStartRef.current = null;

            onResizeEnd?.(e);
          }}
          onDragStart={e => {
            onDragStart?.(e);
          }}
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
            });

            onDragEnd?.(e);
          }}
          onResizeGroupStart={e => {
            onResizeGroupStart?.(e);
          }}
          onResizeGroup={e => onResizeGroup?.(e)}
          onResizeGroupEnd={e => onResizeGroupEnd?.(e)}
          onDragGroupStart={e => {
            onDragGroupStart?.(e);
          }}
          onDragGroup={e => onDragGroup?.(e)}
          onDragGroupEnd={e => onDragGroupEnd?.(e)}
        />
      )}
      <StyledContainer
        id={id}
        ref={moveableRef}
        onClick={() => setActive(true)}
        width={width || "auto"}
        height={height || "auto"}
        x={x}
        y={y}
        draggable={draggable}
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
