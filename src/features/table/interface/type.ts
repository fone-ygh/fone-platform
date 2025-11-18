import { CalculatedColumn, Column, ColumnGroup, RenderCellProps, RenderEditCellProps } from "react-data-grid";

interface Row {
    id: number;
    name: string;
    value: string;
    value2: string;
    value3: string;
    value4: string;
    value5: string;
}

export type CustomColumn<T> = Column<T, unknown> & {
    type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox";
};


export type CustomColumnOrColumnGroup<R, SR = unknown> = CustomColumn<R> | ColumnGroup<R, SR> & {children: CustomColumnOrColumnGroup<R, SR>[]};
  
export interface TableProps <T>{
    rows: T[];
    columns: CustomColumnOrColumnGroup<T, unknown>[];
    headerHeight?: number;

}

export type CustomCalculatedColumn<TRow, TSummaryRow = unknown> = CalculatedColumn<TRow, TSummaryRow> & {
    type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox";
};

export type CustomRenderCellProps<TRow, TSummaryRow = unknown> = 
    Omit<RenderCellProps<TRow, TSummaryRow>, "column"> & {
        column: CustomCalculatedColumn<TRow>;
    };

export type CustomRenderEditCellProps<TRow, TSummaryRow = unknown> = 
    Omit<RenderEditCellProps<TRow, TSummaryRow>, "column"> & {
        column: CustomCalculatedColumn<TRow, TSummaryRow>;
    };


export interface MergedRange {
    id: string;
    mergeCellId: string;
    range: { startRow: number; endRow: number; startCol: number; endCol: number };
    value?: string;
    editMode?: boolean;
}

export interface MergeCellsStore {
    mergedRanges: MergedRange[];
    actions: {
        setMergedRanges: (mergedRanges: MergedRange[]) => void;
    }
}