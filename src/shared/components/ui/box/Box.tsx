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
}

export default function Box({
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
  ...props
}: ResizeBoxProps) {
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
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]} // ["nw", "n", "ne", "w", "e", "sw", "s", "se"]
    >
      <DsBox
        width={"100%"}
        height={height}
        style={{ width: "100%", height: height && "100%" }}
        {...props}
      >
        {children}
      </DsBox>
    </ResizeContainer>
  );
}
