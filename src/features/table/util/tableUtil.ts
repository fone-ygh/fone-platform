import { ColumnGroup, ColumnOrColumnGroup } from "react-data-grid";

export const flattenColumns = <T>(cols: ColumnOrColumnGroup<T, unknown>[], parentKey?:string): ColumnOrColumnGroup<T, unknown>[] => {
    return cols.reduce((acc: ColumnOrColumnGroup<T , unknown>[], col: ColumnOrColumnGroup<T , unknown>) => {
        if ((col as ColumnGroup<T, unknown>).children && Array.isArray((col as ColumnGroup<T, unknown>).children) && (col as ColumnGroup<T, unknown>).children.length > 0) {
            // 타입 오류 해결: 반환 타입을 명확하게 지정해주고, flattenColumns의 반환 타입도 일치하도록 한다.
            return acc.concat(
                flattenColumns<T>(
                    (col as ColumnGroup<T, unknown>).children as ColumnOrColumnGroup<T, unknown>[],
                    (col as any).key
                ) as ColumnOrColumnGroup<T, unknown>[]
            );
        } else {
            return acc.concat({ ...col, parentKey: parentKey } as unknown as ColumnOrColumnGroup<T, unknown>);
        }
    }, []);
};

export const getMaxDepth = <T>(columns: ColumnOrColumnGroup<T, unknown>[]): number => {
    let max = 1;
    for (const col of columns) {
        if ((col as ColumnGroup<T, unknown>).children && Array.isArray((col as ColumnGroup<T, unknown>).children) && (col as ColumnGroup<T, unknown>).children.length > 0) {
            max = Math.max(max, 1 + getMaxDepth<T>((col as ColumnGroup<T, unknown>).children as ColumnOrColumnGroup<T, unknown>[]));
        }
    }
    return max;
};