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
        const dataRows = rowDatas.slice(headerDepth + 1);
        console.log("inferType dataRows : ", dataRows);
        const samples = dataRows.slice(0, 20).map((r) => r?.[col]).filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
        console.log("inferType samples : ", samples);
        if (samples.length === 0) return "input";
        const numericLike = samples.every((v) => /^-?\d+(\.\d+)?$/.test(String(v)));
        return numericLike ? "number" : "input";
    }

    function getAddress(headers: string[], startCol: number, startRow: number, endCol: number, endRow: number) {
        return `${headers[startCol]}${startRow + 1}:${headers[endCol]}${endRow + 1}`;
    }

    function getAddressFromHeader(headers: { header: string; width?: number | string }[], col: number, row: number) {
        return `${headers[col].header}${row + 1}`;
    }

    // 배열을 map으로 변환하여 빠르게 조회
    function toCellPropsMap(headers: { header: string; width?: number | string }[], list: HeaderCellConfig[]) {
        const map: Record<string, Partial<HeaderCellProps>> = {};
        for (const item of list) {
            const addr = getAddressFromHeader(headers, item.startCol, item.startRow);
            console.log("toCellPropsMap addr : ", addr, item.props, headers);
            map[addr] = { ...map[addr], ...item.props, width: headers[item.startCol].width };
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
      
        console.log("buildLevel headers : ", headers);
        console.log("buildLevel startCol : ", startCol, "endCol : ", endCol);
        while (col < endCol) {
          const { colspan } = getMergeSpan(mergeData, headers, col, level);
          const spanCols = Math.min(colspan, endCol - col);
          const nameHere = rowDatas[level]?.[col];
          const overrideProps = getPropsForCell(cellPropsMap, headers, col, level);
          const hasOverrideHeader = !!(overrideProps?.header && String(overrideProps.header).trim() !== "");
          const hasNameHere = !!(nameHere !== null && nameHere !== undefined && String(nameHere).trim() !== "");
          const safeName = (overrideProps?.header && String(overrideProps.header).trim() !== "")
            ? String(overrideProps.header)
            : ((nameHere !== null && nameHere !== undefined && String(nameHere).trim() !== "")
                ? String(nameHere)
                : findNameFallback(rowDatas, col, level, headers));

          // 현재 레벨이 마지막 헤더 레벨이 아니더라도,
          // - 명시적으로 isParent=false 이거나
          // - colspan==1 이고 하위 레벨들에 유효한 값/머지/오버라이드가 전혀 없으면
          //   => 그룹을 만들지 않고, 이 위치에서 곧바로 리프를 생성한다.
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
                // 하위 레벨들 중 하나라도 값/오버라이드 헤더/머지(colspan>1)가 있으면 그룹으로 간주
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
            // 현재 레벨 셀에 입력(또는 override header)이 없으면 그룹 헤더를 만들지 않고 자식만 평탄화
            if (hasOverrideHeader || hasNameHere) {
              const children = buildLevel(headers, rowDatas, mergeData, col, col + spanCols, level + 1, headerDepth, cellPropsMap);
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
              const children = buildLevel(headers, rowDatas, mergeData, col, col + spanCols, level + 1, headerDepth, cellPropsMap);
              for (const child of children) nodes.push(child);
              col += spanCols;
            }
          } else if (level < headerDepth - 1) {
            // 하위 레벨이 있지만 그룹 조건을 만족하지 않으므로, 현재 레벨에서 바로 리프 처리
            const leafOverride = overrideProps;
            if (hasOverrideHeader || hasNameHere) {
                console.log("leafOverride headers[col] : ", headers[col], headers);
              nodes.push({
                key: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[col].header,
                accessorKey: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[col].header,
                header: hasOverrideHeader ? String(overrideProps?.header) : String(nameHere),
                type: (leafOverride?.type as ColumnNode["type"]) || inferType(rowDatas, headerDepth, col),
                editable: leafOverride?.editable ?? true,
                width: headers[col].width ?? undefined,
                // draggable: leafOverride?.draggable ?? false,
                resizable: leafOverride?.resizable ?? true,
                align: (leafOverride?.align as any) ?? "left",
                required: leafOverride?.required ?? false,
                selectItems: leafOverride?.selectItems ?? [],
                role: "leaf",
              });
            }
            col += spanCols;
          } else {
            // 리프 노드들
            for (let c = col; c < col + spanCols; c++) {
              const leafOverride = getPropsForCell(cellPropsMap, headers, c, level);
              const hasLeafOverrideHeader = !!(leafOverride?.header && String(leafOverride.header).trim() !== "");
              const cellVal = rowDatas[level]?.[c];
              const hasLeafNameHere = !!(cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== "");
              const leafName = hasLeafOverrideHeader ? String(leafOverride.header) : (hasLeafNameHere ? String(cellVal) : "");

                if (hasLeafOverrideHeader || hasLeafNameHere) {
                    nodes.push({
                    key: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[c].header,
                    accessorKey: (leafOverride?.accessorKey && String(leafOverride.accessorKey).trim() !== "") ? String(leafOverride.accessorKey) : headers[c].header,
                    header: leafName,
                    type: (leafOverride?.type as ColumnNode["type"]) || inferType(rowDatas, headerDepth, c),
                    editable: leafOverride?.editable ?? true,
                    width: headers[c].width ?? undefined,
                    // draggable: leafOverride?.draggable ?? false,
                    resizable: leafOverride?.resizable ?? true,
                    align: (leafOverride?.align as any) ?? "left",
                    required: leafOverride?.required ?? false,
                    selectItems: leafOverride?.selectItems ?? [],
                    // disabled: leafOverride?.disabled ?? false,
                    // readonly: leafOverride?.readonly ?? false,
                    });
                }
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
            const inst = spreadsheet?.current?.[0];
            const selectedCell = inst?.selectedContainer;
            if (Array.isArray(selectedCell) && selectedCell.length === 4 && selectedCell.every((v:any) => typeof v === "number")) {
                worksheet.updateSelectionFromCoords(...(selectedCell as [number, number, number, number]));
                return false;
            }
            return;
        }
        
        if(eventName === "onresizecolumn") {
            const inst = spreadsheet?.current?.[0];
            const selectedCell = inst?.selectedContainer;
            if (!Array.isArray(selectedCell) || selectedCell.length < 2) return;
            const startCol = Number(selectedCell[0]);
            const startRow = Number(selectedCell[1]);
            const endCol = Number(selectedCell[2]);
            const endRow = Number(selectedCell[3]);
            const headers = inst?.getHeaders().split(",") ?? [];
            setSelectedPos({ startCol, startRow, endCol, endRow });
            const address = `${headers[startCol]}${startRow + 1}`;

            const headerList = headerCellPropsListRef.current;
            const existing = headerList.find((x) => x.address === address);
            if (existing) {
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
            const inst = spreadsheet?.current?.[0];
            const selectedCell = inst?.selectedContainer;

            if (!Array.isArray(selectedCell) || selectedCell.length < 2) return;

            const startCol = Number(selectedCell[0]);
            const startRow = Number(selectedCell[1]);
            const endCol = Number(selectedCell[2]);
            const endRow = Number(selectedCell[3]);
            const headers = inst?.getHeaders().split(",") ?? [];
            const address = getAddress(headers, startCol, startRow, endCol, endRow);
            setSelectedPos({ startCol, startRow, endCol, endRow });
            console.log("onselection address : ", address);
            setSelectedCellAddress(address);
            const headerList = headerCellPropsListRef.current;
            console.log("onselection headerList : ", headerList);
            console.log("onselection startCol : ", startCol, "startRow : ", startRow, "endCol : ", endCol, "endRow : ", endRow);
            const existing = headerList.find((x:any) => x.startCol === startCol && x.startRow === startRow && x.endCol === endCol && x.endRow === endRow);
            console.log("onselection existing : ", existing);
            if (existing) {
                setFormData({
                    accessorKey: existing.props.accessorKey ?? "",
                    header: existing.props.header ?? "",
                    type: existing.props.type ?? "input",
                    editable: existing.props.editable ?? true,
                    width: existing.props.width ?? "",
                    draggable: existing.props.draggable ?? false,
                    resizable: existing.props.resizable ?? true,
                    align: existing.props.align ?? "left",
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

    const importData = () => {
        // 파일 input을 동적으로 만들어 txt 파일을 읽고 json 파싱하여 setData, setMerge 설정
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            try {
                const json = JSON.parse(text);
                // json은 {data, mergeData} 형태가 되어야 함
                if (json && Array.isArray(json.data)) {
                    spreadsheet!.current![0].setData(json.data);
                    // merge 객체가 {"A1":[3,1]} 형태일 경우 처리
                    Object.entries(json.mergeData).forEach(([cellName, arr]: [string, any]) => {
                        if (Array.isArray(arr) && arr.length >= 2) {
                            spreadsheet!.current![0].setMerge(cellName, arr[0], arr[1]);
                        }
                    });
                } else {
                    alert("파일의 형식이 잘못되었습니다. {data: [...], mergeData: {...}} 형태여야 합니다.");
                }
            } catch (err) {
                alert("파일을 읽는 도중 오류가 발생했거나, 올바른 JSON 파일이 아닙니다.");
            }
        };
        input.click();
        // 파일 선택이 끝났을 때 exportDataState가 있는 경우 데이터를 설정
        // input.addEventListener('blur', () => {
        //     if (exportDataState) {
        //         console.log("exportDataState : ", exportDataState);
        //         spreadsheet!.current![0].setData(exportDataState.data);
        //         spreadsheet!.current![0].setMerge(exportDataState.mergeData);
        //     } else {
        //         alert("데이터가 없습니다.");
        //     }
        // });
    }

    const exportData = () => {
        // getData()로 데이터를 가져올 때, 각 컬럼 인덱스별로 한 row라도 값이 ''(empty string)이 있으면 그것도 포함해 모두 수집
        // 추가로 getMerge 데이터도 같이 반환
        const rawData = spreadsheet!.current![0].getData();
        // row 전체가 '' 값이면 해당 row는 없앤다.
        // row에 값이 있다면 마지막 값이 있는곳까지만 잘라서 return한다.
        const cleanedData = rawData
            .filter((row: any[]) => row.some((cell: any) => cell !== ''))
            .map((row: any[]) => {
                // 마지막 값이 있는 인덱스를 찾는다
                let lastNonEmptyIdx = -1;
                row.forEach((cell: any, idx: number) => {
                    if (cell !== '') lastNonEmptyIdx = idx;
                });
                // 마지막 값이 있는곳까지 자른 row 반환
                return row.slice(0, lastNonEmptyIdx + 1);
            });

        // 각 row(배열)의 길이 중 최댓값을 구함
        const maxLen = rawData.reduce((max: number, row: any[]) => Math.max(max, row.length), 0);
        // 각 row를 maxLen 길이에 맞춰서 slice
        const data = rawData.map((row: any[]) => row.slice(0, maxLen));
        const mergeData = spreadsheet!.current![0].getMerge(); // 병합정보

        const exportObj = { data, mergeData }; // 데이터를 { data, mergeData }형태의 오브젝트로 정리
        // exportObj를 txt로 변환 (JSON 직렬화 사용)
        const txtContent = JSON.stringify(exportObj, null, 2);

        // 파일 저장 함수
        function downloadFile(content: string, fileName: string, mimeType: string) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
        downloadFile(txtContent, "spreadsheet-export.txt", "text/plain");

        return { data, mergeData };
    }

    useEffect(() => {
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

        const cellPropsMap = toCellPropsMap(headers, headerCellPropsList);
        console.log("headerCellPropsList : ", headerCellPropsList);
        console.log("cellPropsMap : ", cellPropsMap);
        const resultHeaders = buildColumnsFromJSS(headers, rowDatas, mergeData, undefined, cellPropsMap);
        console.log("resultHeaders : ", resultHeaders);
        setTable2Headers(resultHeaders as ColumnNode[]);
    }, [headerCellPropsList, spreadsheet]);

    return (
        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            <div>
                <div style={{width:"80%", height:"100%", display:"flex", alignItems:"start", gap:"40px" }}>
                    <div style={{display:"flex", flexDirection:"column", gap:"40px" }}>
                        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                            <Button variant="contained" size="small" sx={{width:"200px", marginTop:"10px"}} onClick={() => {

                                // setMerge가 동작 중 selected 영역이 엘리먼트가 아니라 값일 때 에러가 날 수 있으므로, 
                                // setMerge를 호출하기 전에 선택 영역이 정상적으로 선택되어 있는지 확인합니다.
                                // 이를 위해 selectedContainer의 값이 유효한지 검사.
                                const instance = spreadsheet?.current?.[0];
                                if (
                                    instance &&
                                    Array.isArray(instance.selectedContainer) &&
                                    instance.selectedContainer.length === 4 &&
                                    instance.selectedContainer.every((val:any) => typeof val === 'number')
                                ) {
                                    // 선택 영역이 정상적일 때만 setMerge(cellName, colspan, rowspan) 호출
                                    const [x1, y1, x2, y2] = instance.selectedContainer as [number, number, number, number];
                                    const colStart = Math.min(x1, x2);
                                    const rowStart = Math.min(y1, y2);
                                    const colspan = Math.abs(x2 - x1) + 1;
                                    const rowspan = Math.abs(y2 - y1) + 1;

                                    const colIndexToName = (index: number) => {
                                        let name = "";
                                        let i = index;
                                        while (i >= 0) {
                                            name = String.fromCharCode((i % 26) + 65) + name;
                                            i = Math.floor(i / 26) - 1;
                                        }
                                        return name;
                                    };

                                    const cellName = `${colIndexToName(colStart)}${rowStart + 1}`;
                                    instance.setMerge(cellName, colspan, rowspan);
                                } else {
                                    alert("셀 병합을 위해 먼저 병합할 셀(영역)을 선택해주세요.");
                                }
                            }}>
                                선택 영역 병합
                            </Button>
                            <Spreadsheet ref={spreadsheet} onevent={handleEvent}>
                                <Worksheet minDimensions={[10,10]} />
                            </Spreadsheet>
                        </div>

                        {/* 테이블 설정 영역 */}
                        <TableSettingArea />
                        <div style={{display:"flex", gap:"10px"}}>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => { 
                                console.log("table2Headers : ", table2Headers);
                                setDemoTableOpen(true);
                            }}>Demo Table 보기</Button>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={importData}>import Data</Button>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={exportData}>export Data</Button>
                        </div>
                    </div>
                    {/* 셀 설정 영역 */}
                    <CellSettingArea spreadsheet={spreadsheet} />
                </div>
            </div>

            
            <Dialog open={demoTableOpen} size="xl" onClose={() => { setDemoTableOpen(false); }} 
                title="예시 테이블"
                dialogContent={
                    <Box sx={{width:"100%", minHeight:"400px", padding: "20px 5px"}}>
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