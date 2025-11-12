// src/shared/store/resize.ts
import { create } from "zustand";

export interface ResizeItem {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotate?: number; // ✅ 추가: 회전값
}

interface State {
  id: string;
  resize: Record<string, ResizeItem>;
  setId: (id: string) => void;
  setResize: (id: string, item: ResizeItem) => void; // 전체 스냅샷 저장
  patchResize: (id: string, patch: Partial<ResizeItem>) => void; // 부분 갱신 (선택)
  removeResize: (id: string) => void;
}

const useResizeStore = create<State>(set => ({
  id: "",
  resize: {},

  setId: (id: string) => set({ id }),

  // 전체 스냅샷 저장 (width/height/x/y/rotate 모두 포함해서 넣어주세요)
  setResize: (id: string, item: ResizeItem) =>
    set(state => ({
      resize: { ...state.resize, [id]: { ...item } },
    })),

  // 선택: 필요한 필드만 부분 갱신할 때 사용
  patchResize: (id: string, patch: Partial<ResizeItem>) =>
    set(state => ({
      resize: {
        ...state.resize,
        [id]: { ...(state.resize[id] ?? {}), ...patch },
      },
    })),

  removeResize: (id: string) =>
    set(state => {
      const { [id]: _removed, ...resize } = state.resize;
      return { resize };
    }),
}));

export default useResizeStore;
