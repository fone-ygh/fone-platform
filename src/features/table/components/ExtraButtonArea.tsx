import React from 'react'
import styled from 'styled-components'
import { useTableSettingStore, useTableSettingActions } from '../store/tableSettingStore';
import { Button } from 'fone-design-system_v1';
import { useJspreadSheetStore } from '../store/jspreadSheetStore';
import { colIndexToLetter } from '../util/tableUtil';
import { HeaderCellConfig } from '../interface/type';

const MergeButtonArea = () => {
    const { checkbox, noDisplay, paginationDisplay, totalDisplay, plusButtonDisplay, title } = useTableSettingStore();
    const { setCheckbox, setNoDisplay, setPaginationDisplay, setTotalDisplay, setHeaderCellPropsList, setPlusButtonDisplay, setTitle } = useTableSettingActions();
    const { spreadsheet } = useJspreadSheetStore();

    
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
        console.log("tabular : ", tabular);
        const result = await tabular(file);
        console.log("result : ", result);

        // jspreadsheet-ce 인스턴스에 데이터 주입
        const inst = spreadsheet?.worksheets?.[0];
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
                    spreadsheet!.worksheets![0].setData(json.data);
                    // merge 객체가 {"A1":[3,1]} 형태일 경우 처리
                    Object.entries(json.mergeData).forEach(([cellName, arr]: [string, any]) => {
                        if (Array.isArray(arr) && arr.length >= 2) {
                            spreadsheet!.worksheets![0].setMerge(cellName, arr[0], arr[1]);
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
        const rawData = spreadsheet!.worksheets![0].getData();
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
        const mergeData = spreadsheet!.worksheets![0].getMerge(); // 병합정보

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

    return (
        <Container>
            <FunctionRow >
            <Button variant="contained" size="small" sx={{width:"100%"}} 
                onClick={() => { 
                    // setDemoTableOpen(true);
                }}
                >Demo Table 보기</Button>
            </FunctionRow>
            <FunctionRow>
                <Button variant="contained" size="small" sx={{width:"100%"}} onClick={importData}>import Data</Button>
            </FunctionRow>
            <FunctionRow>
                <Button variant="contained" size="small" sx={{width:"100%"}} onClick={exportData}>export Data</Button>
            </FunctionRow>
            <FunctionRow>
                <Button variant="contained" size="small" sx={{width:"100%"}} 
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.onchange = load;
                            input.click();
                        }}>엑셀 불러오기</Button>
            </FunctionRow>
            <FunctionRow>
                <Button variant="contained" size="small" sx={{width:"100%"}} onClick={() => {
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
                            const inst = spreadsheet?.worksheets?.[0];
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

                            // // 3. Table2 용 헤더도 재생성
                            // recomputeTable2Headers();

                        }}>더미 데이터 넣기</Button>
            </FunctionRow>
        </Container>
    );
}

export default MergeButtonArea;

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const FunctionRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
    justify-content: space-between;
`;