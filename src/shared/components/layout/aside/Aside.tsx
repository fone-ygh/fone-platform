"use client";

import * as React from "react";

import { AsideStyle } from "./AsideStyle";

type Side = "left" | "right";

interface AsideProps {
  position: Side;
  /** 비제어 기본 너비(px) */
  defaultWidth?: number;
  /** 제어 모드 너비(px) */
  width?: number;
  /** 최소/최대 너비(px) */
  minWidth?: number;
  maxWidth?: number;
  /** 제어 모드 콜백 */
  onWidthChange?: (w: number) => void;
  children?: React.ReactNode;
}

export default function Aside({
  position,
  defaultWidth = 320,
  width,
  minWidth = 0,
  maxWidth = 640,
  onWidthChange,
  children,
}: AsideProps) {
  // 실제 DOM을 가리키는 ref (사이드바 전체)
  const ref = React.useRef<HTMLDivElement | null>(null);

  // 내부에서만 쓰는 너비 상태 (비제어 모드용)
  const [internal, setInternal] = React.useState(defaultWidth);

  // 지금 드래그 중인지 상태
  const [dragging, setDragging] = React.useState(false);

  // 실제로 사용할 너비 값
  // - 외부에서 width prop을 주면 그걸 사용 (Controlled)
  // - 아니면 internal state 사용 (Uncontrolled)
  const w = width ?? internal; // 제어/비제어 공용 값

  // min~max 범위 안으로 숫자를 잘라주는 함수
  // n이 너무 작으면 minWidth, 너무 크면 maxWidth로 잘라준다.
  const clamp = (n: number) => Math.min(maxWidth, Math.max(minWidth, n));

  // 너비를 바꾸는 함수 (클램프 + 외부 알림 + 내부 상태 갱신)
  const setW = (next: number) => {
    const c = clamp(next);

    // 밖에 알려주기 (부모에서 상태 관리하는 경우)
    onWidthChange?.(c);

    // width prop이 없으면 내부 상태 업데이트
    if (width == null) setInternal(c);
  };

  // 핸들 위치(시각/사용감): left면 오른쪽 엣지, right면 왼쪽 엣지
  const handleSide: "left" | "right" = position === "left" ? "right" : "left";

  // 리사이즈 계산: aside 경계 기준
  const computeWidth = React.useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    (clientX: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      let next: number;
      if (position === "left") {
        // 왼쪽 사이드바: 왼쪽 경계~마우스 X 거리 = 새 너비
        next = clientX - rect.left;
      } else {
        // 오른쪽 사이드바: 마우스 X~오른쪽 경계 거리 = 새 너비
        next = rect.right - clientX;
      }
      setW(next);
    },
    [position],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    console.log(e);
    // 특정 포인터 캡처 → 문서 밖으로 벗어나도 이벤트 계속 받음
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    // 즉시 한 번 계산(클릭 위치 기준)
    computeWidth(e.clientX);
    // 드래그 중 커서/선택 제어(UX)
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    computeWidth(e.clientX);
  };

  const stopDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  return (
    <AsideStyle
      ref={ref}
      data-side={position}
      data-dragging={dragging ? "true" : "false"}
      style={{ width: `${w}px`, overflowX: "hidden" }}
    >
      {/* 콘텐츠 */}
      {children}

      {/* 리사이즈 핸들: hover 시 나타나는 세로선 + 드래그 영역 */}
      <div
        className="resize-handle"
        data-handle={handleSide}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      />
    </AsideStyle>
  );
}
