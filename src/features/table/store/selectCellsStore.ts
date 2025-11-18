import { create } from "zustand";
import { persist } from "@/shared/lib/store-util";
import { immer } from "zustand/middleware/immer";
import { cloneDeep, omitBy, includes } from "lodash-es";
import { CustomColumn } from "../interface/type";

export interface SelectCellsStore<T> {
    selectCells: { 
        col: number; 
        row: number; 
        id: string; 
        value?: string;
        rowData?:T;
        columnData?:CustomColumn<T>;
        type?:CustomColumn<T>['type'];
    }[];
    actions: {
        setSelectCells: (selectCells: SelectCellsStore<T>["selectCells"]) => void;
    }
}

// defaultValue에서 actions 객체의 함수를 굳이 더미로 정의할 필요 없이,
// 실제 초기 데이터(selectCells)만 관리하도록 한다.
// actions는 store 생성시 실제 구현체로 채워진다.
const defaultValue: Pick<SelectCellsStore<any>, 'selectCells'> = {
    selectCells: [],
};

// actions 타입을 SelectCellsStore에 명확히 선언해주고,
// actions 객체 내부의 함수들을 구체적으로 정의해야 한다.

interface SelectCellsActions<T> {
    setSelectCells: (selectCells: SelectCellsStore<T>["selectCells"]) => void;
}

export const useSelectCellsStore = create<SelectCellsStore<any> & { actions: SelectCellsActions<any> }>()(
    persist(
        immer((set) => ({
            ...cloneDeep(defaultValue),
            actions: {
                setSelectCells: (selectCells) => set({ selectCells }),
            }
        })),
        {
            name: "selectCells",
            partialize: state =>
                omitBy(state, (_v, key) =>
                    includes(['actions', 'selectCells'], key)
                )
        }
    )
);

// actions를 따로 export (hooks로 반환)
export const useSelectCellsActions = () => useSelectCellsStore(state => state.actions);
