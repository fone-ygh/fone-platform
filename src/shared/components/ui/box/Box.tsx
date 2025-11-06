import * as React from "react";
import { Box as DsBox, BoxProps as DsBoxProps } from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeBoxProps extends Omit<DsBoxProps, "ref"> {
  id?: string;
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
  snappable?: boolean | (string[] & false) | (string[] & true);
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;
}

const Box = React.forwardRef<HTMLDivElement, ResizeBoxProps>(function Box(
  {
    id,
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
      snappable={snappable}
      snapGridWidth={snapGridWidth}
      snapGridHeight={snapGridHeight}
      elementGuidelines={ref}
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]} // ["nw", "n", "ne", "w", "e", "sw", "s", "se"]
    >
      <DsBox ref={ref} width={"100%"} height={"100%"} {...props}>
        {children}
      </DsBox>
    </ResizeContainer>
  );
});

export default Box;
