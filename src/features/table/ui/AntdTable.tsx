import React from 'react'
import { Button, ConfigProvider, Table } from 'antd'
import { ColumnsType } from 'antd/es/table';
import styled from '@emotion/styled';
import { Button as DSButton, Select as DSSelect, Checkbox as DSCheckbox, DatePicker as DSDatePicker } from 'fone-design-system_v1';
import dayjs from 'dayjs';

// Cell 스타일 컴포넌트
const StyledCell = styled.div<{ background: string }>`
    padding: 12px;
    height: 100%;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    background: ${({ background }) => background};
    transition: background 0.15s;
    cursor: pointer;  
    user-select: none;
    &:hover {
        background: #e6f7ff;
    }
`;

type CellPosition = { row: number, col: number };

type MergedRange = { 
    // 병합 시작과 끝 위치
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number
}

type CellWidgetType = 'button' | 'select' | 'checkbox' | 'date';

const AntdTable = () => {

    const [columns, setColumns] = React.useState<{ dataIndex: string; key: string; title: string }[]>([]);
	const [dataSource, setDataSource] = React.useState<any[]>([]);

	const [selectedCells, setSelectedCells] = React.useState<CellPosition[]>([]);
	const [mergedRanges, setMergedRanges] = React.useState<MergedRange[]>([]);
	const [editingCell, setEditingCell] = React.useState<CellPosition | null>(null);
	const editingInputRef = React.useRef<HTMLInputElement | null>(null);
	const [cellWidgets, setCellWidgets] = React.useState<Record<string, CellWidgetType>>({});
	// 드래그 선택 관련 ref
	const dragStartRef = React.useRef<CellPosition | null>(null);
	const isDraggingRef = React.useRef<boolean>(false);
	const didDragRef = React.useRef<boolean>(false);
	// Shift 범위 선택용 앵커 셀
	const anchorRef = React.useRef<CellPosition | null>(null);

	// 셀 선택
	const handleCellSelect = (row: number, col: number) => {
		setSelectedCells([{ row, col }]);
		anchorRef.current = { row, col };
	};

	// 병합 버튼 클릭
	const handleMergeCells = () => {
		// 최소 2개 선택됐는지 확인 (아니면 리턴)
		if (selectedCells.length === 0) return;

		// 여러 셀 선택 확장 (드래그 또는 shift)
		let minRow = selectedCells[0].row, maxRow = selectedCells[0].row;
		let minCol = selectedCells[0].col, maxCol = selectedCells[0].col;
		selectedCells.forEach(({row, col}) => {
			minRow = Math.min(minRow, row); maxRow = Math.max(maxRow, row);
			minCol = Math.min(minCol, col); maxCol = Math.max(maxCol, col);
		});
		// 이미 겹치는 영역은 병합 안함(중복추가 막기)
		const overlap = mergedRanges.some(
			r => !(r.endRow < minRow || r.startRow > maxRow || r.endCol < minCol || r.startCol > maxCol)
		);
		if (overlap) return;
		setMergedRanges([...mergedRanges, {
			startRow: minRow,
			endRow: maxRow,
			startCol: minCol,
			endCol: maxCol
		}]);
		setSelectedCells([]); // 병합 후 초기화
	};

	// 병합 해제 버튼 클릭
	const handleUnmergeCells = () => {
		if (mergedRanges.length === 0) return;
		// 선택이 없으면 마지막 병합을 되돌림(undo)
		if (selectedCells.length === 0) {
			setMergedRanges(prev => prev.slice(0, -1));
			return;
		}
		// 선택 영역과 겹치는 병합 영역을 해제
		let minRow = selectedCells[0].row, maxRow = selectedCells[0].row;
		let minCol = selectedCells[0].col, maxCol = selectedCells[0].col;
		selectedCells.forEach(({row, col}) => {
			minRow = Math.min(minRow, row); maxRow = Math.max(maxRow, row);
			minCol = Math.min(minCol, col); maxCol = Math.max(maxCol, col);
		});
		setMergedRanges(prev =>
			prev.filter(r => (r.endRow < minRow || r.startRow > maxRow || r.endCol < minCol || r.startCol > maxCol))
		);
	};


	// Ctrl: 개별 토글 선택
	const handleCellToggle = (row: number, col: number) => {
		setSelectedCells(prev => {
			const exists = prev.some(c => c.row === row && c.col === col);
			if (exists) {
				return prev.filter(c => !(c.row === row && c.col === col));
			}
			return [...prev, { row, col }];
		});
		anchorRef.current = { row, col };
	};

	// Shift: 앵커와 현재 사이 범위 선택(직사각형)
	const handleCellShiftRange = (row: number, col: number) => {
		const anchor = anchorRef.current ?? { row, col };
		anchorRef.current = anchor;
		const minRow = Math.min(anchor.row, row);
		const maxRow = Math.max(anchor.row, row);
		const minCol = Math.min(anchor.col, col);
		const maxCol = Math.max(anchor.col, col);
		const next: CellPosition[] = [];
		for (let r = minRow; r <= maxRow; r++) {
			for (let c = minCol; c <= maxCol; c++) {
				next.push({ row: r, col: c });
			}
		}
		setSelectedCells(next);
	};

	// 드래그 시작
	const handleMouseDownCell = (row: number, col: number, e: React.MouseEvent) => {
		// Ctrl/Shift가 눌리면 드래그 시작하지 않고 클릭 로직에게 위임
		if (e.ctrlKey || e.metaKey || e.shiftKey) {
			return;
		}
		// 편집 중인 동일 셀에서는 드래그 시작하지 않음(위젯 상호작용 허용)
		if (editingCell && editingCell.row === row && editingCell.col === col) {
			return;
		}
		// 다른 셀로 이동 시 편집 input을 강제로 blur
		if (editingCell && (editingCell.row !== row || editingCell.col !== col)) {
			editingInputRef.current?.blur();
		}
		e.preventDefault();
		e.stopPropagation();
		isDraggingRef.current = true;
		didDragRef.current = false;
		dragStartRef.current = { row, col };
		setSelectedCells([{ row, col }]);
		anchorRef.current = { row, col };
	};

	// 드래그 중(셀에 진입할 때 영역 갱신)
	const handleMouseEnterCell = (row: number, col: number) => {
		if (!isDraggingRef.current || !dragStartRef.current) return;
		const start = dragStartRef.current;
		const minRow = Math.min(start.row, row);
		const maxRow = Math.max(start.row, row);
		const minCol = Math.min(start.col, col);
		const maxCol = Math.max(start.col, col);
		const next: CellPosition[] = [];
		for (let r = minRow; r <= maxRow; r++) {
			for (let c = minCol; c <= maxCol; c++) {
				next.push({ row: r, col: c });
			}
		}
		didDragRef.current = true;
		setSelectedCells(next);
	};

	// 전역 mouseup으로 드래그 종료
	React.useEffect(() => {
		const handleMouseUp = () => {
			if (isDraggingRef.current) {
				isDraggingRef.current = false;
				dragStartRef.current = null;
				// 드래그가 끝난 뒤의 클릭 이벤트가 선택을 덮어쓰지 않도록 잠시 플래그 유지
				// didDragRef는 onClick에서 확인 후 즉시 해제함
			}
		};
		window.addEventListener('mouseup', handleMouseUp);
		return () => {
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	// 셀 병합 상태에 따라 rowSpan, colSpan 반환
	const computeSpan = (rowIdx: number, colIdx: number) => {
		for (const range of mergedRanges) {
			const { startRow, endRow, startCol, endCol } = range;
			// 병합 영역의 첫 셀인가?
			if (rowIdx === startRow && colIdx === startCol) {
				return {
					rowSpan: endRow - startRow + 1,
					colSpan: endCol - startCol + 1
				};
			}
			// 병합 영역 내부의 나머지 셀인가?
			if (
				rowIdx >= startRow && rowIdx <= endRow &&
				colIdx >= startCol && colIdx <= endCol
			) {
				return {
					rowSpan: 0, colSpan: 0
				};
			}
		}
		return { rowSpan: 1, colSpan: 1 };
	}

	// 주어진 셀이 병합 영역 내에 있으면 앵커 좌표를 반환, 아니면 자기 자신
	const getAnchorCell = (rowIdx: number, colIdx: number): CellPosition => {
		for (const range of mergedRanges) {
			const { startRow, endRow, startCol, endCol } = range;
			if (
				rowIdx >= startRow && rowIdx <= endRow &&
				colIdx >= startCol && colIdx <= endCol
			) {
				return { row: startRow, col: startCol };
			}
		}
		return { row: rowIdx, col: colIdx };
	}

	const positionKey = (pos: CellPosition) => {
		return `${pos.row}:${pos.col}`;
	}

	// 선택된 셀들(병합 포함시 앵커 기준)에 위젯 타입을 일괄 적용
	const applyWidgetToSelection = (type: CellWidgetType) => {
		if (selectedCells.length === 0) return;
		const uniqueKeys = new Set<string>();
		const updates: Record<string, CellWidgetType> = {};
		selectedCells.forEach(({ row, col }) => {
			const anchor = getAnchorCell(row, col);
			const key = positionKey(anchor);
			if (!uniqueKeys.has(key)) {
				uniqueKeys.add(key);
				updates[key] = type;
			}
		});
		setCellWidgets(prev => ({ ...prev, ...updates }));
	};

	// 선택된 위젯 제거
	const clearWidgetFromSelection = () => {
		if (selectedCells.length === 0) return;
		const keysToClear = new Set<string>();
		selectedCells.forEach(({ row, col }) => {
			const anchor = getAnchorCell(row, col);
			keysToClear.add(positionKey(anchor));
		});
		setCellWidgets(prev => {
			const next = { ...prev };
			keysToClear.forEach(k => {
				delete next[k];
			});
			return next;
		});
	};

	// antd columns 변환 (rowSpan/colSpan 병합 반영)
	const andtColumns: ColumnsType<any> = columns.map((col, colIdx) => ({
		title: col.title,
		dataIndex: col.dataIndex,
		key: col.key,
		onCell: (_: any, rowIdx?: number) => {
			// rowIdx가 undefined일 수 있으므로 기본값 처리
			const { rowSpan, colSpan } = computeSpan(rowIdx ?? 0, colIdx);
			return {
				rowSpan,
				colSpan,
				style: { padding: 0, height: '0px' },
			};
		},
		render: (text: string, record: any, _index?: number) => {
			// antd의 render의 3번째 arg는 실제로 index일 수도 있고 아닐 수도 있음
			// 실제 row의 index를 구하는 방법이 필요함.
			let rowIdx = dataSource.findIndex((r: any) => r.key === record.key);
			// 만약 못 찾으면 index 사용 (그래도 fallback)
			if (rowIdx === -1 && typeof _index === "number") rowIdx = _index;

			const isSelected = selectedCells.some(
				cell => cell.row === rowIdx && cell.col === colIdx
			);
			const isEditable = editingCell?.row === rowIdx && editingCell?.col === colIdx;

			// 병합 앵커 기준으로 위젯 타입 결정
			const anchor = getAnchorCell(rowIdx, colIdx);
			const widgetType = cellWidgets[positionKey(anchor)];

			return (
				<StyledCell
					background={isSelected ? '#39a9ff' : 'transparent'}
					onMouseDownCapture={e => {
						const target = e.target as HTMLElement;
						if (target.closest('[data-interactive="true"]')) return;
						handleMouseDownCell(rowIdx, colIdx, e);
					}}
					onMouseOverCapture={e => {
						const target = e.target as HTMLElement;
						if (target.closest('[data-interactive="true"]')) return;
						handleMouseEnterCell(rowIdx, colIdx);
					}}
					onClick={e => {
						// const target = e.target as HTMLElement;
						// if (target.closest('[data-interactive="true"]')) return;
						// 드래그 직후 발생하는 클릭은 무시
						if (didDragRef.current) {
							didDragRef.current = false;
							return;
						}
						if (e.ctrlKey || e.metaKey) {
							handleCellToggle(rowIdx, colIdx);
						} else if (e.shiftKey) {
							handleCellShiftRange(rowIdx, colIdx);
						} else {
							handleCellSelect(rowIdx, colIdx);
						}
					}}
					onDoubleClick={(e) => {
						e.stopPropagation();
                        if(widgetType && widgetType !== 'select' && widgetType !== 'date') return;
						setEditingCell({ row: rowIdx, col: colIdx });
					}}
				>
						{isEditable ? (
							(widgetType === 'select' && anchor.row === rowIdx && anchor.col === colIdx) ? (
								<div style={{ padding: 8 }}>
									<DSSelect
										MenuItems={[
											{ label: 'Option 1', value: '1' },
											{ label: 'Option 2', value: '2' },
											{ label: 'Option 3', value: '3' },
										]}
										value={String(text ?? '')}
										fullWidth
										onChange={(e: any) => {
											const nextValue = e?.target?.value ?? '';
											setDataSource(prev => {
												const next = [...prev];
												if (rowIdx >= 0 && rowIdx < next.length) {
													next[rowIdx] = {
														...next[rowIdx],
														[col.dataIndex]: nextValue,
													};
												}
												return next;
											});
											setEditingCell(null);
										}}
									/>
								</div>
							) : (widgetType === 'date' && anchor.row === rowIdx && anchor.col === colIdx) ? (
								<div style={{ padding: 8 }}>
                                    {/* 현재 design-system의 react 버전이 18.3.1 이므로, DatePicker를 사용할 수 없음 */}
                                    {/* 추후 design-system의 react 버전을 18.2 로 다운드레이드 해야 함 */}
									<DSDatePicker
										// value={dayjs()}
										onChange={(_d, dateString) => {
											// const nextValue = Array.isArray(dateString) ? dateString[0] : dateString;
											// setDataSource(prev => {
											// 	const next = [...prev];
											// 	if (rowIdx >= 0 && rowIdx < next.length) {
											// 		next[rowIdx] = {
											// 			...next[rowIdx],
											// 			[col.dataIndex]: nextValue,
											// 		};
											// 	}
											// 	return next;
											// });
											// setEditingCell(null);
										}}
                                        defaultValue={dayjs()}
										onOpenChange={(open) => {
											// if (!open) setEditingCell(null);
										}}
									/>
								</div>
							) : (
								<input
									type="text"
                                    style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
									ref={editingInputRef}
									defaultValue={text}
									autoFocus
									onBlur={(e) => {
										setEditingCell(null);
										const nextValue = e.currentTarget.value;
										setDataSource(prev => {
											const next = [...prev];
											if (rowIdx >= 0 && rowIdx < next.length) {
												next[rowIdx] = {
													...next[rowIdx],
													[col.dataIndex]: nextValue,
												};
											}
											return next;
										});
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											(e.target as HTMLInputElement).blur();
										}
									}}
								/>
							)
						) : (widgetType && anchor.row === rowIdx && anchor.col === colIdx) ? (
							<div
								style={{ padding: 8 }}
								data-interactive={widgetType !== 'select' && widgetType !== 'date' ? 'true' : undefined}
								onMouseDownCapture={widgetType !== 'select' && widgetType !== 'date' ? (e) => e.stopPropagation() : undefined}
								onClickCapture={widgetType !== 'select' && widgetType !== 'date' ? (e) => e.stopPropagation() : undefined}
							>
								{widgetType === 'button' && (
									<DSButton size="sm">{String(text ?? 'Button')}</DSButton>
								)}
								{widgetType === 'select' && (
									<div>{String(text ?? '')}</div>
								)}
								{widgetType === 'checkbox' && (
									<DSCheckbox label={String(text ?? 'Checkbox')} />
								)}
								{widgetType === 'date' && (
									<div>{String(text ?? '')}</div>
								)}
							</div>
						) : (
							text
						)}
					</StyledCell>
				
			);
		},
        
	}));

	return (
		<div>
			<ConfigProvider
				theme={{
					components: {
						Table: {
							colorPrimary: '#000',
							cellPaddingBlock: 0,
							rowHoverBg: '#e6f7ff',
						},
					},
				}}
			>
                <div>
                    <Button onClick={() => applyWidgetToSelection('button')}>버튼</Button>
                    <Button onClick={() => applyWidgetToSelection('select')}>셀렉트</Button>
                    <Button onClick={() => applyWidgetToSelection('checkbox')}>체크박스</Button>
                    <Button onClick={() => applyWidgetToSelection('date')}>날짜</Button>
                    <Button onClick={clearWidgetFromSelection}>위젯 제거</Button>
                    <Button
                        onClick={handleMergeCells}
                    >
                        셀 병합
                    </Button>
                    <Button
                        onClick={handleUnmergeCells}
                    >
                        병합 해제
                    </Button>
                </div>
                <div>
                    <Button
                        onClick={() => {
                            // 행 추가: 빈 row 추가 (key는 유니크하게)
                            // columns은 useState 값을 사용할거임
                            // andtColumns는 setState를 해주기 위한 변수일 뿐
                            // 추후 직접 들어가는 columns는 state columns를 사용할거임
                            // selectedCells[0] 기준으로 행을 추가하고 selectedCells가 없다면 마지막에 추가
                            const newRow = { key: Date.now().toString(), id: Date.now().toString(), name: '', age: 0, address: '' };
                            if (selectedCells.length > 0) {
                                const insertIndex = selectedCells[0].row + 1;
                                setDataSource(prev => {
                                    const next = [...prev];
                                    next.splice(insertIndex, 0, newRow);
                                    return next;
                                });
                            } else {
                                setDataSource(prev => [...prev, newRow]);
                            }
                        }}
                    >
                        행 추가
                    </Button>
                    <Button
                        onClick={() => {
                            if (selectedCells.length > 0) {
                                // 선택된 셀들의 row 인덱스를 모두 모으고, 중복 없이, 내림차순 정렬
                                const rowsToDelete = Array.from(new Set(selectedCells.map(cell => cell.row))).sort((a, b) => b - a);
                                setDataSource(prev => {
                                    let next = [...prev];
                                    for (const rowIdx of rowsToDelete) {
                                        next.splice(rowIdx, 1);
                                    }
                                    return next;
                                });
                            } else {
                                setDataSource(prev => prev.slice(0, -1));
                            }
                            setSelectedCells([]);
                        }}
                    >
                        행 삭제
                    </Button>
                    <Button
                        onClick={() => {
                            // 열 추가: 선택된 셀이 있으면 그 셀들의 col 기준으로 가장 오른쪽에 추가, 없으면 맨 오른쪽에 추가
                            const colKey = `col_${Date.now()}`;
                            let insertIndex = columns.length; // 기본은 맨 오른쪽

                            if (selectedCells.length > 0) {
                                // 선택된 셀들의 col(열) 인덱스를 기준으로 가장 오른쪽 col+1 위치에 추가
                                const maxCol = Math.max(...selectedCells.map(cell => cell.col));
                                insertIndex = maxCol + 1;
                                if (insertIndex > columns.length) insertIndex = columns.length;
                            }

                            const newCol = {
                                title: `열${columns.length + 1}`,
                                dataIndex: colKey,
                                key: colKey,
                                width: 120,
                            };

                            setColumns(prev => {
                                const next = [...prev];
                                next.splice(insertIndex, 0, newCol);
                                return next;
                            });

                        }}
                    >
                        열 추가
                    </Button>
                    <Button
                        onClick={() => {
                            // 선택된 셀의 col(열) 인덱스를 기준으로 여러 열 삭제
                            if (columns.length <= 1) return;
                            let colsToDelete: number[] = [];
                            if (selectedCells.length > 0) {
                                colsToDelete = Array.from(new Set(selectedCells.map(cell => cell.col))).sort((a, b) => b - a);
                            } else {
                                colsToDelete = [columns.length - 1]; // 아무 것도 선택 안 했을 때 마지막 열 삭제
                            }
                            setColumns(prev => {
                                let next = [...prev];
                                for (const colIdx of colsToDelete) {
                                    if (colIdx >= 0 && colIdx < next.length) {
                                        next.splice(colIdx, 1);
                                    }
                                }
                                return next;
                            });
                            setDataSource(prev =>
                                prev.map(row => {
                                    const newRow = { ...row };
                                    for (const colIdx of colsToDelete) {
                                        const col = columns[colIdx];
                                        if (col) {
                                            delete (newRow as any)[col.dataIndex || col.key];
                                        }
                                    }
                                    return newRow;
                                })
                            );
                        }}
                    >            
                        열 삭제
                    </Button>
                </div>
				<Table
					dataSource={dataSource}
					columns={andtColumns}
					pagination={false}
					rowKey="key"
                    bordered
                    tableLayout="fixed"
				/>
                <div>
                    <div>
                        <p>Selected Cell : {selectedCells[0]?.col} , {selectedCells[0]?.row}</p>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>key</div> : <input value={selectedCells[0]?.col} />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>title</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>type</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>width</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>height</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>resizable</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>draggable</div> : <input />
                        </div>
                    </div>
                </div>
			</ConfigProvider>
		</div>
	);
};

export default AntdTable;