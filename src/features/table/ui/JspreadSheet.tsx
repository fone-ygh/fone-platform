'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { Box, Button, Dialog, Table2 } from "fone-design-system_v1";
import TableSettingArea from "../components/TableSettingArea";
import { getHeaderCellPropsListData, useTableSettingActions, useTableSettingStore } from "../store/tableSettingStore";
import { HeaderCellConfig, ColumnNode } from "../interface/type";
import CellSettingArea from "../components/CellSettingArea";
import {
    buildColumnsFromJSS,
    colIndexToLetter,
    getAddress,
    toCellPropsMap,
    stableDetectHeaderDepth,
} from "../util/tableUtil";
import { attachDefaultComponents } from "../util/renderers";



export default function JspreadSheet() {

    // Spreadsheet array of worksheets
    const spreadsheet = useRef<Spreadsheet>(null);

    // Table Setting 값을 담는 store
    const { checkbox, noDisplay, paginationDisplay, totalDisplay, plusButtonDisplay, headerCellPropsList, title, formData } = useTableSettingStore();
    const { setSelectedCellAddress, setFormData, setSelectedPos, setHeaderCellPropsList } = useTableSettingActions();


    const [table2Headers, setTable2Headers] = useState<ColumnNode[]>([]);

    const [demoTableOpen, setDemoTableOpen] = useState(false);

    const toCellPropsMapRef = useRef(toCellPropsMap);
    const buildColumnsFromJSSRef = useRef(buildColumnsFromJSS);
    const headerCellPropsListRef = useRef(headerCellPropsList);



    const recomputeTable2Headers = useCallback(() => {
        const inst = spreadsheet?.current?.[0];

        if (!inst) return;

        const rawData = inst.getData();
        const headers = inst.getHeaders().split(",").map((header:string, index:number) => {
            return {
                header,
                accessorKey: (() => {
                    const columnLetter = colIndexToLetter(index);

                    // If merged, determine the corresponding range; otherwise, use single cell
                    if (inst?.options?.merge) {
                        const mergeKey = Object.keys(inst.options.merge).find(key =>
                            key.replace(/[^A-Z]/g, "") === columnLetter
                        );
                        if (mergeKey && Array.isArray(inst.options.merge[mergeKey])) {
                            const [colspan, rowspan] = inst.options.merge[mergeKey];
                            if (colspan > 1 || rowspan > 1) {
                                // Calculate end letter and row based on colspan/rowspan
                                const colStart = index;
                                const colEnd = colStart + colspan - 1;
                                const rowStart = 1;
                                const rowEnd = rowStart + rowspan - 1;

                                // Function to get column letter from index
                                const colIndexToLetter = (colIdx: number) => {
                                    let name = "";
                                    let i = colIdx;
                                    while (i >= 0) {
                                        name = String.fromCharCode((i % 26) + 65) + name;
                                        i = Math.floor(i / 26) - 1;
                                    }
                                    return name;
                                };

                                return `${colIndexToLetter(colStart)}${rowStart}:${colIndexToLetter(colEnd)}${rowEnd}`;
                            }
                        }
                    }
                    return `${columnLetter}1`;
                })(),
                width: inst.options.columns[index]?.width ?? undefined,
            }
        });
        const mergeData = inst.getMerge();
        const cellPropsMap = toCellPropsMapRef.current(headers, headerCellPropsListRef.current);
        const resultHeaders = buildColumnsFromJSSRef.current(headers, rawData, mergeData, undefined, cellPropsMap) as ColumnNode[];
        const hydrated = attachDefaultComponents(resultHeaders, (col) => {
            // 기본 버튼 클릭 핸들러 (필요시 교체 가능)
        });
        setTable2Headers(hydrated as ColumnNode[]);
    }, []);


    const handleEvent = useCallback((eventName: string, worksheet: Worksheet) => {
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
              ;
            if (!Array.isArray(selectedCell) || selectedCell.length < 2) return;
            const startCol = Number(selectedCell[0]);
            const startRow = Number(selectedCell[1]);
            const endCol = Number(selectedCell[2]);
            const endRow = Number(selectedCell[3]);
            const headers = inst?.getHeaders().split(",").map((header:string, index:number) => {
                return {
                    header,
                    width: inst.options.columns[index]?.width ?? undefined,
                }
            });
            setSelectedPos({ startCol, startRow, endCol, endRow });
            const address = getAddress(headers.map((h:{header:string}) => h.header), startCol, startRow, endCol, endRow);
            const width = headers?.[startCol]?.width ?? undefined;
            const headerList = headerCellPropsListRef.current;
            const existing = headerList.find((x:any) => x.address === address);
            if (existing) {
                setFormData({
                    accessorKey: existing.props.accessorKey ?? "",
                    header: existing.props.header ?? "",
                    type: existing.props.type ?? "input",
                    editable: existing.props.editable ?? true,
                    // draggable: existing.props.draggable ?? false,
                    // resizable: existing.props.resizable ?? true,
                    align: existing.props.align ?? "left",
                    required: existing.props.required ?? false,
                    isParent: existing.props.isParent ?? false,
                    width: width ?? existing.props.width ?? undefined,
                });
                setHeaderCellPropsList(getHeaderCellPropsListData(address));
            }
        }
        
        if (eventName === "onchange" || eventName === "onafterchanges" || eventName === "onmerge" || eventName === "onbeforeunmerge") {
            const inst = spreadsheet?.current?.[0];
            if (!inst) return;
            const selected = inst.selectedContainer;
            if (!Array.isArray(selected) || selected.length !== 4 || !selected.every((v:any) => typeof v === "number")) return;

            const [x1, y1, x2, y2] = selected as [number, number, number, number];
            const colStart = Math.min(x1, x2);
            const rowStart = Math.min(y1, y2);
            const colEnd = Math.max(x1, x2);
            const rowEnd = Math.max(y1, y2);

            const headers = inst.getHeaders().split(",") ?? [];
            const rangeAddress = getAddress(headers, colStart, rowStart, colEnd, rowEnd);

            // 선택 상태 동기화
            setSelectedPos({ startCol: colStart, startRow: rowStart, endCol: colEnd, endRow: rowEnd });
            setSelectedCellAddress(rangeAddress);

            // 병합/해제 시, 겹치는 설정만 정리
            if (eventName === "onmerge" || eventName === "onbeforeunmerge") {
                const prev = headerCellPropsListRef.current;
                const filtered = prev.filter((x:any) => (x.endCol < colStart || x.startCol > colEnd || x.endRow < rowStart || x.startRow > rowEnd));
                setHeaderCellPropsList(filtered);
            }

            // 단일 셀 편집 시 패널 header 동기화 (헤더 영역에 한함)
            if (eventName === "onchange" || eventName === "onafterchanges") {
                const raw = inst.getData();
                const mergeData = inst.getMerge();
                const headerDepth = stableDetectHeaderDepth(raw, mergeData);
                if (rowStart <= headerDepth && colStart === colEnd && rowStart === rowEnd) {
                    const val = raw?.[rowStart]?.[colStart] ?? "";
                    setHeaderCellPropsList(getHeaderCellPropsListData(rangeAddress));
                }
                
            }

            recomputeTable2Headers();
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
            setSelectedCellAddress(address);
            // 선택한 셀(좌상단) 값으로 formData.header 동기화
            const raw = inst.getData();
            const selectedHeaderVal = raw?.[startRow]?.[startCol] ?? "";
            const headerList = headerCellPropsListRef.current;
            const existing = headerList.find((x:any) => x.address === address);

            // 기존 설정이 있으면 나머지 필드는 유지하고 header만 현재 선택 셀 값으로 변경
            if (existing) {
                setFormData({
                    accessorKey: existing.props.accessorKey ?? "",
                    header: String(selectedHeaderVal ?? ""),
                    type: (existing.props.type as any) ?? "input",
                    editable: existing.props.editable ?? true,
                    width: existing.props.width ?? undefined,
                    align: (existing.props.align as any) ?? "left",
                    required: existing.props.required ?? false,
                    isParent: existing.props.isParent ?? false,
                    selectItems: existing.props.selectItems ?? undefined,
                });
            } else {
                setFormData({
                    accessorKey: "",
                    header: String(selectedHeaderVal ?? ""),
                    type: "input",
                    editable: true,
                    align: "left",
                    width: "",
                    required: false,
                    isParent: false,
                    // width: undefined,
                });
            }
        }
    }, [recomputeTable2Headers, setFormData, setSelectedCellAddress, setSelectedPos, setHeaderCellPropsList]);
      

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

    // 브라우저에서 UMD 스크립트를 주입해 window.tabularjs를 확보
    const ensureTabularjs = async (): Promise<any> => {
        if (typeof window === "undefined") {
            throw new Error("tabularjs는 브라우저에서만 사용 가능합니다.");
        }
        const existing = (window as any).tabularjs;
        if (existing) return existing;
        await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/tabularjs@1.0.1/dist/index.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("tabularjs 스크립트 로드 실패"));
            document.head.appendChild(script);
        });
        const t = (window as any).tabularjs;
        if (!t) throw new Error("tabularjs 글로벌 로드 실패");
        return t;
    };

    const load = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (typeof window === "undefined") return; // 브라우저 전용

        const tabular: any = await ensureTabularjs();

        const result = await tabular(file);

        // jspreadsheet-ce 인스턴스에 데이터 주입
        const inst = spreadsheet?.current?.[0];
        const ws = result?.worksheets?.[0];
        if (inst && ws) {
            inst.setData(ws.data ?? []);
            const merge = ws.mergeCells ?? {};
            Object.entries(merge).forEach(([cell, span]: any) => {
                if (Array.isArray(span) && span.length >= 2) {
                    inst.setMerge(cell, span[0], span[1]);
                }
            });
        }
    };

    useEffect(() => {
        recomputeTable2Headers();
    }, [headerCellPropsList, recomputeTable2Headers]);

    return (
        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            <div>
                <div style={{width:"80%", height:"100%", display:"flex", alignItems:"start", gap:"40px" }}>
                    <div style={{display:"flex", flexDirection:"column", gap:"40px" }}>
                        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                            <div style={{display:"flex", gap:"10px", marginTop:"10px"}}>
                                <Button variant="contained" size="small" sx={{width:"200px" }} onClick={() => {

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

                                        const cellName = `${colIndexToLetter(colStart)}${rowStart + 1}`;
                                        instance.setMerge(cellName, colspan, rowspan);
                                        recomputeTable2Headers();
                                    } else {
                                        alert("셀 병합을 위해 먼저 병합할 셀(영역)을 선택해주세요.");
                                    }
                                }}>
                                    선택 영역 병합
                                </Button>
                                <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => {
                                    const instance = spreadsheet?.current?.[0];
                                    if (instance) {
                                        const selectedCell = instance.selectedContainer;
                                        if (Array.isArray(selectedCell) && selectedCell.length === 4 && selectedCell.every((v:any) => typeof v === "number")) {
                                            const [x1, y1, x2, y2] = selectedCell as [number, number, number, number];
                                            const colStart = Math.min(x1, x2);
                                            const rowStart = Math.min(y1, y2);
                                            const cellName = `${colIndexToLetter(colStart)}${rowStart + 1}`;
                                            instance.removeMerge(cellName);
                                            recomputeTable2Headers();
                                        }
                                    } else {
                                        alert("병합 해제할 셀(영역)을 선택해주세요.");
                                    }
                                }}>
                                    선택 영역 병합 해제
                                </Button>
                            </div>
                            <Spreadsheet ref={spreadsheet} onevent={handleEvent} contextMenu={(e: any) => {
                                console.log("onContextMenu : ", e);
                                // e.preventDefault();
                                return false;
                            }}
                            >
                                <Worksheet minDimensions={[10,10]} />
                            </Spreadsheet>
                        </div>

                        {/* 테이블 설정 영역 */}
                        <TableSettingArea />
                        <div style={{display:"flex", gap:"10px"}}>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => { 
                                setDemoTableOpen(true);
                            }}>Demo Table 보기</Button>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={importData}>import Data</Button>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={exportData}>export Data</Button>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.onchange = load;
                                input.click();
                            }}>엑셀 불러오기</Button>
                            <Button variant="contained" size="small" sx={{width:"200px"}} onClick={() => {
                            // 더미 데이터 정의
                            const dummyHeaders = [
                                { header: "A" },
                                { header: "B" },
                                { header: "C" },
                                { header: "D" },
                                { header: "E" },
                            ];
                            const dummyData = [
                                ["이름", "부서", "직급", "입사일", "근무상태"],
                            ];

                            // 더미 셀 설정 값 예시 (type, selectItems 등)
                            const dummyHeaderCellPropsList: HeaderCellConfig[] = [
                                {
                                    address: "D1:D1",
                                    startCol: 3,
                                    startRow: 0,
                                    endCol: 3,
                                    endRow: 0,
                                    props: { header: "입사일", type: "datePicker"}
                                },
                                {
                                    address: "E1:E1",
                                    startCol: 4,
                                    startRow: 0,
                                    endCol: 4,
                                    endRow: 0,
                                    props: { header: "근무상태", type: "select", selectItems: [
                                        { label: "재직", value: "재직" },
                                        { label: "퇴사", value: "퇴사" },
                                    ] }
                                }
                            ];

                            // 1. sheet에 실제 데이터 집어넣기
                            const inst = spreadsheet?.current?.[0];
                            if (inst) {
                                // 헤더 입력
                                dummyHeaders.forEach((h, colIdx) => {
                                    inst.setHeader(colIdx, h.header);
                                });
                                // 데이터 입력
                                for (let row = 0; row < dummyData.length; row++) {
                                    for (let col = 0; col < dummyData[row].length; col++) {
                                        inst.setValueFromCoords(col, row, dummyData[row][col]);
                                    }
                                }
                            }

                            // 2. headerCellPropsList도 반영
                            setHeaderCellPropsList(dummyHeaderCellPropsList);

                            // 3. Table2 용 헤더도 재생성
                            recomputeTable2Headers();

                            }}>더미 데이터 넣기</Button>
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
                        <Table2 isEditView={false} title={title} columns={table2Headers as any} data={[]} checkbox={checkbox} No={noDisplay} isTotal={totalDisplay} 
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