import { create } from "zustand";

export const useJspreadSheetStore = create<{
    spreadsheet: any | null;
} & { actions: {
    setSpreadsheet: (spreadsheet: any) => void;
} }>((set, get) => ({
    spreadsheet: null,
    actions: {
        setSpreadsheet: (spreadsheet) => set({ spreadsheet }),
    }
}));

export const useJspreadSheetActions = () => useJspreadSheetStore(state => state.actions);