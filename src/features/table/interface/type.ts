export interface TableSettingStore {
    checkbox: boolean;
    noDisplay: boolean;
    paginationDisplay: boolean;
    totalDisplay: boolean;
    plusButtonDisplay: boolean;
    selectedCellAddress?: string;
    formData: FormData;
    headerCellPropsList: HeaderCellConfig[];
    selectedPos: { startCol: number; startRow: number; endCol: number; endRow: number } | null;
    title?: string;
    tableHeaders: ColumnNode[];
    demoTableOpen: boolean;
    editModeData?: {
        data: string[][];
        mergeData: {
            [key: string]: [number, number];
        };
        minDimensions: [number, number];
    };
}

import type { ReactNode } from "react";

export type FormData = {
    accessorKey: string;
    header: string;
    type: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox" | "datePicker";
    editable: boolean;
    width?: number | string;
    draggable?: boolean;
    resizable?: boolean;
    required: boolean;
    selectItems?: any[];
    align: "left" | "center" | "right";
    isParent?: boolean; // 부모 셀인지 여부 (true: 부모 셀, false: 자식 셀)
    
};

export type HeaderCellProps = {
    accessorKey?: string;
    header?: string;
    type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox" | "datePicker";
    editable?: boolean;
    width?: number | string;
    draggable?: boolean;
    resizable?: boolean;
    align?: "left" | "center" | "right";
    required?: boolean;
    selectItems?: {label:string, value:string}[];
    isParent?: boolean; // 부모 셀인지 여부 (true: 부모 셀, false: 자식 셀)
};

export type HeaderCellConfig = {
    address: string; // e.g. A1
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
    props: Partial<HeaderCellProps>;
};

export type ColumnNode = {
    accessorKey?: string;
    key: string;
    header?: string;
    name?: string;
    type?:
        | "input"
        | "number"
        | "button"
        | "date"
        | "select"
        | "radio"
        | "checkbox"
        | "custom";
	component?: ReactNode;
    children?: ColumnNode[];
    editable?: boolean;
    width?: number | string;
    draggable?: boolean;
    resizable?: boolean;
    align?: "left" | "center" | "right";
    required?: boolean;
    selectItems?: any[];
    columns?: ColumnNode[];
    role?: "group" | "leaf";
    disabled?: boolean;
    readonly?: boolean;
};

