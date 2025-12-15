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

// ------------------------------
// Table header builder utilities
// ------------------------------
import type { HeaderCellConfig, HeaderCellProps, ColumnNode } from "../interface/type";

export type MergeMap = Record<string, [number, number]>; // [colspan, rowspan]

export function colIndexToLetter(index: number): string {
	let name = "";
	let i = index;
	while (i >= 0) {
		name = String.fromCharCode((i % 26) + 65) + name;
		i = Math.floor(i / 26) - 1;
	}
	return name;
}

export function getAddress(headers: string[], startCol: number, startRow: number, endCol: number, endRow: number): string {
	return `${headers[startCol]}${startRow + 1}:${headers[endCol]}${endRow + 1}`;
}

export function getAddressFromHeader(headers: { header: string; width?: number | string }[], col: number, row: number): string {
	return `${headers[col].header}${row + 1}`;
}

export function toCellPropsMap(
	headers: { header: string; width?: number | string }[],
	list: HeaderCellConfig[]
): Record<string, Partial<HeaderCellProps>> {
	const map: Record<string, Partial<HeaderCellProps>> = {};
	for (const item of list) {
		const addr = getAddressFromHeader(headers, item.startCol, item.startRow);
		map[addr] = { ...map[addr], ...item.props, width: Number(item.props.width) };
	}
	return map;
}

export function stableDetectHeaderDepth(rowDatas: any[][], mergeData?: MergeMap): number {
	let depth = 0;
	for (let r = 0; r < rowDatas.length; r++) {
		const row = rowDatas[r] ?? [];
		const hasValue = row.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
		const hasMergeOnRow = !!mergeData && Object.keys(mergeData).some((k) => k.endsWith(String(r + 1)));
		if (hasValue || hasMergeOnRow) depth = r;
	}
	return Math.max(1, depth);
}

function detectHeaderDepth(rowDatas: any[][], mergeData?: MergeMap): number {
	let deps = -1;
	for (let r = 0; r < rowDatas.length; r++) {
		const row = rowDatas[r] ?? [];
		const hasValue = row.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
		if (hasValue) {
			deps = r;
			break;
		}
	}
	if (deps === -1) return 1;
	let depth = deps;
	for (let r = deps; r < rowDatas.length; r++) {
		const row = rowDatas[r] ?? [];
		const hasValue = row.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
		const hasMergeOnRow = !!mergeData && Object.keys(mergeData).some((k) => k.endsWith(String(r + 1)));
		if (hasValue || hasMergeOnRow) {
			depth++;
		} else {
			break;
		}
	}
	return Math.max(1, depth);
}

function getHeaderLevel(rowDatas: any[][]): number {
	if (!rowDatas || rowDatas.length === 0) return 0;
	for (let r = 0; r < rowDatas.length; r++) {
		const row = rowDatas[r] ?? [];
		const hasValue = row.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
		if (hasValue) return r;
	}
	return 0;
}

function getMergeSpan(
	mergeData: MergeMap | undefined,
	headers: { header: string; width?: number | string }[],
	col: number,
	level: number
) {
	const key = `${headers[col].header}${level + 1}`;
	const [colspan, rowspan] = mergeData?.[key] ?? [1, 1];
	return { colspan, rowspan };
}

function findNameFallback(
	rowDatas: any[][],
	col: number,
	upToLevel: number,
	headers: { header: string; width?: number | string }[]
) {
	for (let l = upToLevel; l >= 0; l--) {
		const v = rowDatas[l]?.[col];
		if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
	}
	return headers[col].header ?? `col_${col}`;
}

function inferType(rowDatas: any[][], headerDepth: number, col: number): ColumnNode["type"] {
	const dataRows = rowDatas.slice(headerDepth + 1);
	const samples = dataRows
		.slice(0, 20)
		.map((r) => r?.[col])
		.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
	if (samples.length === 0) return "input";
	const numericLike = samples.every((v) => /^-?\d+(\.\d+)?$/.test(String(v)));
	return numericLike ? "number" : "input";
}

function getPropsForCell(
	cellPropsMap: Record<string, Partial<HeaderCellProps>> | undefined,
	headers: { header: string; width?: number | string }[],
	col: number,
	level: number
) {
	const addr = `${headers[col].header}${level + 1}`;
	return cellPropsMap?.[addr];
}

function buildLevel(
	headers: { header: string; width?: number | string }[],
	rowDatas: any[][],
	mergeData: MergeMap | undefined,
	startCol: number,
	endCol: number,
	level: number,
	headerDepth: number,
	cellPropsMap?: Record<string, Partial<HeaderCellProps>>
): ColumnNode[] {
	const nodes: ColumnNode[] = [];
	let col = startCol;

	while (col < endCol) {
		const { colspan } = getMergeSpan(mergeData, headers, col, level);
		const spanCols = Math.min(colspan, endCol - col);
		const nameHere = rowDatas[level]?.[col];
		const overrideProps = getPropsForCell(cellPropsMap, headers, col, level);
		const hasOverrideHeader = !!(overrideProps?.header && String(overrideProps.header).trim() !== "");
		const hasNameHere = !!(nameHere !== null && nameHere !== undefined && String(nameHere).trim() !== "");
		const safeName = hasOverrideHeader
			? String(overrideProps.header)
			: hasNameHere
			? String(nameHere)
			: findNameFallback(rowDatas, col, level, headers);

		const canHaveChildren = level < headerDepth - 1;
		const forceParent = overrideProps?.isParent === true;
		const forceLeaf = overrideProps?.isParent === false;

		let shouldGroup = false;
		if (canHaveChildren && !forceLeaf) {
			if (forceParent) {
				shouldGroup = true;
			} else {
				const hasSpanAcrossCols = spanCols > 1;
				let hasDeeperContent = false;
				if (!hasSpanAcrossCols) {
					for (let c = col; c < col + spanCols && !hasDeeperContent; c++) {
						for (let r = level + 1; r < headerDepth; r++) {
							const v = rowDatas[r]?.[c];
							if (v !== null && v !== undefined && String(v).trim() !== "") {
								hasDeeperContent = true;
								break;
							}
							const childOverride = getPropsForCell(cellPropsMap, headers, c, r);
							if (childOverride?.header && String(childOverride.header).trim() !== "") {
								hasDeeperContent = true;
								break;
							}
							const deeperSpan = getMergeSpan(mergeData, headers, c, r).colspan;
							if (deeperSpan > 1) {
								hasDeeperContent = true;
								break;
							}
						}
					}
				}
				shouldGroup = hasSpanAcrossCols || hasDeeperContent;
			}
		}

		if (shouldGroup) {
			if (hasOverrideHeader || hasNameHere) {
				const children = buildLevel(
					headers,
					rowDatas,
					mergeData,
					col,
					col + spanCols,
					level + 1,
					headerDepth,
					cellPropsMap
				);
				nodes.push({
					key: overrideProps?.accessorKey || `group_${headers[col].header}_${headers[col + spanCols - 1].header}`,
					header: safeName,
					columns: children,
					role: "group",
				});
				col += spanCols;
			} else {
				const children = buildLevel(
					headers,
					rowDatas,
					mergeData,
					col,
					col + spanCols,
					level + 1,
					headerDepth,
					cellPropsMap
				);
				for (const child of children) nodes.push(child);
				col += spanCols;
			}
		} else if (level < headerDepth - 1) {
			const leafOverride = overrideProps;
			if (hasOverrideHeader || hasNameHere) {
				nodes.push({
					key:
						leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== ""
							? String(leafOverride.accessorKey)
							: headers[col].header,
					accessorKey:
						leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== ""
							? String(leafOverride.accessorKey)
							: headers[col].header,
					header: hasOverrideHeader ? String(overrideProps?.header) : String(nameHere),
					type: (leafOverride?.type as ColumnNode["type"]) || inferType(rowDatas, headerDepth, col),
					editable: leafOverride?.editable ?? true,
					width:
						headers[col]?.width !== undefined
							? Number(headers[col]?.width)
							: leafOverride?.width !== undefined
							? Number(leafOverride?.width)
							: undefined,
					resizable: leafOverride?.resizable ?? true,
					align: (leafOverride?.align as any) ?? "left",
					required: leafOverride?.required ?? false,
					selectItems: leafOverride?.selectItems ?? [],
					role: "leaf",
				});
			}
			col += spanCols;
		} else {
			for (let c = col; c < col + spanCols; c++) {
				const leafOverride = getPropsForCell(cellPropsMap, headers, c, level);
				const hasLeafOverrideHeader = !!(leafOverride?.header && String(leafOverride.header).trim() !== "");
				const cellVal = rowDatas[level]?.[c];
				const hasLeafNameHere = !!(cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== "");
				const leafName = hasLeafOverrideHeader ? String(leafOverride.header) : hasLeafNameHere ? String(cellVal) : "";
				if (hasLeafOverrideHeader || hasLeafNameHere) {
					nodes.push({
						key:
							leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== ""
								? String(leafOverride.accessorKey)
								: headers[c].header,
						accessorKey:
							leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== ""
								? String(leafOverride.accessorKey)
								: headers[c].header,
						header: leafName,
						type:
							leafOverride?.type === "button"
								? "custom"
								: (leafOverride?.type as ColumnNode["type"]) || inferType(rowDatas, headerDepth, c),
						editable: leafOverride?.editable ?? true,
						width:
							headers[c]?.width !== undefined
								? Number(headers[c]?.width)
								: leafOverride?.width !== undefined
								? Number(leafOverride?.width)
								: undefined,
						// component: leafOverride?.type === "button" ? React.createElement(() => {
                        //             return (
                        //                 <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => {
                        //                     console.log("button click")
                        //                 }}>{leafName}</Button>
                        //             )
                        //         }) : undefined,
						resizable: leafOverride?.resizable ?? true,
						align: (leafOverride?.align as any) ?? "left",
						required: leafOverride?.required ?? false,
						selectItems: leafOverride?.selectItems ?? [],
					});
				}
			}
			col += spanCols;
		}
	}

	return nodes;
}

export function buildColumnsFromJSS(
	headers: { header: string; width?: number | string }[],
	rowDatas: any[][],
	mergeData?: MergeMap,
	headerDepth?: number,
	cellPropsMap?: Record<string, Partial<HeaderCellProps>>
): ColumnNode[] {
	const depth = headerDepth ?? detectHeaderDepth(rowDatas, mergeData);
	const level = getHeaderLevel(rowDatas);
	return buildLevel(headers, rowDatas, mergeData, 0, headers.length, level, depth, cellPropsMap);
}