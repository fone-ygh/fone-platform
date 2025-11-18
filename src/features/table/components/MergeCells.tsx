import { ColumnOrColumnGroup } from 'react-data-grid';

const MergeCells = (mergedRanges: any, columns: any, rowHeight: number, scrollTop: number, headerHeight: number, selectCells: any, rows: any, pressedKey: any, setSelectCells: any, setMergedRanges: any, bindCell: any) => {

    // const [mergedRanges, setMergedRanges] = useState<{ id: string; mergeCellId: string; range: { startRow: number; endRow: number; startCol: number; endCol: number }; value?: string; editMode?: boolean }[]>([]);

	const flattenColumns = (cols: any[], parentKey?:string): any[] => {
		return cols.reduce((acc, col) => {
			if (col.children && Array.isArray(col.children) && col.children.length > 0) {
				return acc.concat(flattenColumns(col.children, col.key));
			} else {
				return acc.concat({ ...col, parentKey: parentKey });
			}
		}, []);
	};

    const getColWidth = (col: ColumnOrColumnGroup<any, unknown> | undefined): number => {
		if (!col) return 100;
		const w = (col as any).width as unknown;
		if (typeof w === 'number') return w;
		if (typeof w === 'string') {
			const n = parseFloat(w);
			return Number.isFinite(n) ? n : 100;
		}
		return 100;
	};
    

	return (
		<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', top:`${headerHeight}px`, height:`calc(100% - ${headerHeight}px)` }}>
					{mergedRanges.map((m: any, i: any) => {
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
										selectCells.some((c: any) => c.col === m.range.startCol && c.row === m.range.startRow) ? '2px solid #0078d4' : '1px solid #444', 
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
										setMergedRanges((props: any) => props.map((m1: any, i1: any) => i === i1 ? { ...m, editMode: true } : m1));
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
											setMergedRanges((props: any) => props.map((m1: any, i1: any) => i === i1 ? { ...m, value: e.target.value } : m1));
										}}
										onBlur={(e) => {
											setMergedRanges((props: any) => props.map((m1: any, i1: any) => i === i1 ? { ...m, value: e.target.value, editMode: false } : m1));
										}}
										onKeyDown={(e) => {
											if(e.key === "Enter") {
												setMergedRanges((props: any) => props.map((m1: any, i1: any) => i === i1 ? { ...m, value: e.currentTarget.value, editMode: true } : m1));
											}
										}}
									/>
								) : (
									<div className="no-drag" >{m.value ?? ''}</div>
								)}
							</div>
						);
					})}
					{selectCells.map((c: any, i: any) => {
						// flatten children of columns into a single flat array
						const flatColumns = flattenColumns(columns); 
						const left = flatColumns.slice(0, c.col).reduce((acc, col) => acc + getColWidth(col), 0);
						const top = (c.row * rowHeight) - scrollTop;
						const width = getColWidth(flatColumns[c.col] as ColumnOrColumnGroup<any, unknown>);
						const height = rowHeight;
						return <div key={`sel-${i}`} className="no-drag" style={{ position: 'absolute', left, top, width, height,  border: '2px solid rgb(0, 91, 160)', boxSizing: 'border-box' }} />
					})}
				</div>
	)
}

export default MergeCells;