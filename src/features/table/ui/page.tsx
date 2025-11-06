'use client';

import Table, { CellClickArgs, CellKeyboardEvent, CellKeyDownArgs, CellMouseEvent, CellSelectArgs, Column, ColumnGroup, DataGridHandle, RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { Button, TextField2 } from "fone-design-system_v1";
import { useCallback, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Input, OutlinedInput } from "@mui/material";

interface Row {
    id: string;
    // name: string;
    value11: string;
    value12: string;
    value13: string;
    value141: string;
    value142: string;
    value143: string;
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

	const initialRows: Row[] = [
		{ id: "1", value11: "Apple", value12: "100", value141: "100", value13: "100", value142: "100", value143: "100", dataType: "number" },
		{ id: "2", value11: "Banana", value12: "200", value141: "200", value13: "200", value142: "200", value143: "200" },
		{ id: "3", value11: "Cherry", value12: "300", value141: "300", value13: "300", value142: "300", value143: "300" },
		{ id: "4", value11: "Cherry", value12: "400", value141: "400", value13: "400", value142: "400", value143: "400" },
		{ id: "5", value11: "Cherry", value12: "500", value141: "500", value13: "500", value142: "500", value143: "500" },
		{ id: "6", value11: "Cherry", value12: "600", value141: "600", value13: "600", value142: "600", value143: "600" },
    ];

	const [selectCells, setSelectCells] = useState<{col: number, row: number, id: string, value?: string, scrollTop?: number}[]>([]);
	const [mergedRanges, setMergedRanges] = useState<{ id: string; mergeCellId: string; range: { startRow: number; endRow: number; startCol: number; endCol: number }; value?: string; editMode?: boolean }[]>([]);



    const isInRange = useCallback((rowIdx: number, colIdx: number) => {
        return selectCells.some((cell) => cell.col === colIdx && cell.row === rowIdx);
    }, [selectCells]);

	const cellRenderer = (p: RenderCellProps<Row>) =>  {
		const colIdx = p.column?.idx as number | undefined;
		const value = p.row[p.column.key as keyof Row] as unknown as string;
		if (colIdx == null) return <span>{value}</span>;
		if (isInAnyMergedRange(p.rowIdx, colIdx) && !isTopLeftOfMergedRange(p.rowIdx, colIdx)) {
			return <span>{value}</span>;
		}
		const inRange = isInRange(p.rowIdx, colIdx);
		return <div className={`no-drag ${inRange ? 'rg-selected' : undefined}`} onClick={(e) => console.log("e : ", e)}>{value}</div>;
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
		{ key: "value3", name: "Value3" ,width: 100, children: [
			{ key: "value31", name: "Value31" ,width: 100, resizable: true, draggable: true, renderCell: cellRenderer },
		]},
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


	const [scrollTop, setScrollTop] = useState<number>(0);

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

	const getColSpan = (rowId: string, colIdx: number): number | undefined => {
		const hit = mergedRanges.find(m => m.id === rowId && colIdx >= m.range.startCol && colIdx <= m.range.endCol);
		if (!hit) return undefined;
		return colIdx === hit.range.startCol ? (hit.range.endCol - hit.range.startCol + 1) : undefined;
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
			if (rowId != null) setMergedRanges([...mergedRanges, { id: rowId, mergeCellId: rowId + "_" + startCol + "_" + endCol, range: { startRow, endRow, startCol, endCol }, value: selectCells[0]?.value }]);
		}
		setMergedRanges([...mergedRanges, { id: selectCells[0]?.id, mergeCellId: selectCells[0]?.id + "_" + startCol + "_" + endCol, range: { startRow, endRow, startCol, endCol }, value: selectCells[0]?.value }]);
		setSelectCells([]);

};

const clearMerges = () => {
		setMergedRanges([]);
		setSelectCells([]);
};

	// 선택한 로우 기준으로 행 추가
    const addRow = () => {
		if(selectCells.length === 0) {
			setRows([...rows, { id: "new_" + (rows.length + 1), value11: "", value12: "", value13: "", value141: "", value142: "", value143: "" }]);
			setSelectCells([]);
			return;
		}
		const index = rows.findIndex((row) => row.id === selectCells[0]?.id);
		const tempRows = [...rows];
		tempRows.splice(index, 0, { id: "new_" + (tempRows.length + 1), value11: "", value12: "", value13: "", value141: "", value142: "", value143: "" });

		setRows(tempRows);
		setSelectCells([]);
    }

	// 선택한 로우 기준으로 행 삭제 / 여러줄 선택 시 모두 삭제
    const deleteRow = () => {
		if(selectCells.length === 0) {
			const deleteRows = [...rows];
			deleteRows.pop();
			setRows(deleteRows);
			setSelectCells([]);
			return;
		}
		const tempRows = [...rows];
		const deleteRows = tempRows.filter((row) => !selectCells.some((cell) => cell.id === row.id));
		setRows(deleteRows);
		setSelectCells([]);
    }


	// 선택한 셀 기준으로 병합되어 있는 셀이라면 병합 해제
    const cancelRow = () => {
        setMergedRanges(props => props.filter((range) => range.id !== selectCells[0]?.id));
        setSelectCells([]);
    }

	const addColumn = () => {
		setColumns([...columns, { key: "new_" + (columns.length + 1), name: "New Column", width: 100, resizable: true, draggable: true, renderCell: cellRenderer }]);
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

	// 중첩된 배열을 트리 구조로 만드는 함수 (flattenColumns의 역함수)
	const nestColumns = (flatCols: any[], getChildrenKey = 'parentId'): any[] => {
		const colMap: { [key: string]: any } = {};
		const result: any[] = [];
		// 먼저 각 컬럼을 id 기준으로 map에 저장
		flatCols.forEach(col => {
			colMap[col.id] = { ...col, children: [] };
		});
		// 부모-자식 관계를 맵핑
		flatCols.forEach(col => {
			if (col[getChildrenKey]) {
				if (colMap[col[getChildrenKey]]) {
					colMap[col[getChildrenKey]].children.push(colMap[col.id]);
				}
			} else {
				result.push(colMap[col.id]);
			}
		});
		// children이 없는 경우 배열 제거
		const cleanTree = (cols: any[]) =>
			cols.map(col => {
				const c = { ...col };
				if (c.children.length === 0) delete c.children;
				else c.children = cleanTree(c.children);
				return c;
			});
		return cleanTree(result);
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
                <Button onClick={() => deleteRow()}>
                    Delete Row
                </Button>
                <Button onClick={() => cancelRow()}>
                    Cancel Row
                </Button>
            </div>
			<div>
				<Button onClick={addColumn}>
					Add Column
				</Button>
			</div>
			<div style={{ position: 'relative' }}>
				<Table
					
					onScroll={(e) => {
						setScrollTop((e.target as HTMLElement).scrollTop);
					}}
					columns={columns}
					onColumnResize={(idx: number, width: number) => {
						setColumns(columns.map((c, index) => index === idx ? { ...c, width: width } as ColumnOrColumnGroup<Row, unknown> : c));
					}}
					onSelectedRowsChange={undefined}
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
					onCellClick={(cells: CellClickArgs<Row, unknown>, event: CellMouseEvent) => {
						const colIdx = cells?.column?.idx as number | undefined;
						const rowIdx = rows.findIndex((row) => row.id === cells.row.id);
						if (colIdx == null || rowIdx == null) return;
						if(pressedKey === "Control") {
							return setSelectCells([...selectCells, {col: colIdx, row: rowIdx, id: cells.row.id, value: cells.row[cells.column.key as keyof Row] as unknown as string}])
						}	
						if(pressedKey === "Shift") {
							if(selectCells.length === 0) {
								setSelectCells([{col: colIdx, row: rowIdx, id: cells.row.id, value: cells.row[cells.column.key as keyof Row] as unknown as string}])
								return
							}
							const startCol0 = selectCells[0].col;
							const startRow0 = selectCells[0].row;
							const endCol0 = colIdx;
							const endRow0 = rowIdx;
							const newSelectCells: {col: number, row: number, id: string, value?: string}[] = [];

							const colStep = startCol0 <= endCol0 ? 1 : -1;
							const rowStep = startRow0 <= endRow0 ? 1 : -1;
							for (
								let i = startCol0;
								colStep > 0 ? i <= endCol0 : i >= endCol0;
								i += colStep
							) {
								for (
									let j = startRow0;
									rowStep > 0 ? j <= endRow0 : j >= endRow0;
									j += rowStep
								) {
									newSelectCells.push({ col: i, row: j, id: selectCells[0].id, value: selectCells[0].value });
								}
							}
							return setSelectCells(newSelectCells)
						}
						setSelectCells([{col: colIdx, row: rowIdx, id: cells.row.id, value: cells.row[cells.column.key as keyof Row] as unknown as string}])
						
					}}

				/>
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', top:`${headerHeight}px`, height:`calc(100% - ${headerHeight}px)` }}>
					{mergedRanges.map((m, i) => {
						const getX = (c: number) => flattenColumns(columns).slice(0, c).reduce((acc, col) => acc + getColWidth(col), 0);
						const getW = (s: number, e: number) => flattenColumns(columns).slice(s, e + 1).reduce((acc, col) => acc + getColWidth(col), 0);
						const left = getX(m.range.startCol);
						const top =  m.range.startRow * rowHeight - (scrollTop);
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
										if(pressedKey === "Shift") {
											return setSelectCells([...selectCells, {col: m.range.startCol, row: m.range.startRow, id: rows[m.range.startRow]?.id}]);
										}
										if(pressedKey === "Control") {
											return setSelectCells([...selectCells, {col: m.range.startCol, row: m.range.startRow, id: rows[m.range.startRow]?.id}]);
										}
										// gridRef.current?.selectCell({ rowIdx: 0, idx: 0 }, false);
										setSelectCells([{col: m.range.startCol, row: m.range.startRow, id: rows[m.range.startRow]?.id}]);
									}}
								// onDoubleClick={(e) => {
								// 	// 더블 클릭 시 편집 모드로 전환
								// 	e.preventDefault();
								// 	setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, editMode: true } : m1));
								// }}
								tabIndex={0}
								onKeyDown={(e) => {
									if(e.key === "Enter") {
										setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, editMode: true } : m1));
									}
								}}
								onContextMenu={(e) => {
									e.preventDefault();
								}}
							>
								{m.editMode ? (
								<input type="text" className="no-drag" style={{ width: "100%", height: "100%", background: "transparent", border: "none", color: "white", fontWeight: 600 }} 
									value={m.value ?? ''}
									onChange={(e) => {
										setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, value: e.target.value } : m1));
									}}
									onBlur={(e) => {
										setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, value: e.target.value, editMode: false } : m1));
									}}
									onKeyDown={(e) => {
										if(e.key === "Enter") {
											setMergedRanges(props => props.map((m1, i1) => i === i1 ? { ...m, value: e.currentTarget.value, editMode: true } : m1));
										}
									}}
								/>
								) : (
									<div className="no-drag" >{m.value ?? ''}</div>
								)}
							</div>
						);
					})}
					{selectCells.map((c, i) => {
						// flatten children of columns into a single flat array
						
						const flatColumns = flattenColumns(columns);
						const left = flatColumns.slice(0, c.col).reduce((acc, col) => acc + getColWidth(col), 0);
						const top = (c.row * rowHeight) - scrollTop;
						const width = getColWidth(flatColumns[c.col] as ColumnOrColumnGroup<Row, unknown>);
						const height = rowHeight;
						return <div key={`sel-${i}`} className="no-drag" style={{ position: 'absolute', left, top, width, height,  border: '2px solid rgb(0, 91, 160)', boxSizing: 'border-box' }} />
					})}
				</div>
			</div>
            <div>
				<Button onClick={selectFirstCell}>Select (0,0)</Button>
				<Button onClick={mergeSelection}>Merge selection</Button>
				<Button onClick={clearMerges}>Clear merges</Button>
				<br />
				<h1>SelectCells</h1>
                {selectCells.map((cell, index) => (
                    <div key={index}>
                        column : {cell?.col} /
                        row : {cell?.row} 
                    </div>
                ))}
				<br />
				<h1>PressedKey</h1>
				{pressedKey}
				<br />
				<h1>MergedCells(MergedRanges)</h1>
				{mergedRanges.map((range, index) => (
					<div key={index}>
						id : {range.id} / mergeCellId : {range.mergeCellId} / startRow : {range.range.startRow} / endRow : {range.range.endRow} / startCol : {range.range.startCol} / endCol : {range.range.endCol}
					</div>
				))}
            </div>
			<div>
				<h1>기능 리스트</h1>
				<Button>행추가</Button>
				<Button>행삭제</Button>
				<Button>열추가</Button>
				<Button>열삭제</Button>
				<Button>셀병합</Button>
				<Button>셀병합해제</Button>
			</div>
			<div>
				<h1>속성 리스트</h1>
				<Button>key 설정</Button>
				<Button>title 설정</Button>
				<Button>defaultValue 설정</Button>
				<Button>width 설정</Button>
				<Button>height 설정</Button>
				<Button>resizable 설정</Button>
				<Button>draggable 설정</Button>
				<Button>type 설정</Button>
				<Button>type에 따른 세부 속성 설정</Button>
				<br/>
				<span>예시 : type: &quot;number&quot;, min: 0, max: 100, step: 1</span><br/>
				<span>예시 : type: &quot;button&quot;, onClick </span><br/>
				<span>예시 : type: &quot;select&quot;, options: [&quot;option1&quot;, &quot;option2&quot;, &quot;option3&quot;]</span><br/>
				<span>예시 : type: &quot;date&quot;, format: &quot;YYYY-MM-DD&quot;</span>
			</div>
        </TableContainer>
    );
};

export default TablePage;   

const TableContainer = styled.div`
	width: 100%;
	height: 100%;
	.rdg-cell[aria-selected="true"] {
		background-color: transparent !important;
		outline: none;
	}

	.no-drag {
		user-select: none;          /* 표준 */
		-webkit-user-select: none;  /* Safari/Chrome */
		-moz-user-select: none;     /* Firefox (구형) */
		-ms-user-select: none;      /* IE/Edge (구형) */

		-webkit-user-drag: none;    /* 이미지 등 드래그 비허용 (WebKit) */}
`;