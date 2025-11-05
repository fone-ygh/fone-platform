import { Column, ColumnGroup } from "react-data-grid";

interface Row {
    id: number;
    name: string;
    value: string;
    value2: string;
    value3: string;
    value4: string;
    value5: string;
    dataType?: string;
}

type ColumnType = {
    dataType?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox";
}


type ColumnOrColumnGroup<R, SR = unknown> = 
    Column<R, SR> & ColumnType |
    ColumnGroup<R, SR> & {children: ColumnOrColumnGroup<R, SR>[]};
  
interface TableProps {
    rows: Row[];
    columns: ColumnOrColumnGroup<Row, unknown>[];
    headerHeight?: number;

}