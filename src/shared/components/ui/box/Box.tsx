import * as React from "react";
import { Box as DsBox, BoxProps as DsBoxProps } from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeBoxProps extends Omit<DsBoxProps, "ref"> {
  id?: string;
  targets?: (HTMLElement | SVGElement)[];
  resizable?: boolean;
  draggable?: boolean;
  throttleResize?: number;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  height: number;
  minHeight?: number;
  maxHeight?: number;
  x: number;
  y: number;
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
  snappable?: boolean | (string[] & false) | (string[] & true);
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;
}

const Box = React.forwardRef<HTMLDivElement, ResizeBoxProps>(function Box(
  {
    id,
    targets,
    resizable,
    draggable,
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
    snappable,
    snapGridWidth,
    snapGridHeight,
    elementGuidelines,
    ...props
  }: ResizeBoxProps,
  ref,
) {
  return (
    <ResizeContainer
      id={id}
      targets={targets}
      resizable={resizable}
      draggable={draggable}
      throttleResize={throttleResize}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      width={width}
      height={height}
      x={x}
      y={y}
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
      snappable={snappable}
      snapGridWidth={snapGridWidth}
      snapGridHeight={snapGridHeight}
      elementGuidelines={elementGuidelines}
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]} // ["nw", "n", "ne", "w", "e", "sw", "s", "se"]
    >
      <DsBox ref={ref} width={"100%"} height={"100%"} {...props}>
        {children}
      </DsBox>
    </ResizeContainer>
  );
});

export default Box;
