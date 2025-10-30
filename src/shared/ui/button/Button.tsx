import {
  Button as AntdButton,
  ButtonProps as AntdButtonProps,
} from "fone-design-system_v2";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeButtonProps extends Omit<AntdButtonProps, "ref"> {
  id?: string;
  resizable?: boolean;
  draggable?: boolean;
  throttleResize?: number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  x?: number;
  y?: number;
}

export default function Button({
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
}: ResizeButtonProps) {
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
      renderDirections={["e", "w"]} // ["nw", "n", "ne", "w", "e", "sw", "s", "se"]
    >
      <AntdButton style={{ width: "100%", height: "100%" }} {...props}>
        {children}
      </AntdButton>
    </ResizeContainer>
  );
}
