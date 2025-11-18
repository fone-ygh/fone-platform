import React, { useCallback, useState } from 'react'
import Table, { CellClickArgs, CellKeyboardEvent, CellKeyDownArgs, CellMouseEvent, Column, ColumnGroup, renderValue, RenderCellProps, RenderEditCellProps, ColumnOrColumnGroup } from "react-data-grid";
import { isInAnyMergedRange, isTopLeftOfMergedRange, useMergeCellsActions, useMergeCellsStore } from '../store/mergeCellsStore';
import { useSelectCellsActions, useSelectCellsStore } from '../store/selectCellsStore';
import { flattenColumns, getMaxDepth } from '../util/tableUtil';
import { CustomRenderEditCellProps, MergedRange, CustomColumnOrColumnGroup, CustomRenderCellProps, CustomColumn } from '../interface/type';
import { Button, Checkbox, DatePicker, Select } from 'fone-design-system_v1';
import { Dayjs } from 'dayjs';

interface TableProps<T> {
    rows: T [];
    setRows?: (rows: T[]) => void;
    columns: CustomColumnOrColumnGroup<T>[];
    setColumns?: (columns: CustomColumnOrColumnGroup<T, unknown>[]) => void;
    rowHeight?: number;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    onCellContextMenu?: (cells: CellClickArgs<T, unknown>, event: CellMouseEvent) => void;
    onColumnResize?: (idx: number, width: number) => void;
    onSelectedRowsChange?: (selectedRows: T[]) => void;
    onCellKeyDown?: (cells: CellKeyDownArgs<T, unknown>, event: CellKeyboardEvent) => void;
    onCellClick?: (cells: CellClickArgs<T, unknown>, event: CellMouseEvent) => void;
    cellTypeOverrides?: Record<string, CustomColumn<T>['type']>;
}


const TableComponent = <T,>(props: TableProps<T>) => {
    const { rows, columns, setColumns, setRows, rowHeight = 35, cellTypeOverrides } = props;

    const { mergedRanges } = useMergeCellsStore();
    const { setMergedRanges } = useMergeCellsActions();
    const { selectCells } = useSelectCellsStore();
    const { setSelectCells } = useSelectCellsActions();


    // 스크롤 위치 관리
    const [scrollTop, setScrollTop] = useState<number>(0);
    	  
    const [pressedKey, setPressedKey] = useState<string | null>(null);

    const headerHeight = rowHeight * getMaxDepth<T>(columns);

    const isInRange = useCallback((rowIdx: number, colIdx: number) => {
        return selectCells.some((cell) => cell.col === colIdx && cell.row === rowIdx);
    }, [selectCells]);

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
          const down = (e: KeyboardEvent) => {
            if(e.key === "Escape") {
                setDragging(false);
                setAnchor(null);
                setSelectCells([]);
                return;
            }
          }
          window.addEventListener('mouseup', up);
          window.addEventListener('keydown', down); 
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

      
      // 여기서 col의 타입 또는 override 타입을 체크해서 타입에 맞는 컴포넌트를 return 해준다.
	const cellRenderer = (p: CustomRenderCellProps<T, unknown>, bindCell: (rowIdx: number, idx: number) => React.HTMLAttributes<HTMLDivElement>,) =>  {
		const colIdx = p.column?.idx as number | undefined;
		const value = p.row[p.column.key as keyof T] as string;
        const mapKey = `${(p.row as unknown as { id?: string })?.id ?? ''}__${String(p.column.key)}`;
        const effectiveType = (cellTypeOverrides?.[mapKey] ?? p.column.type) as CustomColumn<T>['type'] | undefined;
        switch (effectiveType) {
            case "button":
                return <Button>Button</Button>;
            case "checkbox":
                return <Checkbox/>;
            case "date":
                return <DatePicker value={value as unknown as Dayjs} onChange={(e: any) => p.onRowChange({ ...p.row, [p.column.key]: e.target.value as unknown as Dayjs } as unknown as T)} />;
            case "select":
                return <Select sx={{ width: "100%", height: "100%", color:"white" }} MenuItems={[
                    {label: "Option 1", value: "option1"},
                    {label: "Option 2", value: "option2"},
                    {label: "Option 3", value: "option3"},
                ]} value={value} onChange={(e) => p.onRowChange({ ...p.row, [p.column.key]: e.target.value as unknown as string } as unknown as T)} />;
        }
        
		if (p == null) return <span>{value}</span>;
		if (isInAnyMergedRange(mergedRanges, p.rowIdx, colIdx!) && !isTopLeftOfMergedRange(mergedRanges, p.rowIdx, colIdx!)) {
			return <span>{value}</span>;
		}
		const inRange = isInRange(p.rowIdx, colIdx!);
		return <div className={`no-drag ${inRange ? 'rg-selected' : undefined}` } style={{ width: '100%', height: '100%' }} 
			{...bindCell(p.rowIdx, p.column.idx)}
		>
			{value}
		</div>
	;
};

    const renderEditCell = (p: CustomRenderEditCellProps<T, unknown>, bindCell: (rowIdx: number, idx: number) => React.HTMLAttributes<HTMLDivElement>,) => {
        const value = String((p.row[p.column.key as keyof T] ?? "") as unknown as string);
        const mapKey = `${(p.row as unknown as { id?: string })?.id ?? ''}__${String(p.column.key)}`;
        const effectiveType = (cellTypeOverrides?.[mapKey] ?? p.column.type) as CustomColumn<T>['type'] | undefined;
        if (effectiveType === "date") {
            return <DatePicker value={value as unknown as Dayjs} onChange={(e: any) => p.onRowChange({ ...p.row, [p.column.key]: e.target.value as unknown as Dayjs } as unknown as T)} />;
        }
        if (effectiveType === "select") {
            return <Select sx={{ width: "100%", height: "100%", color:"white" }} MenuItems={[
                {label: "Option 1", value: "option1"},
                {label: "Option 2", value: "option2"},
                {label: "Option 3", value: "option3"},
            ]} value={value} onChange={(e) => p.onRowChange({ ...p.row, [p.column.key]: e.target.value as unknown as string } as unknown as T)} />;
        }
        if (effectiveType === "input" || effectiveType === "number") {
            return <input type="text" style={{ width: "100%", height: "100%" }} {...bindCell(p.rowIdx, p.column.idx)}
                value={value}
                onChange={(e) => p.onRowChange({ ...p.row, [p.column.key]: e.target.value as unknown as string } as unknown as T)} 
                onBlur={(e) => {
                    p.onClose(true, false);
                    setRows?.(rows.map((r: T) => (r as unknown as { id: string })?.id === (p.row as unknown as { id: string })?.id ? { ...r, [p.column.key]: e.target.value as unknown as string } : r));
                }} onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        p.onClose(true, false);
                    }
                }} />;
        }
        // 편집 대상이 아니면 읽기 전용 표시
        return <div style={{ width: "100%", height: "100%" }} {...bindCell(p.rowIdx, p.column.idx)}>{value}</div>;
    }


    // 사용: 각 컬럼의 renderCell 지정
    const { bindCell } = useCellDragSelect({
    onSelectRect: (a, c) => {
        const r1 = Math.min(a.rowIdx, c.rowIdx);
        const r2 = Math.max(a.rowIdx, c.rowIdx);
        const c1 = Math.min(a.idx, c.idx);
        const c2 = Math.max(a.idx, c.idx);

        const flatColumns = flattenColumns<T>(columns);
        const key = (flatColumns[c1] as Column<T, unknown>).key as keyof T;
        const mapKey = `${(rows[r1] as unknown as { id?: string })?.id ?? ''}__${String(key)}`;
        if (pressedKey !== null) {
            return setSelectCells([
                ...selectCells,
                {
                    col: c1,
                    row: r1,
                    id: (rows[r1] as T & { id: string })?.id,
                    value:
                        (rows[r1] as T)?.[key] as unknown as string,
                    type: cellTypeOverrides?.[mapKey] ?? (flatColumns[c1] as CustomColumn<T>).type,
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

        const selectedCells: { col: number; row: number; id: string; value?: string; rowData?: T; columnData?: Column<T, unknown> }[] = [];

        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                const column = flatColumns[col];
                selectedCells.push({
                    col,
                    row,
                    id: (rows[row] as T & { id: string })?.id,
                    value:
                        (rows[row] as T)?.[(column as Column<T & { id: string, key: string }, unknown>).key as keyof T] as unknown as string,
                    rowData: rows[row] as T,
                    columnData: column as Column<T, unknown>,
                    });
            }
        }

        setSelectCells(selectedCells);
        return;
    }
    });

    	// key값을 받아서 children을 찾아서 해당 json 객체의 width 값을 변경
	// childten은 재귀적으로 찾아서 변경
	const changeColumnWidth = (idx: number, width: number) => {
		const fullColumns = flattenColumns<T>(columns);

		const column = fullColumns[idx];
		if (column) {
			const setColumnWidthRecursive = (cols: ColumnOrColumnGroup<T, unknown>[], targetKey: string, width: number): ColumnOrColumnGroup<T, unknown>[] => {
				return cols.map((col: ColumnOrColumnGroup<T, unknown>) => {
					if ((col as Column<T, unknown>).key === targetKey) {
						return { ...col, width:width };
					} else if ((col as ColumnGroup<T, unknown>).children && Array.isArray((col as ColumnGroup<T, unknown>).children) && (col as ColumnGroup<T, unknown>).children.length > 0) {
						return { ...col, children: setColumnWidthRecursive((col as ColumnGroup<T, unknown>).children as ColumnOrColumnGroup<T, unknown>[], targetKey, width) };
					} else {
						return col;
					}
				});
			};

			// parentKey와 key가 같은 컬럼에 width 값 변경
			const targetKey = (column as Column<T, unknown>).key as keyof T;
			return setColumnWidthRecursive(columns, targetKey as string, width);
		} else { 
			console.log("column not found");
		}
		return fullColumns;
	}

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

    const getColWidth = (col: ColumnOrColumnGroup<T, unknown> | undefined): number => {
		if (!col) return 100;
		const w = (col as any).width as unknown;
		if (typeof w === 'number') return w;
		if (typeof w === 'string') {
			const n = parseFloat(w);
			return Number.isFinite(n) ? n : 100;
		}
		return 100;
	};

    console.log("columns : ", columns);

	return (
        <div onKeyUp={() => setPressedKey(null)}>
            <Table
                onScroll={(e) => {
                    setScrollTop((e.target as HTMLElement).scrollTop);
                }}
                onCellContextMenu={(cells: CellClickArgs<T, unknown>, event: CellMouseEvent) => {
                    event.preventDefault();
                }}
                // ColumnType 타입 체크 type을 넣어줘야 한다.
                columns={columns.map((col: ColumnOrColumnGroup<T, unknown> & { type?: string }) => ({
                    ...col,
                    // renderCell 재정의: 항상 최신 bindCell 사용!
                    renderCell: (col as Column<T, unknown>)?.renderCell ? (col as Column<T, unknown>)?.renderCell : (p: RenderCellProps<T, unknown>) => cellRenderer(p, bindCell),
                    // per-cell override를 지원하므로 항상 renderEditCell을 제공하고 내부에서 타입 분기
                    renderEditCell: (p: CustomRenderEditCellProps<T, unknown>) => renderEditCell(p, bindCell)
                }))}
                onColumnResize={(idx: number, width: number) => {
                    setColumns?.(changeColumnWidth(idx, width) as CustomColumnOrColumnGroup<T, unknown>[]);
                }}
                onSelectedRowsChange={undefined}
                rows={rows}
                rowHeight={rowHeight}
                onCellKeyDown={(cells: CellKeyDownArgs<T, unknown>, event: CellKeyboardEvent) => {
                    if (event.key === "Control") {
                        setPressedKey("Control");
                        return
                    }
                    if(event.key === "Shift") {
                        setPressedKey("Shift");
                        return
                    }
                    
                    setPressedKey(null);
                }}
                
                onCellClick={(cell: CellClickArgs<T, unknown>, event: CellMouseEvent) => {
                    const colIdx = cell?.column?.idx as number | undefined;
                    const rowIdx = rows.findIndex((row) => (row as T & { id: string })?.id === (cell.row as T & { id: string })?.id);
                    if (colIdx == null || rowIdx == null) return;
                    if(pressedKey === "Control") {
                        return setSelectCells([...selectCells, {col: colIdx, row: rowIdx, id: (cell.row as T & { id: string })?.id, value: cell.row[cell.column.key as keyof T] as unknown as string}])
                    }	
                    if(pressedKey === "Shift") {
                        if(selectCells.length === 0) {
                            setSelectCells([{col: colIdx, row: rowIdx, id: (cell.row as T & { id: string })?.id, value: cell.row[cell.column.key as keyof T] as unknown as string}])
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
                                        id: (targetRow as T & { id: string })?.id ?? selectCells[0].id,
                                        value: targetRow?.[(columns[col] as Column<T, unknown>).key as keyof T] as unknown as string ?? selectCells[0].value
                                    });
                                }
                            }
                            return setSelectCells(newSelectCells);
                        }

                        const colStep = startCol0 <= endCol0 ? 1 : -1;
                        const rowStep = startRow0 <= endRow0 ? 1 : -1;
                        console.log("selectCells[0].value : ", selectCells[0].value)
                        
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
                                newSelectCells.push({ col: i, row: j, id: selectCells[0].id, value: selectCells[0].value ?? ""});
                            }
                        }
                        return setSelectCells(newSelectCells)
                    }
                    console.log(cell)
                    const selectKey = "new_" + rowIdx + "_" + colIdx;
                    const mapKey = `${(cell.row as unknown as { id?: string })?.id ?? ''}__${String(cell.column.key)}`;
                    setSelectCells([
                        {
                            col: colIdx, 
                            row: rowIdx, 
                            id: selectKey, 
                            // value: cell.row[cell.column.key as keyof T] as unknown as string,
                            value: cell.row[cell.column.key as keyof T] as unknown as string ?? "",  
                            rowData: cell.row as T,
                            columnData: columns[colIdx] as Column<T, unknown>,
                            type: cellTypeOverrides?.[mapKey] ?? (columns[colIdx] as CustomColumn<T>).type,
                        }
                    ])
                    
                }}
            />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', top:`${headerHeight}px`, height:`calc(100% - ${headerHeight}px)` }}>
                {/* mergedRanges 범위를 표시 / 추후에 컴포넌트로 분리 예정*/}
                {mergedRanges.map((m, i) => {
                    const getX = (c: number) => flattenColumns(columns).slice(0, c).reduce((acc, col) => acc + getColWidth(col), 0);
                    const getW = (s: number, e: number) => flattenColumns(columns).slice(s, e + 1).reduce((acc, col) => acc + getColWidth(col), 0);
                    const left = getX(m.range.startCol);
                    const top =  m.range.startRow * rowHeight! - (scrollTop);
                    const width = getW(m.range.startCol, m.range.endCol);
                    const height = (m.range.endRow - m.range.startRow + 1) * rowHeight!;
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
                                    return setSelectCells([...selectCells, {col: m.range.startCol, row: m.range.startRow, id: (rows[m.range.startRow] as T & { id: string })?.id}]);
                                }
                                if(pressedKey === "Control") {
                                    return setSelectCells([...selectCells, {col: m.range.startCol, row: m.range.startRow, id: (rows[m.range.startRow] as T & { id: string })?.id}]);
                                }
                                // gridRef.current?.selectCell({ rowIdx: 0, idx: 0 }, false);
                                setSelectCells([{col: m.range.startCol, row: m.range.startRow, id: (rows[m.range.startRow] as T & { id: string })?.id}]);
                            }}
                            onDoubleClick={(e) => {
                            	// 더블 클릭 시 편집 모드로 전환
                            	e.preventDefault();
                            	setMergedRanges(mergedRanges.map((m1: any, i1: number) => i === i1 ? { ...m, editMode: true } : m1));
                            }}
                            {...bindCell(m.range.startRow, m.range.startCol)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if(e.key === "Enter") {
                                    setMergedRanges(mergedRanges.map((m1: MergedRange, i1: number) => i === i1 ? { ...m, editMode: true } : m1));
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
                                        setMergedRanges(mergedRanges.map((m1: MergedRange, i1: number) => i === i1 ? { ...m, value: e.target.value } : m1));
                                    }}
                                    onBlur={(e) => {
                                        setMergedRanges(mergedRanges.map((m1: MergedRange, i1: number) => i === i1 ? { ...m, value: e.target.value, editMode: false } : m1));
                                    }}
                                    onKeyDown={(e) => {
                                        if(e.key === "Enter") {
                                            setMergedRanges(mergedRanges.map((m1: MergedRange, i1: number) => i === i1 ? { ...m, value: e.currentTarget.value, editMode: true } : m1));
                                        }
                                    }}
                                />
                            ) : (
                                <div className="no-drag" >{m.value ?? ''}</div>
                            )}
                        </div>
                    );
                })}
                {/* selectCells 범위를 표시 / 추후에 컴포넌트로 분리 예정*/}
                {selectCells.map((c, i) => {
                    // flatten children of columns into a single flat array
                    const flatColumns = flattenColumns(columns); 
                    const left = flatColumns.slice(0, c.col).reduce((acc, col) => acc + getColWidth(col), 0);
                    const top = (c.row * rowHeight!) - scrollTop;
                    const width = getColWidth(flatColumns[c.col] as ColumnOrColumnGroup<T, unknown>);
                    const height = rowHeight;
                    return <div key={`sel-${i}`} className="no-drag" style={{ position: 'absolute', left, top, width, height,  border: '2px solid rgb(0, 91, 160)', boxSizing: 'border-box' }} />
                })}
            </div>
        </div>
	)
}

export default TableComponent;