import { create } from "zustand";

interface State {
  idx: number;
  dialogIdx: number;

  setIdx: (idx: number) => void;
  setDialogIdx: (dialogIdx: number) => void;
}

const useIdxStore = create<State>(set => ({
  idx: 0,
  dialogIdx: 0,

  setIdx: (idx: number) => set({ idx }),
  setDialogIdx: (dialogIdx: number) => set({ dialogIdx }),
}));

export default useIdxStore;
