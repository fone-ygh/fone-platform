import { create } from "zustand";

interface State {
  idx: number;

  setIdx: (idx: number) => void;
}

const useIdxStore = create<State>(set => ({
  idx: 0,

  setIdx: (idx: number) => set({ idx }),
}));

export default useIdxStore;
