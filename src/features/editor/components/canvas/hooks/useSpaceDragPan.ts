// src/features/editor/components/canvas/hooks/useSpaceDragPan.ts
import { useCallback, useEffect, useRef, useState } from "react";

type SetPan = (x: number, y: number) => void;

function isTypingTarget(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    el.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export function useSpaceDragPan(opts: {
  zoom: number;
  panX: number;
  panY: number;
  setPan: SetPan;
  compensateZoom?: boolean; // true면 줌 배율과 무관하게 '화면 픽셀'만큼 이동
}) {
  const { zoom, panX, panY, setPan, compensateZoom = true } = opts;

  const [isSpace, setIsSpace] = useState(false);
  const isSpaceRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isTypingTarget()) return;
      if (!isSpaceRef.current) {
        isSpaceRef.current = true;
        setIsSpace(true);
      }
      e.preventDefault(); // 페이지 스크롤 방지
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      isSpaceRef.current = false;
      setIsSpace(false);
      setIsPanning(false);
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);

  const onMouseDownCapture = useCallback(
    (e: React.MouseEvent) => {
      if (!isSpaceRef.current) return;
      if (e.button !== 0) return; // 좌클릭만
      e.preventDefault();
      e.stopPropagation(); // 자식(Box/Moveable) 이벤트 차단
      setIsPanning(true);
      mouseStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { x: panX, y: panY };
    },
    [panX, panY],
  );

  const handlePanMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !mouseStartRef.current || !panStartRef.current)
        return false;
      const dx = e.clientX - mouseStartRef.current.x;
      const dy = e.clientY - mouseStartRef.current.y;

      // compensateZoom=true면 화면 픽셀 그대로, 아니면 논리 좌표로
      if (compensateZoom) {
        setPan(panStartRef.current.x + dx, panStartRef.current.y + dy);
      } else {
        setPan(
          panStartRef.current.x + dx / zoom,
          panStartRef.current.y + dy / zoom,
        );
      }
      return true;
    },
    [isPanning, compensateZoom, setPan, zoom],
  );

  const onMouseUp = useCallback(() => {
    if (!isPanning) return;
    setIsPanning(false);
    mouseStartRef.current = null;
    panStartRef.current = null;
  }, [isPanning]);

  const cursor = isPanning ? "grabbing" : isSpace ? "grab" : "default";

  return {
    isSpace,
    isPanning,
    cursor,
    onMouseDownCapture,
    handlePanMouseMove,
    onMouseUp,
  };
}
