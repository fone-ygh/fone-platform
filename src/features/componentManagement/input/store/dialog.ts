import { create } from "zustand";

interface State {
  isOpen: boolean;

  setIsOpen: (isOpen: boolean) => void;
}

const useDialogStore = create<State>(set => ({
  isOpen: false,

  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export default useDialogStore;
