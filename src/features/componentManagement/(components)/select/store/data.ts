import { create } from "zustand";

interface SelectData {
  crud?: string;
  componentId: string;
  name: string;
  label: string;
  style: string;
  required: string;
  all: string;
  dataType: string;
  dataSourceCd: string;
  dataSourceNm: string;
}

interface State {
  selectedData: SelectData;

  setSelectedData: (selectedData: SelectData) => void;
}

const useDataStore = create<State>(set => ({
  selectedData: {
    componentId: "",
    name: "",
    label: "",
    style: "",
    required: "",
    all: "",
    dataType: "",
    dataSourceCd: "",
    dataSourceNm: "",
  },

  setSelectedData: (selectedData: SelectData) =>
    set({ selectedData: selectedData }),
}));

export default useDataStore;
