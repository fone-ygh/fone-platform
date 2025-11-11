import type { Frame, LayoutState, SectionItem } from "./types";

/** 현재 활성 브레이크포인트 id */
export function getActiveBp(state: LayoutState) {
  return state.activeBp || "base";
}

/** 해당 BP 기준의 캔버스 너비 */
export function getCanvasWidthForBp(state: LayoutState, bpId: string) {
  const b = (state.breakpoints || []).find(b => b.id === bpId);
  return b?.width ?? state.canvasWidth;
}

/** base 프레임에서 비율로 상속 */
export function inheritFrameFromBase(
  s: SectionItem,
  state: LayoutState,
  bpId: string,
): Frame {
  const baseW = getCanvasWidthForBp(state, "base");
  const bpW = getCanvasWidthForBp(state, bpId);
  const r = bpW / baseW;
  return {
    x: Math.round(s.x * r),
    y: s.y,
    width: Math.round(s.width * r),
    height: s.height,
    rotate: s.rotate ?? 0,
  };
}

/** 읽기: 없으면 상속 규칙 적용 */
export function readFrame(
  s: SectionItem,
  state: LayoutState,
  bpId: string,
): Frame {
  const fr = s.frames?.[bpId];
  if (fr) return { ...fr };
  if (state.responsive?.inheritScale && bpId !== "base")
    return inheritFrameFromBase(s, state, bpId);
  return {
    x: s.x,
    y: s.y,
    width: s.width,
    height: s.height,
    rotate: s.rotate ?? 0,
  };
}

/** 쓰기: frames에 저장 */
export function writeFrame(
  s: SectionItem,
  bpId: string,
  frame: Frame,
): SectionItem {
  const frames = { ...(s.frames || {}) };
  frames[bpId] = { ...frame };
  return { ...s, frames };
}

/** 활성 BP의 프레임을 top-level(x,y,w,h,rotate)로 반영 */
export function applyActiveFramesToTopLevel(state: LayoutState): LayoutState {
  const bpId = getActiveBp(state);
  const cw = getCanvasWidthForBp(state, bpId);
  return {
    ...state,
    canvasWidth: cw,
    sections: state.sections.map(s => {
      const fr = readFrame(s, state, bpId);
      return {
        ...s,
        x: fr.x,
        y: fr.y,
        width: fr.width,
        height: fr.height,
        rotate: fr.rotate ?? s.rotate,
      };
    }),
  };
}
