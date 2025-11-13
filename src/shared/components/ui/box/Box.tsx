// src/shared/components/ui/box/Box.tsx
import * as React from "react";
import { Box as DsBox, BoxProps as DsBoxProps } from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

/**
 * ResizeContainer 인터페이스에 맞춰 정리한 Box 래퍼
 * - 선택 제어: active / onActiveChange / defaultActive
 * - 동작 옵션: resizable / draggable / rotatable / throttleResize
 * - 레이아웃: width/height/x/y(+min/max) + rotate
 * - 스냅/좌표계: snappable / snapGridWidth / snapGridHeight / elementGuidelines / zoom / containerEl
 * - 이벤트: onDrag*, onResize*, onRotate*
 */
export interface ResizeBoxProps extends Omit<DsBoxProps, "ref"> {
  id?: string;

  /** === Selection (외부 제어/통지) === */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  /** Controlled를 쓰지 않는 샌드박스용(초기 표시) */
  defaultActive?: boolean;

  /** === 동작 옵션 === */
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  throttleResize?: number;

  /** === 레이아웃 제약/초기값 === */
  width: number;
  minWidth?: number;
  maxWidth?: number;
  height: number;
  minHeight?: number;
  maxHeight?: number;
  x: number;
  y: number;
  rotate?: number;

  /** === 스냅/가이드 & 좌표계 === */
  snappable?: boolean | string[]; // ResizeContainer와 동일 시그니처
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;

  /** 캔버스 좌표계/줌/루트 컨테이너 */
  zoom?: number;
  containerEl?: HTMLElement | null;

  /** === Moveable 이벤트 === */
  onResizeStart?: (e: any) => void;
  onResize?: (e: any) => void;
  onResizeEnd?: (e: any) => void;

  onDragStart?: (e: any) => void;
  onDrag?: (e: any) => void;
  onDragEnd?: (e: any) => void;

  onRotateStart?: (e: any) => void;
  onRotate?: (e: any) => void;
  onRotateEnd?: (e: any) => void;
}

const Box = React.forwardRef<HTMLDivElement, ResizeBoxProps>(function Box(
  {
    id,

    /** Selection */
    active,
    onActiveChange,
    defaultActive,

    /** 동작 옵션 */
    resizable,
    draggable,
    rotatable,
    throttleResize,

    /** 레이아웃 */
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    width,
    height,
    x,
    y,
    rotate,

    /** 스냅/좌표계 */
    snappable,
    snapGridWidth,
    snapGridHeight,
    elementGuidelines,
    zoom = 1,
    containerEl,

    /** Moveable 이벤트 */
    onResizeStart,
    onResize,
    onResizeEnd,
    onDragStart,
    onDrag,
    onDragEnd,
    onRotateStart,
    onRotate,
    onRotateEnd,

    /** 디자인 시스템 박스 props + children */
    children,
    ...props
  },
  ref,
) {
  return (
    <ResizeContainer
      id={id}
      /* Selection */
      active={active}
      onActiveChange={onActiveChange}
      defaultActive={defaultActive}
      /* 동작 옵션 */
      resizable={resizable}
      draggable={draggable}
      rotatable={rotatable}
      throttleResize={throttleResize}
      /* 레이아웃 */
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      width={width}
      height={height}
      x={x}
      y={y}
      rotate={rotate}
      /* 스냅/좌표계 */
      snappable={snappable}
      snapGridWidth={snapGridWidth}
      snapGridHeight={snapGridHeight}
      elementGuidelines={elementGuidelines}
      zoom={zoom}
      containerEl={containerEl}
      /* 이벤트 */
      onResizeStart={onResizeStart}
      onResize={onResize}
      onResizeEnd={onResizeEnd}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onRotateStart={onRotateStart}
      onRotate={onRotate}
      onRotateEnd={onRotateEnd}
    >
      {/* 내부 콘텐츠는 100% 채우도록: ResizeContainer가 크기를 지배합니다 */}
      <DsBox ref={ref} width="100%" height="100%" {...props}>
        {children}
      </DsBox>
    </ResizeContainer>
  );
});

export default Box;
