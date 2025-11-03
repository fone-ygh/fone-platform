'use client';

import Table, { CellKeyboardEvent, CellKeyDownArgs, CellSelectArgs, Column, ColumnGroup, DataGridHandle, RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { Button } from "fone-design-system_v2";
import { useRef, useState } from "react";
import styled from "@emotion/styled";

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
  
  interface MergedCell {
      range: { startRow: number; endRow: number; startCol: number; endCol: number };
      value: string;
  }
  
  // ColumnGroup 타입에 dataType 필드를 추가하고 싶다면, ColumnGroup을 확장하는 방식으로 정의해야 합니다.
  // 하지만 ColumnOrColumnGroup은 유니언 타입(Column | ColumnGroup)이기 때문에 인터페이스에서 직접 확장할 수 없습니다.
  // 그러므로 ColumnGroup을 확장하세요.

  type ColumnOrColumnGroup<R, SR = unknown> = Column<R, SR> & { dataType?: string } | ColumnGroup<R, SR>;

const TablePage = () => {
	const gridRef = useRef<DataGridHandle>(null);

    const isInRange = (rowIdx: number, colIdx: number, selectCells: {col: number, row: number}[]) => {
        return selectCells.some((cell) => cell.col === colIdx && cell.row === rowIdx);
    }

	const cellRenderer = (p: RenderCellProps<Row>) => {
		const colIdx = p.column?.idx as number | undefined;
		const value = p.row[p.column.key as keyof Row] as unknown as string;
		if (colIdx == null) return <span>{value}</span>;
		if (isInAnyMergedRange(p.rowIdx, colIdx) && !isTopLeftOfMergedRange(p.rowIdx, colIdx)) {
			return <span />;
		}
		const inRange = isInRange(p.rowIdx, colIdx, selectCells);
		return <div className={inRange ? 'rg-selected' : undefined}>{value}</div>;
	};

	const baseColumns: ColumnOrColumnGroup<Row, unknown>[] = [
		{ key: "id", name: "ID" ,width: 100, dataType:"number",
			renderEditCell: (props: RenderEditCellProps<Row>) =>  
				<input type="text" style={{ width: "100%", height: "100%" }}
					value={props.row[props.column.key as keyof Row] as unknown as string}
					onChange={(event) => props.onRowChange({ ...props.row, [props.column.key]: event.target.value as unknown as string } as unknown as Row)}
					onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
						props.onClose(true, false);
						setRows(rows.map((r) => r.id === props.row.id ? { ...r, name: event.target.value as unknown as string } : r));
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							props.onClose(true, false);
						}
					}}
				/>,
			resizable: true, draggable: true, renderCell: cellRenderer 
		},
		{ key: "name", name: "Name" ,width: 100, 
			children: [
				{ key: "value11", name: "Value11" ,width: 100, resizable: true, draggable: true, renderCell: cellRenderer },
				{ key: "value12", name: "Value12" ,width: 200, resizable: true, draggable: true, renderCell: cellRenderer },
				{ key: "value13", name: "Value13" ,width: 300, resizable: true, draggable: true, renderCell: cellRenderer },
				{ key: "value14", name: "Value14" ,width: 100, 
					children: [
						{ key: "value141", name: "Value141" ,width: 100, resizable: true, draggable: true, renderCell: cellRenderer },
						{ key: "value142", name: "Value142" ,width: 200, resizable: true, draggable: true, renderCell: cellRenderer },
						{ key: "value143", name: "Value143" ,width: 300, resizable: true, draggable: true, renderCell: cellRenderer },
					]
				},
			]
    	},
		{ key: "value3", name: "Value3" ,width: 100, resizable: true, draggable: true, renderCell: cellRenderer },
		{ key: "value4", name: "Value4" ,width: 100, resizable: true, draggable: true, renderCell: cellRenderer },
		{ key: "value5", name: "Value5" ,width: 100, resizable: true, draggable: true, renderCell: cellRenderer },
    ];

	const getColWidth = (col: ColumnOrColumnGroup<Row, unknown> | undefined): number => {
		if (!col) return 100;
		const w = (col as any).width as unknown;
		if (typeof w === 'number') return w;
		if (typeof w === 'string') {
			const n = parseFloat(w);
			return Number.isFinite(n) ? n : 100;
		}
		return 100;
	};

    const initialRows: Row[] = [
		{ id: 1, name: "Apple", value: "100", value2: "100", value3: "100", value4: "100", value5: "100", dataType: "number" },
		{ id: 2, name: "Banana", value: "200", value2: "200", value3: "200", value4: "200", value5: "200" },
		{ id: 3, name: "Cherry", value: "300", value2: "300", value3: "300", value4: "300", value5: "300" },
		{ id: 4, name: "Cherry", value: "400", value2: "400", value3: "400", value4: "400", value5: "400" },
		{ id: 5, name: "Cherry", value: "500", value2: "500", value3: "500", value4: "500", value5: "500" },
		{ id: 6, name: "Cherry", value: "600", value2: "600", value3: "600", value4: "600", value5: "600" },
    ];

	const [selectCells, setSelectCells] = useState<{col: number, row: number, id: number, scrollTop?: number}[]>([]);
	const [mergedCells, setMergedCells] = useState<{ rowId: number; startColIdx: number; endColIdx: number }[]>([]);
	const [mergedRanges, setMergedRanges] = useState<{ range: { startRow: number; endRow: number; startCol: number; endCol: number }; value?: string; editMode?: boolean }[]>([]);

	// headerHeight: height is base 75 + 75 * children depth (max depth in baseColumns)
	const getMaxDepth = (columns: any[]): number => {
		let max = 1;
		for (const col of columns) {
			if (col.children && Array.isArray(col.children) && col.children.length > 0) {
				max = Math.max(max, 1 + getMaxDepth(col.children));
			}
		}
		return max;
	};

	const headerHeight = 35 * getMaxDepth(baseColumns);
	const rowHeight = 35;

	const getColSpan = (rowId: number, colIdx: number): number | undefined => {
		const hit = mergedCells.find(m => m.rowId === rowId && colIdx >= m.startColIdx && colIdx <= m.endColIdx);
		if (!hit) return undefined;
		return colIdx === hit.startColIdx ? (hit.endColIdx - hit.startColIdx + 1) : undefined;
	};

	const isInAnyMergedRange = (rowIdx: number, colIdx: number) => {
		return mergedRanges.some(({ range }) => rowIdx >= range.startRow && rowIdx <= range.endRow && colIdx >= range.startCol && colIdx <= range.endCol);
	};

	const isTopLeftOfMergedRange = (rowIdx: number, colIdx: number) => {
		return mergedRanges.some(({ range }) => rowIdx === range.startRow && colIdx === range.startCol);
	};

	const [columns, setColumns] = useState<ColumnOrColumnGroup<Row, unknown>[]>(baseColumns.map((c) => ({
		...c,
		colSpan: (args: any) => {
			const row = args?.row as Row | undefined;
			const colIdx = args?.column?.idx as number | undefined;
			if (row == null || colIdx == null) return undefined;
			return getColSpan(row.id, colIdx);
		}
	})));

    const [pressedKey, setPressedKey] = useState<string | null>(null);

    const [rows, setRows] = useState<Row[]>(initialRows);

	const selectFirstCell = () => {
		gridRef.current?.selectCell({ rowIdx: 0, idx: 0 }, false);
	};

const mergeSelection = () => {
		if (selectCells.length < 2) return;
		const cols = [...new Set(selectCells.map(c => c.col))].sort((a,b) => a - b);
		const rowsIdx = [...new Set(selectCells.map(c => c.row))].sort((a,b) => a - b);
		const startCol = cols[0];
		const endCol = cols[cols.length - 1];
		const startRow = rowsIdx[0];
		const endRow = rowsIdx[rowsIdx.length - 1];
		for (let i = startCol; i <= endCol; i++) if (!cols.includes(i)) return;
		for (let j = startRow; j <= endRow; j++) if (!rowsIdx.includes(j)) return;
		if (startRow === endRow) {
			const rowId = rows[startRow]?.id;
			if (rowId != null) setMergedCells([...mergedCells, { rowId, startColIdx: startCol, endColIdx: endCol }]);
		}
		const firstColKey = (baseColumns[startCol] as Column<Row, unknown>)?.key ?? '';
		const overlayValue = rows[startRow]?.[firstColKey as keyof Row] as unknown as string | undefined;
		setSelectCells([]);
		setMergedRanges([...mergedRanges, { range: { startRow, endRow, startCol, endCol }, value: overlayValue }]);
};

const clearMerges = () => {
		setMergedCells([]);
		setMergedRanges([]);
};

    const addRow = () => {
		// console.log("selectCells : ", selectCells);
		// const index = rows.findIndex((row) => row.id === selectCells[0]?.id);

		// rows.splice(index, 0, { id: rows.length + 1, name: "", value: "", value2: "", value3: "", value4: "", value5: "" });
		// console.log("rows : ", rows, index);
        // setRows(rows);
		setRows([...rows, { id: rows.length + 1, name: "", value: "", value2: "", value3: "", value4: "", value5: "" }]);
    }
    const deleteRow = (id: number) => {
		selectCells
        setRows(rows.filter((row) => row.id !== id));
		console.log("rows : ", rows, id);
    }
    const editRow = (id: number) => {
        setRows(rows.map((row) => row.id === id ? { ...row, name: "Edited" } : row));
    }
    const saveRow = (id: number) => {
        setRows(rows.map((row) => row.id === id ? { ...row, name: "Saved" } : row));
    }
    const cancelRow = (id: number) => {
        // setRows(rows.map((row) => row.id === id ? { ...row, name: "Cancelled" } : row));
        console.log("mergedCells : ", mergedCells);
    }
    const handleRowChange = (id: number, row: Row) => {
        setRows(rows.map((r) => r.id === id ? row : r));
    }
    
	const flattenColumns = (cols: any[]): any[] => {
		return cols.reduce((acc, col) => {
			if (col.children && Array.isArray(col.children) && col.children.length > 0) {
				return acc.concat(flattenColumns(col.children));
			} else {
				return acc.concat(col);
			}
		}, []);
	};
    
    return (
        <TableContainer
            onKeyUp={() => {
                setPressedKey(null);
            }}
        >
            <div>
                <Button onClick={addRow}>
                    Add Row
                </Button>
                <Button onClick={() => deleteRow(rows[rows.length - 1].id)}>
                    Delete Row
                </Button>
                <Button onClick={() => editRow(rows.length + 1)}>
                    Edit Row
                </Button>
                <Button onClick={() => saveRow(rows.length + 1)}>
                    Save Row
                </Button>
                <Button onClick={() => cancelRow(rows.length + 1)}>
                    Cancel Row
                </Button>
            </div>
			<div style={{ position: 'relative' }}>
				<Table
					onScroll={(e) => {
						console.log("e : ", (e.target as HTMLElement).scrollTop, (e.target as HTMLElement).scrollLeft);
						setSelectCells(selectCells.map(c => ({ ...c, scrollTop: (e.target as HTMLElement).scrollTop })));
					}}
					columns={columns}
					onColumnResize={(idx: number, width: number) => {
						setColumns(columns.map((c, index) => index === idx ? { ...c, width: width } as ColumnOrColumnGroup<Row, unknown> : c));
					}}
					rows={rows}
					rowHeight={rowHeight}
					onCellKeyDown={(cells: CellKeyDownArgs<Row, unknown>, event: CellKeyboardEvent) => {
						if (event.key === "Control") {
							setPressedKey("Control");
							return
						}
						if(event.key === "Shift") {
							setPressedKey("Shift");
							return
						}
					}}
					
					onSelectedCellChange={(cells: CellSelectArgs<Row, unknown>) => {
						const colIdx = cells?.column?.idx as number | undefined;
						const rowIdx = cells?.rowIdx as number | undefined;
						if (colIdx == null || rowIdx == null) return;
						if(pressedKey === "Control") {
							return setSelectCells([...selectCells, {col: colIdx, row: rowIdx, id: cells.row.id}])
						}	
						if(pressedKey === "Shift") {
							if(selectCells.length === 0) {
								setSelectCells([{col: colIdx, row: rowIdx, id: cells.row.id}])
								return
							}
							const startCol0 = selectCells[0].col;
							const startRow0 = selectCells[0].row;
							const endCol0 = colIdx;
							const endRow0 = rowIdx;
							const startCol = Math.min(startCol0, endCol0);
							const endCol = Math.max(startCol0, endCol0);
							const startRow = Math.min(startRow0, endRow0);
							const endRow = Math.max(startRow0, endRow0);
							const newSelectCells: {col: number, row: number, id: number}[] = [];
							for(let i = startCol; i <= endCol; i++) {
								for(let j = startRow; j <= endRow; j++) {
									newSelectCells.push({col: i, row: j, id: cells.row.id})
								}
							}
							return setSelectCells(newSelectCells)
						}
						setSelectCells([{col: colIdx, row: rowIdx, id: cells.row.id}])
					}}

				/>
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', top:`${headerHeight}px`, height:`calc(100% - ${headerHeight}px)` }}>
					{mergedRanges.map((m, i) => {
						const getX = (c: number) => flattenColumns(columns).slice(0, c).reduce((acc, col) => acc + getColWidth(col), 0);
						const getW = (s: number, e: number) => flattenColumns(columns).slice(s, e + 1).reduce((acc, col) => acc + getColWidth(col), 0);
						const left = getX(m.range.startCol);
						const top = headerHeight + m.range.startRow * rowHeight;
						const width = getW(m.range.startCol, m.range.endCol);
						const height = (m.range.endRow - m.range.startRow + 1) * rowHeight;
						return (
							<div key={i} 
								style={{ 
									position: 'absolute', 
									left, top, width, height, 
									pointerEvents: 'auto', 
									cursor: 'pointer', 
									zIndex: 10, 
									background: 'rgb(21, 21, 21)', 
									border: 
										selectCells.some(c => c.col === m.range.startCol && c.row === m.range.startRow) ? '2px solid #0078d4' : '1px solid #444', 
									boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}
								onClick={() => {
									// console.log("m : ", m);
									gridRef.current?.selectCell({ rowIdx: 0, idx: 0 }, false);
									setSelectCells([{col: m.range.startCol, row: m.range.startRow, id: rows[m.range.startRow]?.id}]);
								}}
								onDoubleClick={(e) => {
									// 더블 클릭 시 편집 모드로 전환
									e.preventDefault();
									console.log("e : ", e);
									setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, editMode: true } : m1));
								}}
								onContextMenu={(e) => {
									e.preventDefault();
									console.log("e : ", e);
								}}
							>
								{m.editMode ? (
								<input type="text" style={{ width: "100%", height: "100%", background: "transparent", border: "none", color: "white", fontWeight: 600 }} 
									value={m.value ?? ''}
									onChange={(e) => {
										setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, value: e.target.value } : m1));
									}}
									onBlur={(e) => {
										setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, value: e.target.value, editMode: false } : m1));
									}}
									onKeyDown={(e) => {
										if(e.key === "Enter") {
											setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, value: e.currentTarget.value, editMode: false } : m1));
										}
									}}
								/>
								) : (
									<span>{m.value ?? ''}</span>
								)}
							</div>
						);
					})}
					{selectCells.map((c, i) => {
						// flatten children of columns into a single flat array
						
						const flatColumns = flattenColumns(columns);
						
						const left = flatColumns.slice(0, c.col).reduce((acc, col) => acc + getColWidth(col), 0);
						const top = (c.row * rowHeight) - (c.scrollTop ?? 0);
						const width = getColWidth(flatColumns[c.col] as ColumnOrColumnGroup<Row, unknown>);
						const height = rowHeight;
						return <div key={`sel-${i}`} style={{ position: 'absolute', left, top, width, height,  border: '2px solid rgb(0, 91, 160)', boxSizing: 'border-box' }} />
					})}
				</div>
			</div>
            <div>
				<Button onClick={selectFirstCell}>Select (0,0)</Button>
				<Button onClick={mergeSelection}>Merge selection</Button>
				<Button onClick={clearMerges}>Clear merges</Button>
                {selectCells.map((cell, index) => (
                    <div key={index}>
                        column : {cell?.col} /
                        row : {cell?.row} 
                    </div>
                ))}
            </div>
        </TableContainer>
    );
};

export default TablePage;   

const TableContainer = styled.div`
	width: 100%;
	height: 100%;
	.rg-selected {
		background: red;
	}
`;