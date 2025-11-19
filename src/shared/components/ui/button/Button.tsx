import {
  Button as DsButton,
  ButtonProps as DsButtonProps,
} from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeButtonProps extends Omit<DsButtonProps, "ref"> {
  id?: string;
  /** Selection */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
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

export default function Button({
  id,
  active,
  onActiveChange,
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
      active={!!active}
      onActiveChange={onActiveChange}
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
      <div
        // 투명 오버레이로 Select 상호작용을 차단 (버블링은 허용하여 컨테이너 활성화/드래그 영향 최소화)
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "transparent",
        }}
      />
      <DsButton style={{ width: "100%", height: height && "100%" }} {...props}>
        {children}
      </DsButton>
    </ResizeContainer>
  );
}
