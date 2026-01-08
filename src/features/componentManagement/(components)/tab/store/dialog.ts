import { create } from "zustand";

interface State {
  isStyleOpen: boolean;
  isDataOpen: boolean;

  setIsStyleOpen: (isStyleOpen: boolean) => void;
  setIsDataOpen: (isDataOpen: boolean) => void;
}

const useDialogStore = create<State>(set => ({
  isStyleOpen: false,
  isDataOpen: false,

  setIsStyleOpen: (isStyleOpen: boolean) => set({ isStyleOpen }),
  setIsDataOpen: (isDataOpen: boolean) => set({ isDataOpen }),
}));

export default useDialogStore;
