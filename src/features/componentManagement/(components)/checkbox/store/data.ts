import { create } from "zustand";

import { CheckboxData } from "@/features/componentManagement/store/component";

interface State {
  selectedData: CheckboxData;

  setSelectedData: (selectedData: CheckboxData) => void;
}

const useDataStore = create<State>(set => ({
  selectedData: {
    componentId: "",
    name: "",
    title: "",
    style: {
      color: "",
    },
    required: "",
    defaultChecked: "N",
  },

  setSelectedData: (selectedData: CheckboxData) =>
    set({ selectedData: selectedData }),
}));

export default useDataStore;
