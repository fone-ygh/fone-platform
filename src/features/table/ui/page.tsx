'use client';

import { CellClickArgs, CellKeyboardEvent, CellKeyDownArgs, CellMouseEvent, Column, ColumnGroup, renderValue, RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { CustomColumnOrColumnGroup, CustomCalculatedColumn, CustomColumn } from "../interface/type";
import { Button, Checkbox, Select, TextField2 } from "fone-design-system_v1";
import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import React from "react";
import TableComponent from "./Table";
import { SelectCellsStore, useSelectCellsActions, useSelectCellsStore } from "../store/selectCellsStore";
import { useMergeCellsActions, useMergeCellsStore } from "../store/mergeCellsStore";
import { MergedRange } from "../interface/type";
import AntdTable from "./AntdTable";
import JspreadSheet from "./JspreadSheet";


type Row = Record<string, unknown>;


  
  // ColumnGroup 타입에 dataType 필드를 추가하고 싶다면, ColumnGroup을 확장하는 방식으로 정의해야 합니다.
  // 하지만 ColumnOrColumnGroup은 유니언 타입(Column | ColumnGroup)이기 때문에 인터페이스에서 직접 확장할 수 없습니다.
  // 그러므로 ColumnGroup을 확장하세요.



const TablePage = () => {

	// mock Rows Data Example
	const initialRows: Row[] = [];

	// const [selectCells, setSelectCells] = useState<{col: number, row: number, id: string, value?: string, scrollTop?: number}[]>([]);
	// const [mergedRanges, setMergedRanges] = useState<{ id: string; mergeCellId: string; range: { startRow: number; endRow: number; startCol: number; endCol: number }; value?: string; editMode?: boolean }[]>([]);

	const { selectCells } = useSelectCellsStore();
	const { setSelectCells } = useSelectCellsActions();
	const { mergedRanges } = useMergeCellsStore();
	const { setMergedRanges } = useMergeCellsActions();


	// mock Columns Data Example
	// const baseColumns: CustomColumnOrColumnGroup<Row, unknown>[] = [
	// 	{ key: "id", name: "ID" ,width: 100, type:"number",
	// 		renderEditCell: (props: RenderEditCellProps<Row>) =>  
	// 			<input type="text" style={{ width: "100%", height: "100%" }}
	// 				value={String((props.row[props.column.key as keyof Row] ?? "") as unknown)}
	// 				onChange={(event) => props.onRowChange({ ...props.row, [props.column.key]: event.target.value as unknown as string } as unknown as Row)}
	// 				onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
	// 					props.onClose(true, false);
	// 					setRows(rows.map((r) => r.id === props.row.id ? { ...r, [props.column.key]: event.target.value as unknown as string } : r));
	// 				}}
	// 				onKeyDown={(e) => {
	// 					if (e.key === "Enter") {
	// 						props.onClose(true, false);
	// 					}
	// 				}}
	// 			/>,
	// 		resizable: true, draggable: true
	// 	},
	// 	{ key: "name", name: "Name" ,width: 100, resizable: true, draggable: true,  },
	// 	{ key: "value11", name: "Value11" ,width: 100, resizable: true, draggable: true,  },
	// 	{ key: "value12", name: "Value12" ,width: 200, resizable: true, draggable: true,  },
	// 	{ key: "value13", name: "Value13" ,width: 300, resizable: true, draggable: true,  },
	// 	{ key: "value3", name: "Value3" ,width: 100, resizable: true, draggable: true,  },
	// 	{ key: "value31", name: "Value31" ,width: 100, resizable: true, draggable: true,  },
	// 	{ key: "value4", name: "Value4" ,width: 100, resizable: true, draggable: true,  },
	// 	{ key: "value5", name: "Value5" ,width: 100, resizable: true, draggable: true,  },
    // ];



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


	const [columns, setColumns] = useState<CustomColumnOrColumnGroup<Row>[]>([]);


    const [rows, setRows] = useState<Row[]>([]);
	const [cellTypeOverrides, setCellTypeOverrides] = useState<Record<string, CustomColumn<Row>['type']>>({});


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
			if (rowId != null) setMergedRanges([...mergedRanges, { id: rowId as string, mergeCellId: rowId + "_" + startCol + "_" + endCol, range: { startRow, endRow, startCol, endCol }, value: selectCells[0]?.value }]);
		}
		setMergedRanges([...mergedRanges, { id: selectCells[0]?.id as string, mergeCellId: selectCells[0]?.id + "_" + startCol + "_" + endCol, range: { startRow, endRow, startCol, endCol }, value: selectCells[0]?.value }]);
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
			const newRow: Record<string, string> = columns.reduce((acc: Record<string, string>, col: any) => {
				acc[col.key as string] = "";
				return acc;
			}, {id:"new_" + (rows.length + 1) as string});
            setRows([...rows, newRow]);
            setSelectCells([]);
            return;
        }

        const index = rows.findIndex(row => row.id === selectCells[0]?.id);
        const tempRows = [...rows];
        const newRow: Record<string, string> = columns.reduce((acc: Record<string, string>, col: any) => {
            acc[col.key as string] = "";
            return acc;
        }, {id:"new_" + (tempRows.length + 1) as string});
        tempRows.splice(index, 0, newRow);

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
            .filter(r => deleteIds.includes(r.id as string))
            .map(r => r.idx);

        // 행 삭제: 선택 셀(row)의 id 와 일치하지 않는 로우만 남긴다.
        const newRows = tempRows.filter((row) => !deleteIds.includes(row.id as string));

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
        setMergedRanges(mergedRanges.filter((range: MergedRange) => range.id !== selectCells[0]?.id));
        setSelectCells([]);
    }

	// 열 추가
	const addColumn = () => {
		console.log("columns : ", columns)
		console.log("selectCelss : ", selectCells)
		const randomKey = "new_" + new Date().getTime() + "_" + columns.length;
		const newColumn: CustomColumn<Row> = {
			key: randomKey,
			name: (columns.length + 1).toString(),
			width: 100,
			resizable: true,
			draggable: true,
			editable: true,
			type:"input"
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

		let rebuiltColumns: CustomColumnOrColumnGroup<Row, unknown>[];
		if (
			columns.some(
				(col: CustomColumnOrColumnGroup<Row, unknown>) =>
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

		// 현재 상태가 Header 편집 기능일 경우 name을 순서대로 1,2,3,4... 로 변경
		// 지금은 헤더 편집 기능이므로 항상 변경 중 / 추후 헤더 편집 기능 분리 시 수정 필요
		rebuiltColumns = rebuiltColumns.map((col, index) => {
			return { ...col, name: (index + 1).toString() };
		});
		

		setColumns(rebuiltColumns);
		setMergedRanges(updatedMergedRanges);
		return;
	}

	// 열 삭제
	const deleteColumn = () => {
		if (!selectCells || selectCells.length === 0) return;

		const deletedColIdx = selectCells[0].col;
		console.log(deletedColIdx, "deletedColIdx");
		// 현재 상태가 Header 편집 기능일 경우 name을 순서대로 1,2,3,4... 로 변경
		// 지금은 헤더 편집 기능이므로 항상 변경 중 / 추후 헤더 편집 기능 분리 시 수정 필요
		const newColumns = columns.filter((col, index) => index !== deletedColIdx).map((col, index) => {
			return { ...col, name: (index + 1).toString() };
		});

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

	console.log("selectCells : ", selectCells)


    return (
        <TableContainer>
			{/* <div style={{ display: 'flex', gap: '20px', width: '70%', justifyContent: 'space-between' }}>
				<div>
					<div>
						<p>행 추가 / 삭제</p>
						<Button onClick={addRow}>
							행추가
						</Button>
						<Button onClick={() => deleteRow()}>
							행삭제
						</Button>
					</div>
					<div>
						<p>열 추가 / 삭제</p>
						<Button onClick={addColumn}>
							열추가
						</Button>
						<Button onClick={deleteColumn}>
							열삭제
						</Button>
					</div>
					<div>
						<p>셀 삽입 (Input Text, Button, Select, Checkbox, Date)</p>
						<Button onClick={() => {
							const target = selectCells[0];
							const rowId = (target?.rowData as any)?.id as string | undefined;
							const columnKey = target?.columnData?.key as string | undefined;
							if (rowId && columnKey) {
								const mapKey = `${rowId}__${columnKey}`;
								setCellTypeOverrides(prev => ({ ...prev, [mapKey]: "input" }));
							}
						}}>
							Input Text 삽입
						</Button>
						<Button onClick={() => {
							const target = selectCells[0];
							const rowId = (target?.rowData as any)?.id as string | undefined;
							const columnKey = target?.columnData?.key as string | undefined;
							if (rowId && columnKey) {
								const mapKey = `${rowId}__${columnKey}`;
								setCellTypeOverrides(prev => ({ ...prev, [mapKey]: "button" }));
							}
						}}>
							Button 삽입
						</Button>
						<Button onClick={() => {
							const target = selectCells[0];
							const rowId = (target?.rowData as any)?.id as string | undefined;
							const columnKey = target?.columnData?.key as string | undefined;
							if (rowId && columnKey) {
								const mapKey = `${rowId}__${columnKey}`;
								setCellTypeOverrides(prev => ({ ...prev, [mapKey]: "select" }));
							}
						}}>
							Select 삽입
						</Button>
						<Button onClick={() => {
							const target = selectCells[0];
							const rowId = (target?.rowData as any)?.id as string | undefined;
							const columnKey = target?.columnData?.key as string | undefined;
							if (rowId && columnKey) {
								const mapKey = `${rowId}__${columnKey}`;
								setCellTypeOverrides(prev => ({ ...prev, [mapKey]: "checkbox" }));
							}
						}}>
							Checkbox 삽입
						</Button>
						<Button onClick={() => {
							const target = selectCells[0];
							const rowId = (target?.rowData as any)?.id as string | undefined;
							const columnKey = target?.columnData?.key as string | undefined;
							if (rowId && columnKey) {
								const mapKey = `${rowId}__${columnKey}`;
								setCellTypeOverrides(prev => ({ ...prev, [mapKey]: "date" }));
							}
						}}>
							Date 삽입
						</Button>
					</div>
				</div>
				<div>
					<p>설정값 셋팅</p>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
						<div>
							<p>key 설정</p>
							<TextField2 type="text" value={selectCells[0]?.columnData?.key ?? ""} onChange={(e) => {
								setSelectCells(selectCells.map((cell: any) => cell.id === selectCells[0]?.id ? { ...cell, columnData: { ...cell.columnData, key: e.target.value } } : cell));
								setColumns(columns.map((col: any) => col.key === selectCells[0]?.columnData?.key ? { ...col, key: e.target.value } : col));
							}} />
						</div>
						<div>
							<p>title 설정</p>
							<TextField2 type="text" value={selectCells[0]?.value ?? ""} onChange={(e) => {
								console.log(selectCells[0])
								setSelectCells(selectCells.map((cell: any) => cell.id === selectCells[0]?.id ? { ...cell, value: e.target.value } : cell));
								setRows(rows.map((row: any) => row.id === selectCells[0]?.rowData?.id ? { ...row, [selectCells[0]?.columnData?.key as string]: e.target.value } : row));
							}} />
						</div>
						<div>
							<p>width 설정</p>
							<TextField2 type="number" onChange={(e) => {}} />
						</div>
						<div>
							<p>height 설정</p>
							<TextField2 type="number" onChange={(e) => {}} />
						</div>
						<div>
							<p>resizable 설정</p>
							<Checkbox  onChange={(e) => {}} />
						</div>
						<div>
							<p>draggable 설정</p>
							<Checkbox  onChange={(e) => {}} />
						</div>
						<div>
							<p>type 설정</p>
							<Select MenuItems={[{label: "input", value: "input"}, {label: "button", value: "button"}, {label: "select", value: "select"}, {label: "checkbox", value: "checkbox"}, {label: "date", value: "date"}]} 
								value={""} 
								onChange={(e: any) => {
									console.log("e : ", e);
									// setColumns(columns.map((col) => insertColumnType(e.target.value, col.key, col as CustomColumn<Row>)))
								}} />
						</div>
						
					</div>
					
				</div>
				<div>
					<p>선택한 셀의 속성</p>
					<div>
						<p>key : <span>{selectCells[0]?.columnData?.key}</span></p>
						<p>title : <span>{selectCells[0]?.columnData?.name}</span></p>
						<p>width : <span>{selectCells[0]?.columnData?.width}</span></p>
						<p>resizable : <span>{selectCells[0]?.columnData?.resizable ? "true" : "false"}</span></p>
						<p>draggable : <span>{selectCells[0]?.columnData?.draggable ? "true" : "false"}</span></p>
						<p>type : <span>{selectCells[0]?.type ??  "none"}</span></p>
					</div>
				</div>

			</div> */}

			<div style={{ position: 'relative',  }}>
				{/* <AntdTable /> */}
				<JspreadSheet />
				{/* <TableComponent
					setColumns={setColumns}
					columns={columns}
					// onSelectedRowsChange={undefined}
					rows={rows as Row[]}
					setRows={setRows}
					cellTypeOverrides={cellTypeOverrides}
				/> */}
			</div>
            {/* <div>
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
			</div> */}
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