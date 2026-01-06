import { create } from "zustand";

import { RadioData } from "@/features/componentManagement/store/component";

interface State {
  selectedData: RadioData;

  setSelectedData: (selectedData: RadioData) => void;
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
    dataType: "",
    dataSourceCd: "",
    dataSourceNm: "",
  },

  setSelectedData: (selectedData: RadioData) =>
    set({ selectedData: selectedData }),
}));

export default useDataStore;
