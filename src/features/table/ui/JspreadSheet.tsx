import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { Box, Button, Dialog, Table2 } from "fone-design-system_v1";
import TableSettingArea from "../components/TableSettingArea";
import { useTableSettingActions, useTableSettingStore } from "../store/tableSettingStore";
import { HeaderCellProps, HeaderCellConfig } from "../interface/type";
import CellSettingArea from "../components/CellSettingArea";

type ColumnNode = { accessorKey?: string; key: string; header?: string; name?: string, type?: "input" | "number" | "button" | "date" | "select" | "radio" | "checkbox"; children?: ColumnNode[], editable?: boolean; width?: number | string; draggable?: boolean; resizable?: boolean; align?: "left" | "center" | "right"; required?: boolean; selectItems?: any[]; columns?: ColumnNode[], role?: "group" | "leaf", disabled?: boolean; readonly?: boolean };

export default function JspreadSheet() {

    // Spreadsheet array of worksheets
    const spreadsheet = useRef<Spreadsheet>(null);

    // Table Setting 값을 담는 store
    const { checkbox, noDisplay, paginationDisplay, totalDisplay, plusButtonDisplay, headerCellPropsList, title } = useTableSettingStore();
    const { setSelectedCellAddress, setFormData, setSelectedPos } = useTableSettingActions();


    const [table2Headers, setTable2Headers] = useState<ColumnNode[]>([]);

    const [demoTableOpen, setDemoTableOpen] = useState(false);
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

    
    function getMergeSpan(mergeData: MergeMap | undefined, headers: { header: string; width?: number | string }[], col: number, level: number) {
        const key = `${headers[col].header}${level + 1}`;
        const [colspan, rowspan] = mergeData?.[key] ?? [1, 1];
        return { colspan, rowspan };
    }
  
    function findNameFallback(rowDatas: any[][], col: number, upToLevel: number, headers: { header: string; width?: number | string }[]) {
        for (let l = upToLevel; l >= 0; l--) {
        const v = rowDatas[l]?.[col];
        if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
        }
        return headers[col].header ?? `col_${col}`;
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

    function getPropsForCell(cellPropsMap: Record<string, Partial<HeaderCellProps>> | undefined, headers: { header: string; width?: number | string }[], col: number, level: number) {
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
          const safeName = (overrideProps?.header && String(overrideProps.header).trim() !== "")
            ? String(overrideProps.header)
            : ((nameHere !== null && nameHere !== undefined && String(nameHere).trim() !== "")
                ? String(nameHere)
                : findNameFallback(rowDatas, col, level, headers));
      
          if (level < headerDepth - 1) {
            // 그룹 노드
            const children = buildLevel(headers, rowDatas, mergeData, col, col + spanCols, level + 1, headerDepth, cellPropsMap);
            console.log("children : ", children);
            const parentWidth = children.reduce((acc, child) => acc + (Number(child.width) ?? 0), 0);
            nodes.push({
              key: overrideProps?.accessorKey || `group_${headers[col].header}_${headers[col + spanCols - 1].header}`,
              header: safeName,
              columns:children,
              role: "group",
              width: parentWidth,
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
                key: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[c].header,
                accessorKey: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[c].header,
                header: leafName,
                type: (leafOverride?.type as ColumnNode["type"]) || inferType(rowDatas, headerDepth, c),
                editable: leafOverride?.editable ?? true,
                width: headers[c].width ?? 100,
                // draggable: leafOverride?.draggable ?? false,
                resizable: leafOverride?.resizable ?? true,
                align: (leafOverride?.align as any) ?? "left",
                required: leafOverride?.required ?? false,
                selectItems: leafOverride?.selectItems ?? [],
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
        headers: { header: string; width?: number | string }[],
        rowDatas: any[][],
        mergeData?: MergeMap,
        headerDepth?: number,
        cellPropsMap?: Record<string, Partial<HeaderCellProps>>
      ): ColumnNode[] {
        const depth = headerDepth ?? detectHeaderDepth(rowDatas, mergeData);
        return buildLevel(headers, rowDatas, mergeData, 0, headers.length, 0, depth, cellPropsMap);
      }

    const headerCellPropsListRef = useRef(headerCellPropsList);


    const handleEvent = useCallback((eventName: string, worksheet: Worksheet) => {
        // blur 시 선택 셀 초기화 막는 이벤트
        if(eventName === "onblur") {
            const selectedCell = spreadsheet!.current![0].selectedContainer;
            worksheet.updateSelectionFromCoords(selectedCell[0], selectedCell[1]);
            return false;
        }
        
        if(eventName === "onresizecolumn") {
            console.log("eventName : ", eventName);
            console.log("onresizecolumn : ", worksheet.options.columns);
            const selectedCell = spreadsheet!.current![0].selectedContainer;
            const col = Number(selectedCell[0]);
            const row = Number(selectedCell[1]);
            const headers = spreadsheet!.current![0].getHeaders().split(",");
            setSelectedPos({ col, row });
            const address = `${headers[col]}${row + 1}`;

            const headerList = headerCellPropsListRef.current;
            const existing = headerList.find((x) => x.address === address);
            if (existing) {
                console.log("existing : ", existing);
                // setFormData({
                //     accessorKey: existing.props.accessorKey ?? "",
                //     header: existing.props.header ?? "",
                //     type: existing.props.type ?? "input",
                //     editable: existing.props.editable ?? true,
                //     width: existing.props.width ?? "",
                // });
            }
        }
        
        if(eventName === "onselection") {
            const selectedCell = spreadsheet!.current![0].selectedContainer;
            const col = Number(selectedCell[0]);
            const row = Number(selectedCell[1]);
            const headers = spreadsheet!.current![0].getHeaders().split(",");
            setSelectedPos({ col, row });
            const address = `${headers[col]}${row + 1}`;
            setSelectedCellAddress(address);

            // headerCellPropsList 대신 ref 사용
            const headerList = headerCellPropsListRef.current;
            const existing = headerList.find((x) => x.address === address);
            console.log("existing : ", existing, headerList);
            if (existing) {
                setFormData({
                    accessorKey: existing.props.accessorKey ?? "",
                    header: existing.props.header ?? "",
                    type: existing.props.type ?? "input",
                    editable: existing.props.editable ?? true,
                    width: existing.props.width ?? "",
                    draggable: existing.props.draggable ?? false,
                    resizable: existing.props.resizable ?? true,
                    align: (existing.props.align as any) ?? "left",
                    required: existing.props.required ?? false,
                    isParent: existing.props.isParent ?? false,
                });
            } else {
                setFormData({
                    accessorKey: "",
                    header: "",
                    type: "input",
                    editable: true,
                    width: "",
                    draggable: false,
                    resizable: true,
                    align: "left",
                    required: false,
                    isParent: false,
                });
            }
        }
    }, []);
      

    useEffect(() => {
        headerCellPropsListRef.current = headerCellPropsList;
    }, [headerCellPropsList]);


    return (
        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            <div>
                <div style={{width:"400px", }}>
                    <Button onClick={() => {
                        const rawData = spreadsheet!.current![0].getData();

                        // 0번째 배열은 header, 1부터는 children들을 의미
                        const rowDatas = rawData;
                        const headers = spreadsheet!.current![0].getHeaders().split(",").map((header:string, index:number) => {
                            return {
                                header,
                                width: spreadsheet!.current![0].options.columns[index]?.width ?? undefined,
                            }

                        });
                        const mergeData = spreadsheet!.current![0].getMerge();

                        console.log("spreadsheet!.current![0] : ", spreadsheet!.current![0]);
                        console.log("options : ", spreadsheet!.current![0].options);

                        // options에 있는 width 값 가져오기
                        const width = spreadsheet!.current![0].options.columns[0].width;
                        console.log("width : ", width, headers);

                        // options에 있는 data도 가져올 수 있지 않을까?



                        const cellPropsMap = toCellPropsMap(headers, headerCellPropsList);
                        const resultHeaders = buildColumnsFromJSS(headers, rowDatas, mergeData, undefined, cellPropsMap);

                        console.log("resultHeaders : ", resultHeaders);

                        setTable2Headers(resultHeaders as ColumnNode[]);
                    }}>
                        Grid Table 예시 적용
                    </Button>
                    <Button onClick={() => {
                        const selectedCell = spreadsheet!.current![0].selectedContainer;
                        const headers = spreadsheet!.current![0].getHeaders().split(",");
                        if (Array.isArray(selectedCell)) {
                            const col = Number(selectedCell[0]);
                            const row = Number(selectedCell[1]);

                            setSelectedPos({ col, row });
                            const address = `${headers[col]}${row + 1}`;
                            setSelectedCellAddress(address);
                            const existing = headerCellPropsList.find((x) => x.address === address);
                            if (existing) {
                                setFormData({
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
                                setFormData({
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
                    </Button>
                </div>
                <div style={{width:"70%", height:"100%", display:"flex", alignItems:"start", gap:"40px" }}>
                    <div style={{display:"flex", flexDirection:"column", gap:"40px" }}>
                        <Spreadsheet ref={spreadsheet} toolbar={true} onevent={handleEvent}>
                            <Worksheet minDimensions={[6,6]} />
                        </Spreadsheet>

                        {/* 테이블 설정 영역 */}
                        <TableSettingArea />
                        <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => { setDemoTableOpen(true); }}>Demo Table 보기</Button>
                    </div>
                    {/* 셀 설정 영역 */}
                    <CellSettingArea spreadsheet={spreadsheet} />
                </div>
            </div>

            
            <Dialog open={demoTableOpen} size="xl" onClose={() => { setDemoTableOpen(false); }} 
                title="예시 테이블"
                dialogContent={
                    <Box sx={{width:"100%", height:"400px", padding: "20px 5px"}}>
                        <Table2 title={title} columns={table2Headers as any} data={[]} checkbox={checkbox} No={noDisplay} isTotal={totalDisplay} 
                            isPlusButton={plusButtonDisplay}
                            pagination={paginationDisplay ? { page: 1, size: 10, totalElements: 100, totalPages: 10, onPageChange: (page) => { console.log(page); } } : undefined}
                        />
                    </Box>
                }
            />
            {/* 해당 부분 컴포넌트로 따로 빼서 관리해야함 */}
        </div>
    );
}