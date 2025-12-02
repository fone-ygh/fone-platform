export interface TableSettingStore {
    checkbox: boolean;
    noDisplay: boolean;
    paginationDisplay: boolean;
    totalDisplay: boolean;
    plusButtonDisplay: boolean;
    selectedCellAddress?: string;
    formData: FormData;
    headerCellPropsList: HeaderCellConfig[];
    selectedPos: { col: number; row: number } | null;
    title?: string;
}

export type FormData = {
    accessorKey: string;
    header: string;
    type: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox";
    editable: boolean;
    width: number | string;
    draggable: boolean;
    resizable: boolean;
    required: boolean;
    selectItems?: any[];
    align: "left" | "center" | "right";
    isParent?: boolean; // 부모 셀인지 여부 (true: 부모 셀, false: 자식 셀)
};

export type HeaderCellProps = {
    accessorKey?: string;
    header?: string;
    type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox";
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
    col: number;
    row: number;
    props: Partial<HeaderCellProps>;
};

