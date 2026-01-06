import { create } from "zustand";

interface CheckedRow {
  groupCode: string;
  groupName: string;
}

interface State {
  dataType: string;
  checkedRows: CheckedRow[];
  selectedCheckedRows: CheckedRow[];

  setDataType: (dataType: string) => void;
  setCheckedRows: (checkedRows: CheckedRow[]) => void;
  setSelectedCheckedRows: (selectedCheckedRows: CheckedRow[]) => void;
}

const useCodeTypeStore = create<State>(set => ({
  dataType: "",
  checkedRows: [],
  selectedCheckedRows: [],

  setDataType: (dataType: string) => set({ dataType }),
  setCheckedRows: (checkedRows: CheckedRow[]) => set({ checkedRows }),
  setSelectedCheckedRows: (selectedCheckedRows: CheckedRow[]) =>
    set({ selectedCheckedRows }),
}));

export default useCodeTypeStore;
