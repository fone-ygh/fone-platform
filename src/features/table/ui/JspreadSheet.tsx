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
import { useJspreadSheetActions, useJspreadSheetStore } from "../store/jspreadSheetStore";



export default function JspreadSheet() {

    // Spreadsheet array of worksheets
    const spreadsheet = useRef<Spreadsheet>(null);
    // Table Setting 값을 담는 store
    const { checkbox, noDisplay, paginationDisplay, totalDisplay, plusButtonDisplay, headerCellPropsList, title, formData, demoTableOpen, editModeData, tableHeaders } = useTableSettingStore();
    const { setSelectedCellAddress, setFormData, setSelectedPos, setHeaderCellPropsList, setTableHeaders, setDemoTableOpen, setEditModeData } = useTableSettingActions();
    const { setSpreadsheet } = useJspreadSheetActions();

    const [table2Headers, setTable2Headers] = useState<ColumnNode[]>([]);

    // const [demoTableOpen, setDemoTableOpen] = useState(false);

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

        setTableHeaders(hydrated as ColumnNode[]);
        setTable2Headers(hydrated as ColumnNode[]);
    }, [setTableHeaders]);


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
                    ...(getHeaderCellPropsListData(address)[0].props as any),
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
                    // const val = raw?.[rowStart]?.[colStart] ?? "";
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
                    width: existing.props.width ?? "",
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


    useEffect(() => {
        recomputeTable2Headers();
    }, [headerCellPropsList, recomputeTable2Headers, setSpreadsheet]);

    useEffect(() => {
		const blockKeys = (e: any) => {
		  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
			e.preventDefault();
			e.stopImmediatePropagation();
		  }
		};
	  
		window.addEventListener("keydown", blockKeys, { capture: true });
        
        if (editModeData?.data && editModeData?.data.length > 0) {
            const inst = spreadsheet?.current?.[0];
            tableHeaders.forEach((header, index) => {
                // header.key는 'A', 'B', 'C' ... 순이므로 'A' = 0, 'B' = 1 등 숫자 인덱스로 변환해 setWidth 적용
                inst?.setWidth(
                    header.key
                        ? (
                            header.key.split('').reduce((acc, char, idx) => {
                                // Excel style 변환: 'A' = 0, 'B' = 1, ..., 'Z'=25, 'AA'=26, etc.
                                return acc * 26 + (char.charCodeAt(0) - 65);
                            }, 0)
                        )
                        : index, // fallback: 그냥 index
                    header.width ?? 100
                );
            });

            inst?.setData(editModeData.data);
            Object.entries(editModeData.mergeData).forEach(([cell, span]: any) => {
                if (Array.isArray(span) && span.length >= 2) {
                    inst?.setMerge(cell, span[0], span[1]);
                }
            });
        }

		return () => {
		  window.removeEventListener("keydown", blockKeys, { capture: true });
         const inst = spreadsheet?.current?.[0];
         const data = inst?.getData();
         const mergeData = inst?.getMerge();
          setEditModeData({ data: data ?? [], mergeData: mergeData ?? {} });
		};
	  }, []);

    // 현재 화면(width 기준)을 n등분해서 각 등분의 px 값을 반환하는 함수
    const splitScreenWidth = (n: number): number => {
        if (typeof window === "undefined" || n <= 0) return 0;
        const screenWidth = window.innerWidth;
        return (screenWidth - 50) / n;
    };

    // 현재 화면(height)을 기준으로 n등분해서 각 등분의 px 값을 반환하는 함수
    const splitScreenHeight = (n: number): number => {
        if (typeof window === "undefined" || n <= 0) return 0;
        const screenHeight = window.innerHeight;
        return (screenHeight - 50) / n;
    };

    return (
        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            <div>
                <div style={{width:"100%", height:"100%", display:"flex", alignItems:"start", gap:"40px" }}>
                    <div style={{display:"flex", flexDirection:"column", gap:"40px", }}>
                       
                        <Spreadsheet onload={(instance: Spreadsheet) => {
                                // ✅ 이게 "진짜 jspreadsheet 인스턴스"
                                setSpreadsheet(instance);
                            }}
                            ref={spreadsheet} 
                            onevent={handleEvent} 
                            contextMenu={() => {
                                // e.preventDefault();
                                return false;
                            }}
                        >
                            <Worksheet 
                                minDimensions={[10,15]} 
                                defaultColWidth={splitScreenWidth(10)} 
                                defaultRowHeight={splitScreenHeight(20)} 
                                selectionCopy={false}
                            />
                        </Spreadsheet>
                     
                    </div>
                </div>
            </div>

            
            <Dialog open={demoTableOpen} size="xl" onClose={() => { setDemoTableOpen(false); }} 
                title="예시 테이블"
                dialogContent={
                    <Box sx={{width:"100%", minHeight:"400px", padding: "20px 5px"}}>
                        <Table2 isEditView={false} title={title} 
                                columns={table2Headers as any} 
                                data={[{},{},{},{},{}]} 
                                checkbox={checkbox} No={noDisplay} isTotal={totalDisplay} 
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