import { ReactNode, useEffect, useState } from "react";
import styled from "@emotion/styled";
import Moveable from "react-moveable";

import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import useResizeStore from "@/shared/store/resize";

interface Props {
  id?: string;
  resizable?: boolean;
  draggable?: boolean;
  throttleResize?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  children: ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  renderDirections: string[];
}

export default function ResizeContainer({
  id = "",
  children,
  resizable,
  draggable,
  throttleResize,
  renderDirections,
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,
  width: propWidth,
  height: propHeight,
  x: propX = 0,
  y: propY = 0,
}: Props) {
  const moveableRef = useOutsideClick(() => setActive(false));

  const [active, setActive] = useState(false);

  const { resize, setResize, setId } = useResizeStore();

  const width = resize[id]?.width ?? propWidth;
  const height = resize[id]?.height ?? propHeight;
  const x = resize[id]?.x ?? propX ?? 0;
  const y = resize[id]?.y ?? propY ?? 0;

  useEffect(() => {
    setResize(id, {
      width: propWidth || 0,
      height: propHeight || 0,
      x: propX || 0,
      y: propY || 0,
    });
    setId(id);
  }, [id]);

  return (
    <>
      {active && (
        <Moveable
          target={moveableRef.current}
          resizable={resizable}
          draggable={draggable}
          throttleResize={throttleResize}
          renderDirections={renderDirections}
          onResize={e => {
            const width = Math.max(minWidth, Math.min(e.width, maxWidth));
            const height = Math.max(minHeight, Math.min(e.height, maxHeight));
            e.target.style.width = `${width}px`;
            e.target.style.height = `${height}px`;
          }}
          onResizeEnd={e => {
            setResize(id, {
              width: e.lastEvent.width,
              height: e.lastEvent.height,
              x,
              y,
            });
          }}
          onDrag={e => {
            e.target.style.left = `${e.left}px`;
            e.target.style.top = `${e.top}px`;
          }}
          onDragEnd={e => {
            setResize(id, {
              width,
              height,
              x: e.lastEvent?.left ?? x,
              y: e.lastEvent?.top ?? y,
            });
          }}
        />
      )}
      <StyledContainer
        ref={moveableRef}
        onClick={() => setActive(true)}
        width={width || "auto"}
        height={height || "auto"}
        x={x}
        y={y}
        draggable={draggable}
      >
        {children}
      </StyledContainer>
    </>
  );
}

interface StyledContainerProps {
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  draggable?: boolean;
}

const StyledContainer = styled.div<StyledContainerProps>`
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === "number" ? `${height}px` : height};
  position: ${({ draggable }) => (draggable ? "absolute" : "static")};
  left: ${({ x }) => `${x}px`};
  top: ${({ y }) => `${y}px`};
`;
