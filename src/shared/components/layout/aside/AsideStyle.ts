import styled from "@emotion/styled";

export const AsideStyle = styled.aside`
  /* ---- Flat sidebar tokens ---- */
  --as-bg: #ffffff;
  --as-bd: #e6edf5; /* 선명한 경계 */
  --as-radius: 12px;
  --as-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  --as-pad: 12px;
  --as-gap: 12px;

  /* 중앙 영역과의 시각적 분리선 */
  --as-sep: #dfe6f2; /* hairline */
  --as-accent-color: #c7d2fe;

  position: relative; /* ::before/::after 분리선용 */
  flex-shrink: 0;
  background: var(--as-bg);
  border: 1px solid var(--as-bd);
  border-radius: var(--as-radius);
  box-shadow:
    var(--as-shadow),
    0 1px 0 rgba(15, 23, 42, 0.03) inset; /* top hairline */

  width: 100%;
  overflow: hidden;

  /* max-width: clamp(260px, 18vw, 420px); */
  padding: var(--as-pad);

  /* 양쪽 에지에 hairline (영역 분리감 ↑) */
  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--as-sep);
    pointer-events: none;
  }
  &::before {
    left: -1px;
  }
  &::after {
    right: -1px;
  }

  /* 중앙과의 분리감을 방향성 섀도로 강화 */
  &[data-side="left"] {
    box-shadow:
      var(--as-shadow),
      8px 0 18px rgba(15, 23, 42, 0.06),
      0 1px 0 rgba(15, 23, 42, 0.03) inset;
  }

  /* 유리 느낌 (옵션) */
  &[data-glass="true"] {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: saturate(1.05) blur(6px);
    -webkit-backdrop-filter: saturate(1.05) blur(6px);
    border-color: #e9eef7;
    box-shadow:
      0 10px 28px rgba(15, 23, 42, 0.08),
      0 1px 0 rgba(15, 23, 42, 0.03) inset;
  }

  /* 톤 변형(플랫 유지) */
  &[data-variant="soft"] {
    --as-bd: #e6edf7;
  }
  &[data-variant="tinted"] {
    --as-bd: #dbeafe;
  }

  /* 상/하단 페이드(옵션) */
  &[data-fade="true"] {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black 20px,
      black calc(100% - 20px),
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black 20px,
      black calc(100% - 20px),
      transparent 100%
    );
  }

  /* 반응형 미세 조정 */
  @media (max-width: 1440px) {
    --as-gap: 10px;
    --as-pad: 10px;
  }
  @media (max-width: 1200px) {
    max-width: clamp(240px, 24vw, 360px);
  }

  .resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 8px; /* 드래그 잡는 영역(넉넉하게) */
    cursor: col-resize;
    opacity: 0; /* 기본은 숨김 */
    transition: opacity 0.15s ease;
    /* 시각용 선 */
  }
  &:hover .resize-handle,
  &[data-dragging="true"] .resize-handle {
    opacity: 1; /* hover/drag 시 보이게 */
  }

  /* 좌/우 사이드에 따라 핸들 붙는 엣지 선택 */
  .resize-handle[data-handle="left"] {
    left: -4px;
  } /* 약간 바깥으로 */
  .resize-handle[data-handle="right"] {
    right: -4px;
  }

  /* 얇은 가이드 라인(선) */
  .resize-handle::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--ds-border, #e5e7eb);
    opacity: 0.9;
    /* 핸들 중앙에 선 */
    left: 50%;
    transform: translateX(-50%);
  }

  /* 필요하면 드래그 중 outline 강조 */
  &[data-dragging="true"]::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    /* 드래그 중 사이드바 경계선 강조 (선택) */
    ${(p: any) => (p["data-side"] === "left" ? "right: 0;" : "left: 0;")}
    width: 2px;
    background: var(--ds-ring, rgba(0, 132, 254, 0.25));
  }
`;

export const AsideInnerStyle = styled.aside`
  height: 100%;
  overflow-y: auto;

  /* 얇은 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: #c5d3e8 transparent;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c5d3e8;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;
