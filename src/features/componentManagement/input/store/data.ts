import { create } from "zustand";

import { InputData } from "@/features/componentManagement/store/component";

interface State {
  selectedData: InputData;

  setSelectedData: (selectedData: InputData) => void;
}

const useDataStore = create<State>(set => ({
  selectedData: {
    componentId: "",
    name: "",
    title: "",
    style: {
      width: "",
      icon: null,
      iconPosition: "",
    },
    required: "",
    type: "",
    placeholder: "",
  },

  setSelectedData: (selectedData: InputData) =>
    set({ selectedData: selectedData }),
}));

export default useDataStore;
