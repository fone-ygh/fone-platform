import { create } from "zustand";

interface State {
  dataType: string;
  groupCode: string;
  groupName: string;
  selectedGroupCode: string;
  selectedGroupName: string;

  setDataType: (dataType: string) => void;
  setGroupCode: (groupCode: string) => void;
  setGroupName: (groupName: string) => void;
  setSelectedGroupCode: (groupCode: string) => void;
  setSelectedGroupName: (groupName: string) => void;
}

const useCodeTypeStore = create<State>(set => ({
  dataType: "",
  groupCode: "",
  groupName: "",
  selectedGroupCode: "",
  selectedGroupName: "",

  setDataType: (dataType: string) => set({ dataType }),
  setGroupCode: (groupCode: string) => set({ groupCode }),
  setGroupName: (groupName: string) => set({ groupName }),
  setSelectedGroupCode: (groupCode: string) =>
    set({ selectedGroupCode: groupCode }),
  setSelectedGroupName: (groupName: string) =>
    set({ selectedGroupName: groupName }),
}));

export default useCodeTypeStore;
