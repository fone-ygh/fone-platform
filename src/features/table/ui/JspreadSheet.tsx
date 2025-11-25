import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { Box, Table2 } from "fone-design-system_v1";
import jspreadsheet from "jspreadsheet-ce";

type MergeMap = Record<string, [number, number]>; // [colspan, rowspan]
type ColumnNode = { accessorKey?: string; key: string; header?: string; name?: string, type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox"; children?: ColumnNode[], editable?: boolean; width?: number | string; draggable?: boolean; resizable?: boolean; align?: "left" | "center" | "right"; required?: boolean; selectItems?: any[]; columns?: ColumnNode[], role?: "group" | "leaf", disabled?: boolean; readonly?: boolean };

type HeaderCellProps = {
    accessorKey?: string;
    header?: string;
    type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox";
    editable?: boolean;
    width?: number | string;
    draggable?: boolean;
    resizable?: boolean;
    align?: "left" | "center" | "right";
    required?: boolean;
    selectItems?: any[];
};

type HeaderCellConfig = {
    address: string; // e.g. A1
    col: number;
    row: number;
    props: Partial<HeaderCellProps>;
};

export default function JspreadSheet() {
    // Spreadsheet array of worksheets
    const spreadsheet = useRef<Spreadsheet>(null);

    const ref = useRef<HTMLDivElement>(null);

    // 사용자가 입력한 헤더 셀 속성 배열 및 선택 상태
    const [headerCellPropsList, setHeaderCellPropsList] = useState<HeaderCellConfig[]>([]);
    const [selectedPos, setSelectedPos] = useState<{ col: number; row: number } | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [form, setForm] = useState<Partial<HeaderCellProps>>({
        accessorKey: "",
        header: "",
        type: "input",
        editable: true,
        width: "",
        draggable: false,
        resizable: true,
        align: "left",
        required: false,
        selectItems: [],
    });

    const [table2Headers, setTable2Headers] = useState<ColumnNode[]>([]);

    type MergeMap = Record<string, [number, number]>; // [colspan, rowspan]

    function detectHeaderDepth(rowDatas: any[][], mergeData?: MergeMap): number {
        // 상단에서부터 비어있지 않은(또는 병합 정의가 존재하는) 연속 행 수를 헤더로 간주
        let depth = 0;
        for (let r = 0; r < rowDatas.length; r++) {
          const row = rowDatas[r] ?? [];
          const hasValue = row.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
          const hasMergeOnRow = !!mergeData && Object.keys(mergeData).some((k) => k.endsWith(String(r + 1)));
          if (hasValue || hasMergeOnRow) depth++;
          else break;
        }
        return Math.max(1, depth); // 최소 1
      }

    
    function getMergeSpan(mergeData: MergeMap | undefined, headers: string[], col: number, level: number) {
        const key = `${headers[col]}${level + 1}`;
        const [colspan, rowspan] = mergeData?.[key] ?? [1, 1];
        return { colspan, rowspan };
    }
  
    function findNameFallback(rowDatas: any[][], col: number, upToLevel: number, headers: string[]) {
        for (let l = upToLevel; l >= 0; l--) {
        const v = rowDatas[l]?.[col];
        if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
        }
        return headers[col] ?? `col_${col}`;
    }
  
    function inferType(rowDatas: any[][], headerDepth: number, col: number): ColumnNode["type"] {
        // 아래쪽 데이터(헤더Depth 이후) 샘플링으로 간단 추론
        const dataRows = rowDatas.slice(headerDepth);
        const samples = dataRows.slice(0, 20).map((r) => r?.[col]).filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
        if (samples.length === 0) return "input";
        const numericLike = samples.every((v) => /^-?\d+(\.\d+)?$/.test(String(v)));
        return numericLike ? "number" : "input";
    }

    function getAddress(headers: string[], col: number, row: number) {
        return `${headers[col]}${row + 1}`;
    }

    // 배열을 map으로 변환하여 빠르게 조회
    function toCellPropsMap(headers: string[], list: HeaderCellConfig[]) {
        const map: Record<string, Partial<HeaderCellProps>> = {};
        for (const item of list) {
            const addr = item.address || getAddress(headers, item.col, item.row);
            map[addr] = { ...map[addr], ...item.props };
        }
        return map;
    }

    function getPropsForCell(cellPropsMap: Record<string, Partial<HeaderCellProps>> | undefined, headers: string[], col: number, level: number) {
        const addr = `${headers[col]}${level + 1}`;
        return cellPropsMap?.[addr];
    }

    function buildLevel(
        headers: string[],
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
          const safeName = (overrideProps?.header && String(overrideProps.header).trim() !== "")
            ? String(overrideProps.header)
            : ((nameHere !== null && nameHere !== undefined && String(nameHere).trim() !== "")
                ? String(nameHere)
                : findNameFallback(rowDatas, col, level, headers));
      
          if (level < headerDepth - 1) {
            // 그룹 노드
            const children = buildLevel(headers, rowDatas, mergeData, col, col + spanCols, level + 1, headerDepth, cellPropsMap);
            nodes.push({
              key: overrideProps?.accessorKey || `group_${headers[col]}_${headers[col + spanCols - 1]}`,
              header: safeName,
              columns:children,
              role: "group",
            });
            col += spanCols;
          } else {
            // 리프 노드들
            for (let c = col; c < col + spanCols; c++) {
              const leafOverride = getPropsForCell(cellPropsMap, headers, c, level);
              const leafName = (leafOverride?.header && String(leafOverride.header).trim() !== "")
                ? String(leafOverride.header)
                : ((rowDatas[level]?.[c] && String(rowDatas[level][c]).trim() !== "")
                    ? String(rowDatas[level][c])
                    : findNameFallback(rowDatas, c, level, headers));
              nodes.push({
                key: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[c],
                accessorKey: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[c],
                header: leafName,
                type: (leafOverride?.type as ColumnNode["type"]) || inferType(rowDatas, headerDepth, c),
                editable: leafOverride?.editable ?? true,
                // width: leafOverride?.width ?? "",
                // draggable: leafOverride?.draggable ?? false,
                // resizable: leafOverride?.resizable ?? true,
                // align: (leafOverride?.align as any) ?? "left",
                // required: leafOverride?.required ?? false,
                // selectItems: leafOverride?.selectItems ?? [],
                // disabled: leafOverride?.disabled ?? false,
                // readonly: leafOverride?.readonly ?? false,
              });
            }
            col += spanCols;
          }
        }
      
        return nodes;
      }

      function buildColumnsFromJSS(
        headers: string[],
        rowDatas: any[][],
        mergeData?: MergeMap,
        headerDepth?: number,
        cellPropsMap?: Record<string, Partial<HeaderCellProps>>
      ): ColumnNode[] {
        const depth = headerDepth ?? detectHeaderDepth(rowDatas, mergeData);
        return buildLevel(headers, rowDatas, mergeData, 0, headers.length, 0, depth, cellPropsMap);
      }

    const headerCellPropsListRef = useRef(headerCellPropsList);
    useEffect(() => {
        headerCellPropsListRef.current = headerCellPropsList;
    }, [headerCellPropsList]);

    const handleEvent = useCallback((eventName: string, worksheet: Worksheet) => {
        if(eventName === "onselection") {
            const selectedCell = spreadsheet!.current![0].selectedContainer;
            const headers = spreadsheet!.current![0].getHeaders().split(",");
            const col = Number(selectedCell[0]);
            const row = Number(selectedCell[1]);
            setSelectedPos({ col, row });
            const address = `${headers[col]}${row + 1}`;
            setSelectedAddress(address);

            // headerCellPropsList 대신 ref 사용
            const headerList = headerCellPropsListRef.current;
            const existing = headerList.find((x) => x.address === address);
            console.log("existing : ", existing, headerList);
            if (existing) {
                setForm({
                    accessorKey: existing.props.accessorKey ?? "",
                    header: existing.props.header ?? "",
                    type: existing.props.type ?? "input",
                    editable: existing.props.editable ?? true,
                    width: existing.props.width ?? "",
                    draggable: existing.props.draggable ?? false,
                    resizable: existing.props.resizable ?? true,
                    align: (existing.props.align as any) ?? "left",
                    required: existing.props.required ?? false,
                });
            } else {
                setForm({
                    accessorKey: "",
                    header: "",
                    type: "input",
                    editable: true,
                    width: "",
                    draggable: false,
                    resizable: true,
                    align: "left",
                    required: false,
                });
            }
        }
    }, []);


    const resetCell = (worksheet: Worksheet, address: string, header?: string) => {
        worksheet.setValue(address, header ?? "");
    }
    
      
    // Render component
    return (
        <>
            <div>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.insertRow();
                }}>add</span></button>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.deleteRow();
                }}>remove</span></button>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.insertColumn();
                }}>add</span></button>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.deleteColumn();
                }}>remove</span></button>
            </div>

            <Spreadsheet ref={spreadsheet} toolbar={true} onevent={handleEvent}>
                <Worksheet 
                    minDimensions={[6,6]} 
                />
            </Spreadsheet>
            <button onClick={() => {
                const rawData = spreadsheet!.current![0].getData();

                // 0번째 배열은 header, 1부터는 children들을 의미
                const rowDatas = rawData;
                const headers = spreadsheet!.current![0].getHeaders().split(",");
                const mergeData = spreadsheet!.current![0].getMerge();

                const cellPropsMap = toCellPropsMap(headers, headerCellPropsList);
                const resultHeaders = buildColumnsFromJSS(headers, rowDatas, mergeData, undefined, cellPropsMap);

                setTable2Headers(resultHeaders as ColumnNode[]);
            }}>
                Grid Table 예시 적용
            </button>
            <button onClick={() => {
                const selectedCell = spreadsheet!.current![0].selectedContainer;
                const headers = spreadsheet!.current![0].getHeaders().split(",");
                if (Array.isArray(selectedCell)) {
                    const col = Number(selectedCell[0]);
                    const row = Number(selectedCell[1]);

                    setSelectedPos({ col, row });
                    const address = `${headers[col]}${row + 1}`;
                    setSelectedAddress(address);
                    const existing = headerCellPropsList.find((x) => x.address === address);
                    if (existing) {
                        setForm({
                            accessorKey: existing.props.accessorKey ?? "",
                            header: existing.props.header ?? "",
                            type: existing.props.type ?? "input",
                            editable: existing.props.editable ?? true,
                            width: existing.props.width ?? "",
                            draggable: existing.props.draggable ?? false,
                            resizable: existing.props.resizable ?? true,
                            align: (existing.props.align as any) ?? "left",
                            required: existing.props.required ?? false,
                        });
                    } else {
                        setForm({
                            accessorKey: "",
                            header: "",
                            type: "input",
                            editable: true,
                            width: "",
                            draggable: false,
                            resizable: true,
                            align: "left",
                            required: false,
                        });
                    }
                }
            }}>
                Select Cell Data
            </button>

            {/* 해당 부분 컴포넌트로 따로 빼서 관리해야함 */}
            <div>
                선택 셀 설정 값
                <div>
                    <Box display="flex" flexDirection="column" gap="10px">
                        <p>Selected Cell : {selectedAddress || "-"}</p>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>accessorKey</div> : <input type="text" value={form.accessorKey as any} onChange={(e) => setForm((f) => ({ ...f, accessorKey: e.target.value }))} />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>header</div> : <input type="text" value={form.header as any} onChange={(e) => setForm((f) => ({ ...f, header: e.target.value }))} />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>editable</div> : <input type="checkbox" checked={!!form.editable} onChange={(e) => setForm((f) => ({ ...f, editable: e.target.checked }))} />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>type</div> : <select value={form.type as any} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}>
                                <option value="input">input</option>
                                <option value="button">button</option>
                                <option value="select">select</option>
                                <option value="checkbox">checkbox</option>
                                <option value="datePicker">date</option>
                            </select>
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>width</div> : <input type="text" placeholder="e.g. 120 or 10%" value={String(form.width ?? "")}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    const num = Number(v);
                                    setForm((f) => ({ ...f, width: isNaN(num) ? v : num }));
                                }}
                            />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>align</div> : 
                            <select value={form.align as any} onChange={(e) => setForm((f) => ({ ...f, align: e.target.value as any }))}>
                                <option value="left">left</option>
                                <option value="center">center</option>
                                <option value="right">right</option>
                            </select>
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>draggable</div> : <input type="checkbox" checked={!!form.draggable} onChange={(e) => setForm((f) => ({ ...f, draggable: e.target.checked }))} />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>resizable</div> : <input type="checkbox" checked={!!form.resizable} onChange={(e) => setForm((f) => ({ ...f, resizable: e.target.checked }))} />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>required</div> : <input type="checkbox" checked={!!form.required} onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))} />
                        </div>
                        {/* selectItems 설정 */}
                        <div>
                            <div style={{width:"100px"}}>selectItems</div> : <input type="text" onChange={(e) => setForm((f) => ({ ...f, selectItems: e.target.value as any }))} />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => {
                                if (!spreadsheet.current) return;
                                const headers = spreadsheet.current[0].getHeaders().split(",");
                                if (!selectedPos) return;
                                const address = `${headers[selectedPos.col]}${selectedPos.row + 1}`;
                                const next: HeaderCellConfig = {
                                    address,
                                    col: selectedPos.col,
                                    row: selectedPos.row,
                                    props: { ...form },
                                };
                                setHeaderCellPropsList((prev) => {
                                    const idx = prev.findIndex((x) => x.address === address);
                                    if (idx >= 0) {
                                        const copy = prev.slice();
                                        copy[idx] = next;
                                        return copy;
                                    }
                                    return [...prev, next];
                                });
                                resetCell(spreadsheet.current![0] as Worksheet, address, form.header as string);
                            }}>저장</button>
                            <button onClick={() => {
                                if (!selectedAddress) return;
                                setHeaderCellPropsList((prev) => prev.filter((x) => x.address !== selectedAddress));
                            }}>삭제</button>
                        </div>
                    </Box>
                </div>
            </div>
            <Table2 columns={table2Headers as any} data={[{11:"1",22:"2",33:"3",44:"4",55:"5",66:"6"}]} />
        </>
    );
}