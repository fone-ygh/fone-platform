import { create } from "zustand";

interface Search {
  name: string;
}

interface State {
  search: Search;

  setSearch: (search: Search) => void;
}

const useSearchStore = create<State>(set => ({
  search: { name: "" },

  setSearch: (search: Search) => set({ search }),
}));

export default useSearchStore;
