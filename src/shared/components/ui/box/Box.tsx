import * as React from "react";
import { Box as DsBox, BoxProps as DsBoxProps } from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

export interface ResizeBoxProps extends Omit<DsBoxProps, "ref"> {
  id?: string;

  /** Moveable 표시 여부(Controlled) */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;

  /** Moveable 그룹 대상 */
  targets?: (HTMLElement | SVGElement)[];

  /** 기능 토글 */
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  throttleResize?: number;

  /** 레이아웃 */
  width: number;
  minWidth?: number;
  maxWidth?: number;
  height: number;
  minHeight?: number;
  maxHeight?: number;
  x: number;
  y: number;
  rotate?: number;

  /** 스냅/가이드 */
  snappable?: boolean | string[];
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;

  /** 좌표계/줌 */
  zoom?: number;
  containerEl?: HTMLElement | null;

  /** 이벤트 (싱글/그룹) */
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
}

const Box = React.forwardRef<HTMLDivElement, ResizeBoxProps>(function Box(
  {
    id,

    // selection
    active,
    onActiveChange,

    // group
    targets,

    // features
    resizable,
    draggable,
    rotatable,
    throttleResize,

    // limits
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,

    // layout
    children,
    width,
    height,
    x,
    y,
    rotate,

    // snap/guides
    snappable,
    snapGridWidth,
    snapGridHeight,
    elementGuidelines,

    // coords
    zoom = 1,
    containerEl,

    // events (single/group)
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

    ...dsBoxProps
  },
  ref,
) {
  return (
    <ResizeContainer
      id={id}
      active={!!active}
      onActiveChange={onActiveChange}
      targets={targets}
      resizable={resizable}
      draggable={draggable}
      rotatable={rotatable}
      throttleResize={throttleResize}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      width={width}
      height={height}
      x={x}
      y={y}
      rotate={rotate}
      zoom={zoom}
      containerEl={containerEl}
      snappable={snappable}
      snapGridWidth={snapGridWidth}
      snapGridHeight={snapGridHeight}
      elementGuidelines={elementGuidelines}
      onResizeStart={onResizeStart}
      onResize={onResize}
      onResizeEnd={onResizeEnd}
      onResizeGroupStart={onResizeGroupStart}
      onResizeGroup={onResizeGroup}
      onResizeGroupEnd={onResizeGroupEnd}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onDragGroupStart={onDragGroupStart}
      onDragGroup={onDragGroup}
      onDragGroupEnd={onDragGroupEnd}
      onRotateStart={onRotateStart}
      onRotate={onRotate}
      onRotateEnd={onRotateEnd}
    >
      {/* 내부 실 UI: 항상 100% 채우기 */}
      <DsBox ref={ref} width="100%" height="100%" {...dsBoxProps}>
        {children}
      </DsBox>
    </ResizeContainer>
  );
});

export default Box;
