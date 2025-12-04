import { create } from "zustand";

interface State {
  groupCode: string;
  groupName: string;
  selectedGroupCode: string;
  selectedGroupName: string;

  setGroupCode: (groupCode: string) => void;
  setGroupName: (groupName: string) => void;
  setSelectedGroupCode: (groupCode: string) => void;
  setSelectedGroupName: (groupName: string) => void;
}

const useCodeTypeStore = create<State>(set => ({
  groupCode: "",
  groupName: "",
  selectedGroupCode: "",
  selectedGroupName: "",

  setGroupCode: (groupCode: string) => set({ groupCode }),
  setGroupName: (groupName: string) => set({ groupName }),
  setSelectedGroupCode: (groupCode: string) =>
    set({ selectedGroupCode: groupCode }),
  setSelectedGroupName: (groupName: string) =>
    set({ selectedGroupName: groupName }),
}));

export default useCodeTypeStore;
