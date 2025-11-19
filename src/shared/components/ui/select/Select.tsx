import {
  Select as DsSelect,
  SelectProps as DsSelectProps,
} from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeSelectProps extends Omit<DsSelectProps, "ref"> {
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
  /** 클릭해도 옵션이 열리지 않도록 차단 */
}

export default function Select({
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
}: ResizeSelectProps) {
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
        style={{
          width: "100%",
          height: height ? "100%" : undefined,
          display: "flex",
          position: "relative",
        }}
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
        <DsSelect
          sx={{
            width: "100%",
            height: height ? "100%" : undefined,
            display: "flex",
            ...(height
              ? {
                  // MUI FormControl 및 InputBase 레벨을 모두 100%로 맞춰 상하로 꽉 차도록 함
                  "& .MuiFormControl-root": {
                    height: "100%",
                    display: "flex",
                  },
                  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  },
                  // 실제 선택 영역/인풋 영역 높이도 100%로
                  "& .MuiInputBase-input, & .MuiOutlinedInput-input, & .MuiSelect-select":
                    {
                      height: "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      paddingTop: 0,
                      paddingBottom: 0,
                    },
                }
              : {}),
          }}
          {...props}
        >
          {children}
        </DsSelect>
      </div>
    </ResizeContainer>
  );
}
