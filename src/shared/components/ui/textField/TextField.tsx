import {
  TextField2 as DsTextField2,
  TextField2Props as DsTextField2Props,
} from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

interface ResizeTextField2Props extends Omit<DsTextField2Props, "ref"> {
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

export default function TextField({
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
  width,
  height,
  x,
  y,
  ...props
}: ResizeTextField2Props) {
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
      <DsTextField2
        sx={{
          width: "100%",
          height: height ? "100%" : undefined,
          display: "flex",
          ...(height
            ? {
                // FormControl 레벨에서 100% 보장
                "& .MuiFormControl-root": {
                  height: "100%",
                  display: "flex",
                },
                // Input 컨테이너 100% 높이 및 중앙 정렬
                "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                },
                // 실제 input 영역 확장
                "& .MuiInputBase-input, & .MuiOutlinedInput-input": {
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  paddingTop: 0,
                  paddingBottom: 0,
                },
                // multiline일 경우에도 컨테이너 높이를 따라가도록
                "& .MuiInputBase-multiline": {
                  height: "100%",
                  alignItems: "stretch",
                },
                "& textarea.MuiInputBase-input": {
                  height: "100%",
                  resize: "none",
                },
              }
            : {}),
        }}
        {...props}
      />
    </ResizeContainer>
  );
}
