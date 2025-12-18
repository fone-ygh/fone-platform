import { create } from "zustand";

export interface StyleData {
  width: string;
  color: string;
  variant: "contained" | "outlined" | "text" | undefined;
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
  data: Data[];
  selectedData: Data;

  setData: (Data: Data[]) => void;
  setSelectedData: (selectedData: Data) => void;
}

const useDataStore = create<State>(set => ({
  data: [
    {
      componentId: "search",
      name: "조회",
      title: "조회",
      style: {
        width: "200",
        color: "#1976d2",
        variant: "contained",
        icon: null,
        iconPosition: "",
      },
      function: "01",
    },
    {
      componentId: "popup",
      name: "팝업",
      title: "팝업",
      style: {
        width: "200",
        color: "#dc004e",
        variant: "outlined",
        icon: null,
        iconPosition: "",
      },
      function: "02",
    },
  ],

  selectedData: {
    componentId: "",
    name: "",
    title: "",
    style: {
      width: "",
      color: "",
      variant: undefined,
      icon: null,
      iconPosition: "",
    },
    function: "",
  },

  setData: (data: Data[]) => set({ data: data }),
  setSelectedData: (selectedData: Data) => set({ selectedData: selectedData }),
}));

export default useDataStore;
