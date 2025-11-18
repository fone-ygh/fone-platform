import { create } from "zustand";
import { MergedRange, MergeCellsStore } from "../interface/type";
import { persist } from "@/shared/lib/store-util";
import { immer } from "zustand/middleware/immer";
import { cloneDeep, omitBy, includes } from "lodash-es";

const defaultValue: Pick<MergeCellsStore, 'mergedRanges'> = {
    mergedRanges: [],
};

interface MergeCellsActions {
    setMergedRanges: (mergedRanges: MergeCellsStore["mergedRanges"]) => void;
}

export const useMergeCellsStore = create<MergeCellsStore & { actions: MergeCellsActions }>()(
    persist(
        immer((set) => ({
            ...cloneDeep(defaultValue),
            actions: {
                setMergedRanges: (mergedRanges) => set({ mergedRanges }),
            }
        })),
        {
            name: "mergedRanges",
            partialize: state =>
                omitBy(state, (_v, key) =>
                    includes(['actions', 'mergedRanges'], key)
                )
        }
    )
);



export const useMergeCellsActions = () => useMergeCellsStore(state => state.actions);

export const isInAnyMergedRange = (mergedRanges: MergedRange[], rowIdx: number, colIdx: number) => {
    return mergedRanges.some(({ range }) => rowIdx >= range.startRow && rowIdx <= range.endRow && colIdx >= range.startCol && colIdx <= range.endCol);
};

export const isTopLeftOfMergedRange = (mergedRanges: MergedRange[], rowIdx: number, colIdx: number) => {
    return mergedRanges.some(({ range }) => rowIdx === range.startRow && colIdx === range.startCol);
};
