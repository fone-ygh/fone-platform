import { create } from "zustand";

interface StyleData {
  width: string;
  color: string;
  variant: "contained" | "outlined" | "text" | "";
  icon: File | null;
  iconPosition: string;
}

interface Data {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: StyleData;
  function: string;
}

interface State {
  selectedData: Data;

  setSelectedData: (selectedData: Data) => void;
}

const useDataStore = create<State>(set => ({
  selectedData: {
    componentId: "",
    name: "",
    title: "",
    style: {
      width: "",
      color: "",
      variant: "",
      icon: null,
      iconPosition: "",
    },
    function: "",
  },

  setSelectedData: (selectedData: Data) => set({ selectedData: selectedData }),
}));

export default useDataStore;
