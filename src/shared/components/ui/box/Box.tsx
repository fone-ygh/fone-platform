import * as React from "react";
import { Box as DsBox, BoxProps as DsBoxProps } from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeBoxProps extends Omit<DsBoxProps, "ref"> {
  id?: string;

  // 외부 제어
  active?: boolean;
  onActiveChange?: (active: boolean) => void;

  targets?: (HTMLElement | SVGElement)[];
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  throttleResize?: number;

  width: number;
  minWidth?: number;
  maxWidth?: number;
  height: number;
  minHeight?: number;
  maxHeight?: number;
  x: number;
  y: number;
  rotate?: number;

  // Moveable/좌표계
  zoom?: number;
  containerEl?: HTMLElement | null;

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
  onRotateGroupStart?: (e: any) => void;
  onRotateGroup?: (e: any) => void;
  onRotateGroupEnd?: (e: any) => void;

  snappable?: boolean | (string[] & false) | (string[] & true);
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;

  renderDirections?: string[];
}

const Box = React.forwardRef<HTMLDivElement, ResizeBoxProps>(function Box(
  {
    id,
    active,
    onActiveChange,
    targets,
    resizable,
    draggable,
    rotatable,
    throttleResize,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    children,
    width,
    height,
    x,
    y,
    rotate,
    zoom,
    containerEl,
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
    snappable,
    snapGridWidth,
    snapGridHeight,
    elementGuidelines,
    renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"],
    ...props
  }: ResizeBoxProps,
  ref,
) {
  return (
    <ResizeContainer
      id={id}
      active={active}
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
      onRotateGroupStart={onRotateGroupStart}
      onRotateGroup={onRotateGroup}
      onRotateGroupEnd={onRotateGroupEnd}
      snappable={snappable}
      snapGridWidth={snapGridWidth}
      snapGridHeight={snapGridHeight}
      elementGuidelines={elementGuidelines}
      renderDirections={renderDirections}
    >
      <DsBox ref={ref} width={"100%"} height={"100%"} {...props}>
        {children}
      </DsBox>
    </ResizeContainer>
  );
});

export default Box;
