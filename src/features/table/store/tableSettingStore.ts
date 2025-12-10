import { create } from "zustand";
import { HeaderCellProps, TableSettingStore } from "../interface/type";
import { persist } from "@/shared/lib/store-util";
import { immer } from "zustand/middleware/immer";
import { cloneDeep, omitBy, includes } from "lodash-es";
import { FormData, HeaderCellConfig } from "../interface/type";

const defaultValue: Pick<TableSettingStore, 'checkbox' | 'noDisplay' | 'paginationDisplay' | 'totalDisplay' | 'plusButtonDisplay' | 'selectedCellAddress' | 'formData' | 'headerCellPropsList' | 'selectedPos' | 'title'> = {
    checkbox: false,
    noDisplay: false,
    paginationDisplay: false,
    totalDisplay: false,
    plusButtonDisplay: false,
    selectedCellAddress: undefined,
    formData: {
        accessorKey: "",
        header: "",
        type: "input",
        editable: true,
        required: false,
        align: "left",
        width: "",
        isParent: false, // 부모 셀인지 여부 (true: 부모 셀, false: 자식 셀)
    },
    headerCellPropsList: [],
    selectedPos:null,
    title: undefined,
};

interface TableSettingActions {
    setCheckbox: (checkbox: boolean) => void;
    setNoDisplay: (noDisplay: boolean) => void;
    setPaginationDisplay: (paginationDisplay: boolean) => void;
    setTotalDisplay: (totalDisplay: boolean) => void;
    setPlusButtonDisplay: (plusButtonDisplay: boolean) => void;
    setSelectedCellAddress: (selectedCellAddress: string) => void;
    setFormData: (formData: FormData) => void;
    setHeaderCellPropsList: (headerCellPropsList: HeaderCellConfig[]) => void;
    setSelectedPos: (selectedPos: { startCol: number, startRow: number, endCol: number, endRow: number } | null) => void;
    setTitle: (title: string) => void;
}

export const useTableSettingStore = create<TableSettingStore & { actions: TableSettingActions }>()(
    persist(
        immer((set) => ({
            ...cloneDeep(defaultValue),
            actions: {
                setCheckbox: (checkbox) => set({ checkbox }),
                setNoDisplay: (noDisplay) => set({ noDisplay }),
                setPaginationDisplay: (paginationDisplay) => set({ paginationDisplay }),
                setTotalDisplay: (totalDisplay) => set({ totalDisplay }),
                setPlusButtonDisplay: (plusButtonDisplay) => set({ plusButtonDisplay }),    
                setSelectedCellAddress: (selectedCellAddress) => set({ selectedCellAddress }),
                setFormData: (formData) => set({ formData }),
                setHeaderCellPropsList: (headerCellPropsList) => set({ headerCellPropsList }),
                setSelectedPos: (selectedPos) => set({ selectedPos }),
                setTitle: (title) => set({ title }),
            }
        })),
        {
            name: "tableSetting",
            partialize: state =>
                omitBy(state, (_v, key) =>
                    includes([
                        'actions', 
                        'checkbox', 
                        'noDisplay', 
                        'paginationDisplay', 
                        'totalDisplay', 
                        'plusButtonDisplay', 
                        'selectedPos',
                        'title',
                        'formData',
                        'headerCellPropsList',
                    ], key)
                )
        }
    )
);

export const useTableSettingActions = () => useTableSettingStore(state => state.actions);


export const getHeaderCellPropsListData = (address: string): HeaderCellConfig[] => {
    const { headerCellPropsList, selectedPos, formData } = useTableSettingStore.getState();
    const prev = headerCellPropsList ?? [];
    if (!selectedPos) return prev;
    console.log("formData : ", formData)
    const idx = prev.findIndex((x) => x.address === address);
    const next: HeaderCellConfig = {
        address,
        startCol: selectedPos.startCol,
        startRow: selectedPos.startRow,
        endCol: selectedPos.endCol,
        endRow: selectedPos.endRow,
        props: { ...formData },
    };
    if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
    }
    return [...prev, next];
}