import { create } from "zustand";

interface ResizeItem {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

interface State {
  id: string;
  resize: Record<string, ResizeItem>;
  setId: (id: string) => void;
  setResize: (id: string, item: ResizeItem) => void;
  removeResize: (id: string) => void;
}

const useResizeStore = create<State>(set => ({
  id: "",
  resize: {},

  setId: (id: string) => set({ id }),
  setResize: (id: string, item: ResizeItem) =>
    set(state => ({
      resize: { ...state.resize, [id]: item },
    })),

  removeResize: (id: string) =>
    set(state => {
      const { [id]: removed, ...resize } = state.resize;
      return { resize };
    }),
}));

export default useResizeStore;
