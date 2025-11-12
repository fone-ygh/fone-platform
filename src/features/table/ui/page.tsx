'use client';

import Table, { CellClickArgs, CellKeyboardEvent, CellKeyDownArgs, CellMouseEvent, Column, ColumnGroup, renderValue, RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { Button } from "fone-design-system_v1";
import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import React from "react";

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
  
  // ColumnGroup 타입에 dataType 필드를 추가하고 싶다면, ColumnGroup을 확장하는 방식으로 정의해야 합니다.
  // 하지만 ColumnOrColumnGroup은 유니언 타입(Column | ColumnGroup)이기 때문에 인터페이스에서 직접 확장할 수 없습니다.
  // 그러므로 ColumnGroup을 확장하세요.

  type ColumnOrColumnGroup<R, SR = unknown> = Column<R, SR> & { dataType?: string } | ColumnGroup<R, SR>;

  const useCellDragSelect =({ onSelectRect }: {
	onSelectRect: (
	  anchor: { rowIdx: number; idx: number },
	  curr: { rowIdx: number; idx: number },
	  additive: boolean
	) => void;
  }) => {
	const [dragging, setDragging] = React.useState(false);
	const [anchor, setAnchor] = React.useState<{ rowIdx: number; idx: number } | null>(null);
  
	React.useEffect(() => {
	  const up = () => setDragging(false);
	  window.addEventListener('mouseup', up);
	  return () => window.removeEventListener('mouseup', up);
	}, []);
  
	const bindCell = (rowIdx: number, idx: number) => ({
	  onMouseDown: (e: React.MouseEvent) => {
		if (e.button !== 0) return;
		setDragging(true);
		const a = { rowIdx, idx };
		setAnchor(a);
		onSelectRect(a, a, e.ctrlKey);
	  },
	  onMouseEnter: (e: React.MouseEvent) => {
		if (!dragging || !anchor) return;
		onSelectRect(anchor, { rowIdx, idx }, e.ctrlKey);
	  }
	});
  
	return { bindCell };
  }


const TablePage = () => {

	// mock Rows Data Example
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

	  // 사용: 각 컬럼의 renderCell 지정
	  const { bindCell } = useCellDragSelect({
		onSelectRect: (a, c) => {
			const r1 = Math.min(a.rowIdx, c.rowIdx);
			const r2 = Math.max(a.rowIdx, c.rowIdx);
			const c1 = Math.min(a.idx, c.idx);
			const c2 = Math.max(a.idx, c.idx);

			const flatColumns = flattenColumns(columns);

			if (pressedKey !== null) {
				return setSelectCells([
					...selectCells,
					{
						col: c1,
						row: r1,
						id: rows[r1]?.id,
						value:
							rows[r1]?.[flatColumns[c1].key as keyof Row] as unknown as string,
					},
				]);
			}

			// 먼저 기본 선택 범위 구하기
			let rowStart = r1;
			let rowEnd = r2;
			let colStart = c1;
			let colEnd = c2;

			// 드래그로 선택된 영역에 merged cell이 있다면, 그 merged 영역까지 범위를 확장
			if (mergedRanges && mergedRanges.length > 0) {
				// 드래그 셀 내에 포함된 모든 merged 영역 중 전체 범위를 포함시키는 가장 넓은 rectangle을 구한다
				mergedRanges.forEach((merge) => {
					const { startRow: mr, endRow: MR, startCol: mc, endCol: MC } = merge.range;
					// 만약 병합된 셀이 현재 영역에 겹치는 경우
					if (
						!(
							mr > rowEnd ||
							MR < rowStart ||
							mc > colEnd ||
							MC < colStart
						)
					) {
						// 선택범위 확장
						rowStart = Math.min(rowStart, mr);
						rowEnd = Math.max(rowEnd, MR);
						colStart = Math.min(colStart, mc);
						colEnd = Math.max(colEnd, MC);
					}
				});
			}

			const selectedCells: { col: number; row: number; id: string; value?: string }[] = [];

			for (let row = rowStart; row <= rowEnd; row++) {
				for (let col = colStart; col <= colEnd; col++) {
					const column = flatColumns[col];
					selectedCells.push({
						col,
						row,
						id: rows[row]?.id,
						value:
							typeof column?.key === 'string'
								? (rows[row]?.[column.key as keyof Row] as unknown as string)
								: undefined,
					});
				}
			}

			setSelectCells(selectedCells);
			return;
		}
	  });
	  
//

	const cellRenderer = (p: RenderCellProps<Row>, bindCell: (rowIdx: number, idx: number) => React.HTMLAttributes<HTMLDivElement>,) =>  {
		const colIdx = p.column?.idx as number | undefined;
		const value = p.row[p.column.key as keyof Row] as unknown as string;
		if (colIdx == null) return <span>{value}</span>;
		if (isInAnyMergedRange(p.rowIdx, colIdx) && !isTopLeftOfMergedRange(p.rowIdx, colIdx)) {
			return <span>{value}</span>;
		}
		const inRange = isInRange(p.rowIdx, colIdx);
		return <div className={`no-drag ${inRange ? 'rg-selected' : undefined}` } style={{ width: '100%', height: '100%' }} 
			{...bindCell(p.rowIdx, p.column.idx)}
		>
			{value}
		</div>
	;
};

	// mock Columns Data Example
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
			resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) 
		},
		{ key: "name", name: "Name" ,width: 100, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value11", name: "Value11" ,width: 100, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value12", name: "Value12" ,width: 200, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value13", name: "Value13" ,width: 300, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value3", name: "Value3" ,width: 100, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value31", name: "Value31" ,width: 100, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value4", name: "Value4" ,width: 100, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
		{ key: "value5", name: "Value5" ,width: 100, resizable: true, draggable: true, renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell) },
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

	const [columns, setColumns] = useState<ColumnOrColumnGroup<Row, unknown>[]>(baseColumns);

	const headerHeight = 35 * getMaxDepth(baseColumns);
	const rowHeight = 35;


    const [pressedKey, setPressedKey] = useState<string | null>(null);

    const [rows, setRows] = useState<Row[]>(initialRows);


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
    // 선택된 행 기준으로 추가 시, 선택 행에 merge된 셀이 있으면 해당 셀의 row 범위를 늘려줍니다.
    const addRow = () => {
        if (selectCells.length === 0) {
            setRows([...rows, { id: "new_" + (rows.length + 1), value11: "", value12: "", value13: "", value141: "", value142: "", value143: "" }]);
            setSelectCells([]);
            return;
        }

        const index = rows.findIndex(row => row.id === selectCells[0]?.id);
        const tempRows = [...rows];
        tempRows.splice(index, 0, { id: "new_" + (tempRows.length + 1), value11: "", value12: "", value13: "", value141: "", value142: "", value143: "" });

        // 선택된 행에 merge된 셀이 있는지 확인하고, 있다면 해당 mergedRanges의 row 범위(endRow)를 늘려줍니다.
        const affectedRowIdx = index;
        let newMergedRanges = mergedRanges.map(range => {
            // 범위에 영향이 있는지 확인 (즉, 행 추가 위치가 병합셀 범위 내인지)
            if (affectedRowIdx !== -1 && affectedRowIdx >= range.range.startRow && affectedRowIdx <= range.range.endRow) {
                // 병합 범위의 끝을 한 줄씩 뒤로 이동
                return {
                    ...range,
                    range: {
                        ...range.range,
                        endRow: range.range.endRow + 1
                    }
                };
            } else if (affectedRowIdx !== -1 && affectedRowIdx < range.range.startRow) {
                // 추가 위치가 병합 셀 위라면, startRow, endRow를 모두 한 줄씩 뒤로 이동
                return {
                    ...range,
                    range: {
                        ...range.range,
                        startRow: range.range.startRow + 1,
                        endRow: range.range.endRow + 1
                    }
                };
            }
            return range;
        });

        setRows(tempRows);
        setMergedRanges(newMergedRanges);
        setSelectCells([]);
    }

	// 선택한 로우 기준으로 행 삭제 / 여러줄 선택 시 모두 삭제
    // 선택된 행 기준으로 삭제 시, 선택 행에 merge된 셀이 있다면 셀의 row 범위 줄이기
    const deleteRow = () => {
        if (selectCells.length === 0) {
            const deleteRows = [...rows];
            deleteRows.pop();
            setRows(deleteRows);
            setSelectCells([]);
            return;
        }

        const tempRows = [...rows];
        const deleteIds = selectCells.map(cell => cell.id);
        // 삭제할 행의 인덱스 리스트
        const deleteRowIndexes = rows
            .map((row, idx) => ({ id: row.id, idx }))
            .filter(r => deleteIds.includes(r.id))
            .map(r => r.idx);

        // 행 삭제: 선택 셀(row)의 id 와 일치하지 않는 로우만 남긴다.
        const newRows = tempRows.filter((row) => !deleteIds.includes(row.id));

        // merge된 셀 관련 로직
        let newMergedRanges = mergedRanges.map(range => {
            let { startRow, endRow } = range.range;
            // 삭제될 row가 병합 셀 범위에 포함될 때, 범위를 줄임
            const deleteRowsInThisRange = deleteRowIndexes.filter(idx => idx >= startRow && idx <= endRow);
            if (deleteRowsInThisRange.length > 0) {
                // 병합된 범위를 줄여야 할 때
                // 삭제되는 로우 수 만큼 endRow를 줄임
                // 단, startRow와 endRow가 같아지는 순간(병합 셀이 1행이 되면) 범위를 유지 (추후 병합 해제는 별도)
                // 또한, 병합 셀의 범위가 완전히 사라질 경우도 처리 가능(해제)
                let newStartRow = startRow;
                let newEndRow = endRow;
                deleteRowsInThisRange.forEach(idx => {
                    // if (idx === newStartRow) {
                    //     // newStartRow += 1;
                    // }
                    newEndRow -= 1;
                });
                // 만약 삭제 후 범위가 역전되거나 사라지면, 이후 filter에서 걸러짐
                return {
                    ...range,
                    range: {
                        ...range.range,
                        startRow: newStartRow,
                        endRow: newEndRow
                    }
                }
            } else if (deleteRowIndexes.some(idx => idx < startRow)) {
                // 삭제 위치가 이 셀 위쪽에 있으면, 행 index를 앞으로 당긴다
                // 몇 개가 삭제됐는지 센 뒤 그 숫자만큼 줄여줌
                const shiftCount = deleteRowIndexes.filter(idx => idx < startRow).length;
                return {
                    ...range,
                    range: {
                        ...range.range,
                        startRow: startRow - shiftCount,
                        endRow: endRow - shiftCount
                    }
                }
            }
            return range;
        }).filter(range => (range.range.endRow >= range.range.startRow));

        setRows(newRows);
        setMergedRanges(newMergedRanges);
        setSelectCells([]);
    }


	// 선택한 셀 기준으로 병합되어 있는 셀이라면 병합 해제
    const cancelRow = () => {
        setMergedRanges(props => props.filter((range) => range.id !== selectCells[0]?.id));
        setSelectCells([]);
    }

	// 열 추가
	const addColumn = () => {
		console.log("selectCells : ", selectCells, columns);

		const newColumn: ColumnOrColumnGroup<Row, unknown> = {
			key: "new_" + (columns.length + 1),
			name: "New Column" + columns.length,
			width: 100,
			resizable: true,
			draggable: true,
			renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell)
		};

		let insertIdx = columns.length;
		let updatedMergedRanges = mergedRanges;

		if (selectCells.length > 0) {
			const flatCols = flattenColumns(columns);
			const selectedColIdx = selectCells[0].col;
			const currentRowIdx = selectCells[0].row;
			const currentColIdx = selectCells[0].col;

			insertIdx = Math.min(selectedColIdx + 1, flatCols.length);

			// 필수: 병합셀에 새로운 컬럼이 포함되도록 범위 조정
			updatedMergedRanges = mergedRanges.map((m) => {
				const { startCol, endCol } = m.range;
				const isSelectedCellInMerged =
					currentColIdx >= startCol &&
					currentColIdx <= endCol

				if (isSelectedCellInMerged) {
					// 만약 병합 셀이 선택한 셀을 포함하고 있고,
					// newColumn을 selectedColIdx와 selectedColIdx+1 사이에 넣으므로,
					// 이 병합 범위의 endCol을 +1씩 늘려주고,
					// 그리고 만약 newColumn이 merged cell 내부에 들어가야 하면, 즉 newCol이 startCol과 endCol 사이에 들어가는 위치면
					// 실제로 병합 범위가 늘어나지만 논리적으로 newColumn도 포함이므로 startCol~endCol+1로 변함
					return {
						...m,
						range: {
							...m.range,
							endCol: endCol + 1
						}
					};
				}
				// 선택 위치 오른쪽에 있는 병합 셀들의 인덱스 보정
				if (startCol > currentColIdx) {
					return {
						...m,
						range: {
							...m.range,
							startCol: startCol + 1,
							endCol: endCol + 1
						}
					};
				}
				return m;
			});
		}
		// else: 아무 셀도 선택 안 했으면, 기존 병합셀 보정 없음

		const flatCols = flattenColumns(columns);
		const newFlatCols = [
			...flatCols.slice(0, insertIdx),
			newColumn,
			...flatCols.slice(insertIdx)
		];

		const rebuildColumns = (colsArr: any[], colsStruct: any[]): any[] => {
			return colsStruct.map(colStruct => {
				if (colStruct.children && Array.isArray(colStruct.children) && colStruct.children.length > 0) {
					const children = rebuildColumns(colsArr, colStruct.children);
					return { ...colStruct, children };
				} else {
					const matching = colsArr.find(c => c.key === colStruct.key);
					return matching ? matching : colStruct;
				}
			});
		};

		let rebuiltColumns: ColumnOrColumnGroup<Row, unknown>[];
		if (
			columns.some(
				(col: ColumnOrColumnGroup<Row, unknown>) =>
					(col as ColumnGroup<Row, unknown>).children &&
					Array.isArray((col as ColumnGroup<Row, unknown>).children) &&
					(col as ColumnGroup<Row, unknown>).children.length > 0
			)
		) {
			rebuiltColumns = rebuildColumns(newFlatCols, columns);

			const rebuiltFlat = flattenColumns(rebuiltColumns).map(c => c.key);
			newFlatCols.forEach(c => {
				if (!rebuiltFlat.includes(c.key)) {
					rebuiltColumns.splice(insertIdx, 0, c);
				}
			});
		} else {
			rebuiltColumns = newFlatCols;
		}
		setColumns(rebuiltColumns);
		setMergedRanges(updatedMergedRanges);
		return;
	}

	// 열 삭제
	const deleteColumn = () => {
		if (!selectCells || selectCells.length === 0) return;

		const deletedColIdx = selectCells[0].col;
		console.log(deletedColIdx, "deletedColIdx");
		const newColumns = columns.filter((col, index) => index !== deletedColIdx);

		let newMergedRanges = mergedRanges.map(m => {
			let range = { ...m.range };

			// 만약 병합된 셀이 삭제되는 열보다 오른쪽(이후)에 있다면, col 위치를 -1 시켜준다.
			if (range.startCol > deletedColIdx) {
				range.startCol -= 1;
			}
			if (range.endCol > deletedColIdx) {
				range.endCol -= 1;
			}

			// 만약 삭제한 열이 병합된 셀 범위 안에 있다면(=셀 삭제로 병합 크기가 줄어듦), 병합 셀을 잘라낸다.
			if (range.startCol <= deletedColIdx && range.endCol >= deletedColIdx) {
				// 병합 길이가 1컬럼이면 병합 해제(즉, 삭제)
				if (range.startCol === range.endCol) {
					return null;
				}
				// 그렇지 않으면, endCol만 -1 (삭제한 열이 가장자리일 수도 있음)
				range.endCol -= 1;
				if (range.startCol === deletedColIdx) {
					range.endCol += 1;
				}
			}

			return { ...m, range };
		}).filter(Boolean); // null이면 병합 해제


		setColumns(newColumns);
		setMergedRanges(newMergedRanges as { id: string; mergeCellId: string; range: { startRow: number; endRow: number; startCol: number; endCol: number; }; value?: string | undefined; editMode?: boolean | undefined; }[]);
		return;
	}
    
	const flattenColumns = (cols: any[], parentKey?:string): any[] => {
		return cols.reduce((acc, col) => {
			if (col.children && Array.isArray(col.children) && col.children.length > 0) {
				return acc.concat(flattenColumns(col.children, col.key));
			} else {
				return acc.concat({ ...col, parentKey: parentKey });
			}
		}, []);
	};

	// key값을 받아서 children을 찾아서 해당 json 객체의 width 값을 변경
	// childten은 재귀적으로 찾아서 변경
	const changeColumnWidth = (idx: number, width: number) => {
		const fullColumns = flattenColumns(columns);

		const column = fullColumns[idx];
		if (column) {
			const setColumnWidthRecursive = (cols: ColumnOrColumnGroup<Row, unknown>[], targetKey: string, width: number): ColumnOrColumnGroup<Row, unknown>[] => {
				return cols.map((col: ColumnOrColumnGroup<Row, unknown>) => {
					if ((col as Column<Row, unknown>).key === targetKey) {
						return { ...col, width:width };
					} else if ((col as ColumnGroup<Row, unknown>).children && Array.isArray((col as ColumnGroup<Row, unknown>).children) && (col as ColumnGroup<Row, unknown>).children.length > 0) {
						return { ...col, children: setColumnWidthRecursive((col as ColumnGroup<Row, unknown>).children as ColumnOrColumnGroup<Row, unknown>[], targetKey, width) };
					} else {
						return col;
					}
				});
			};

			// parentKey와 key가 같은 컬럼에 width 값 변경
			const targetKey = column.key;
			return setColumnWidthRecursive(columns, targetKey, width);
		} else { 
			console.log("column not found");
		}
		return fullColumns;
	}


	// selectedCells와 mergedRanges(배열)이 하나라도 겹치면, 겹치는 범위들까지 모두 아우르는 사각형(최소 범위)을 반환
	// 만약 겹치는 것이 없다면 undefined 반환
	const isSelectedRangeIncludedInMergedRanges = (
		selectedCells: { startCol: number, endCol: number, startRow: number, endRow: number },
		mergedRanges: { startCol: number, endCol: number, startRow: number, endRow: number }[]
	) => {
		const sStartCol = Math.min(selectedCells.startCol, selectedCells.endCol);
		const sEndCol = Math.max(selectedCells.startCol, selectedCells.endCol);
		const sStartRow = Math.min(selectedCells.startRow, selectedCells.endRow);
		const sEndRow = Math.max(selectedCells.startRow, selectedCells.endRow);

		let included = false;
		let minCol = sStartCol;
		let maxCol = sEndCol;
		let minRow = sStartRow;
		let maxRow = sEndRow;

		for (const merged of mergedRanges) {
			const mStartCol = Math.min(merged.startCol, merged.endCol);
			const mEndCol = Math.max(merged.startCol, merged.endCol);
			const mStartRow = Math.min(merged.startRow, merged.endRow);
			const mEndRow = Math.max(merged.startRow, merged.endRow);

			const rowOverlap = !(sEndRow < mStartRow || sStartRow > mEndRow);
			const colOverlap = !(sEndCol < mStartCol || sStartCol > mEndCol);

			if (rowOverlap && colOverlap) {
				included = true;
				minCol = Math.min(minCol, mStartCol);
				maxCol = Math.max(maxCol, mEndCol);
				minRow = Math.min(minRow, mStartRow);
				maxRow = Math.max(maxRow, mEndRow);
				// 계속 돌면서 포함 범위를 계속 넓힘 (다수 병합 셀도 모두 포함하는 사각형)
			}
		}

		if (included) {
			return {
				startCol: minCol,
				endCol: maxCol,
				startRow: minRow,
				endRow: maxRow
			};
		}

		return undefined;
	};
		

    return (
        <TableContainer
            onKeyUp={() => {
                setPressedKey(null);
            }}
        >
            <div>
                <Button onClick={addRow}>
                    행추가
                </Button>
                <Button onClick={() => deleteRow()}>
                    행삭제
                </Button>
            </div>
			<div>
				<Button onClick={addColumn}>
					열추가
				</Button>
				<Button onClick={deleteColumn}>
					열삭제
				</Button>
			</div>
			<div style={{ position: 'relative' }}>
				<Table
					onScroll={(e) => {
						setScrollTop((e.target as HTMLElement).scrollTop);
					}}
					onCellContextMenu={(cells: CellClickArgs<Row, unknown>, event: CellMouseEvent) => {
						event.preventDefault();
					}}
					columns={columns.map(col => ({
						...col,
						// renderCell 재정의: 항상 최신 bindCell 사용!
						renderCell: (p: RenderCellProps<Row>) => cellRenderer(p, bindCell)
					}))}
					onColumnResize={(idx: number, width: number) => {
						setColumns(changeColumnWidth(idx, width));

						
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
							
							const includedMergedRanges = isSelectedRangeIncludedInMergedRanges({startCol: startCol0, startRow: startRow0, endCol: endCol0, endRow: endRow0}, mergedRanges.map((m) => m.range));
							console.log("includedMergedRanges : ", includedMergedRanges);
							if (includedMergedRanges !== undefined) {
								const { startCol:minCol, endCol:maxCol, startRow:minRow, endRow:maxRow } = includedMergedRanges as { startCol: number, endCol: number, startRow: number, endRow: number };
								
								const colStep = minCol <= maxCol ? 1 : -1;
								const rowStep = minRow <= maxRow ? 1 : -1;
								const startCol = minCol;
								const endCol = maxCol;
								const startRow = minRow;
								const endRow = maxRow;
								for (let col = startCol;  col <= endCol; col++) {
									for (let row = startRow; row <= endRow; row = row + rowStep) {
										const targetRow = rows[row];
										newSelectCells.push({
											col,
											row,
											id: targetRow?.id ?? selectCells[0].id,
											value: targetRow?.[(columns[col] as Column<Row, unknown>).key as keyof Row] as unknown as string ?? selectCells[0].value
										});
									}
								}
								return setSelectCells(newSelectCells);
							}

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
									background: '#1d1d1d', 
									border: 
										selectCells.some(c => c.col === m.range.startCol && c.row === m.range.startRow) ? '2px solid #0078d4' : '1px solid #444', 
									boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 
								}}
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
								{...bindCell(m.range.startRow, m.range.startCol)}
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
				<Button onClick={mergeSelection}>셀병합</Button>
				<Button onClick={cancelRow}>병합해제</Button>
				<Button onClick={clearMerges}>초기화</Button>
            </div>

			<hr />
			<br/>
			<h1>체크 리스트</h1>
			<div style={{ display: 'flex', gap: '20px', width: '40%', justifyContent: 'space-between' }}>
				<section>
					<h3>가능한 기능</h3>
					<ul>
						<li>✔️ 행추가</li>
						<li>✔️ 행삭제</li>
						<li>✔️ 열추가</li>
						<li>✔️ 열삭제</li>
						<li>✔️ 셀병합</li>
						<li>✔️ 셀병합해제</li>
						<li>✔️ 초기화</li>
					</ul>
				</section>
				<section>
					<h3>상황</h3>
					<ul>
						<li>✔️ 셀 다중 선택 가능(shift, ctrl 키 사용 / 드래그 가능)</li>
						<li>✔️ 병합한 셀을 포함한 셀 선택 시 병합한 셀의 크기만큼 자동 범위 선택</li>
						<li>✔️ 병합한 셀을 포함한 행/열 추가 / 삭제 가능</li>
					</ul>
				</section>
			</div>
			<br/>
			<div>
				<h3>기능 리스트</h3>
				<Button>행추가</Button>
				<Button>행삭제</Button>
				<Button>열추가</Button>
				<Button>열삭제</Button>
				<Button>셀병합</Button>
				<Button>셀병합해제</Button>
			</div>
			<div>
				<h3>속성 리스트</h3>
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