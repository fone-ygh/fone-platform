import { create } from "zustand";

interface State {
  isOpen: boolean;
  isStyleOpen: boolean;

  setIsOpen: (isOpen: boolean) => void;
  setIsStyleOpen: (isStyleOpen: boolean) => void;
}

const useDialogStore = create<State>(set => ({
  isOpen: false,
  isStyleOpen: false,

  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  setIsStyleOpen: (isStyleOpen: boolean) => set({ isStyleOpen }),
}));

export default useDialogStore;
