// src/shared/store/frame/defaults.ts
import type { FrameSizes, Size, ViewportSize } from "./types";

/** clamp 유틸 */
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/**
 * “사용자가 조절하는 값” 기준 제한
 * - header: height
 * - nav: width
 * - mdi: height
 * - content: derived(직접 조절 X 권장)
 */
export const FRAME_LIMITS = {
  headerH: { min: 40, max: 120 },
  navW: { min: 180, max: 520 },
  mdiH: { min: 0, max: 80 },
} as const;

/** 기본값(입력값 중심) */
export const DEFAULT_FRAME_SIZES: FrameSizes = {
  header: { width: 0, height: 56 },
  nav: { width: 240, height: 0 },
  mdi: { width: 0, height: 40 },
  content: { width: 0, height: 0 },
};

/** 입력값 clamp (width/height 중 “의미 있는 축”만 clamp) */
export function clampFrameInputs(sizes: FrameSizes): FrameSizes {
  return {
    ...sizes,
    header: {
      ...sizes.header,
      height: clamp(
        sizes.header.height,
        FRAME_LIMITS.headerH.min,
        FRAME_LIMITS.headerH.max,
      ),
    },
    nav: {
      ...sizes.nav,
      width: clamp(
        sizes.nav.width,
        FRAME_LIMITS.navW.min,
        FRAME_LIMITS.navW.max,
      ),
    },
    mdi: {
      ...sizes.mdi,
      height: clamp(
        sizes.mdi.height,
        FRAME_LIMITS.mdiH.min,
        FRAME_LIMITS.mdiH.max,
      ),
    },
  };
}

/**
 * viewport + 입력값(headerH/navW/mdiH)로
 * header/nav/mdi/content의 최종 Size를 계산
 *
 * 가정(가장 흔한 admin shell):
 * - header: viewport 전체 너비를 가짐
 * - nav: header 아래부터 바닥까지(높이 = viewportH - headerH)
 * - mdi: header 아래에 위치하고, nav 오른쪽 영역에 위치(너비 = viewportW - navW)
 * - content: mdi 아래, nav 오른쪽 영역(너비 = viewportW - navW, 높이 = viewportH - headerH - mdiH)
 */
export function deriveFrameSizes(
  viewport: ViewportSize,
  raw: FrameSizes,
): FrameSizes {
  const sizes = clampFrameInputs(raw);

  const headerH = sizes.header.height;
  const navW = sizes.nav.width;
  const mdiH = sizes.mdi.height;

  const header: Size = {
    width: Math.max(0, viewport.width),
    height: headerH,
  };

  const nav: Size = {
    width: navW,
    height: Math.max(0, viewport.height - headerH),
  };

  const mdi: Size = {
    width: Math.max(0, viewport.width - navW),
    height: mdiH,
  };

  const content: Size = {
    width: Math.max(0, viewport.width - navW),
    height: Math.max(0, viewport.height - headerH - mdiH),
  };

  return { header, nav, mdi, content };
}
