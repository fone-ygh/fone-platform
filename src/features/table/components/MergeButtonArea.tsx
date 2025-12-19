import React from 'react'
import styled from 'styled-components'
import { useTableSettingStore, useTableSettingActions } from '../store/tableSettingStore';
import { Button } from 'fone-design-system_v1';
import { useJspreadSheetStore } from '../store/jspreadSheetStore';
import { colIndexToLetter } from '../util/tableUtil';

const MergeButtonArea = () => {
    // const { checkbox, noDisplay, paginationDisplay, totalDisplay, plusButtonDisplay, title } = useTableSettingStore();
    // const { setCheckbox, setNoDisplay, setPaginationDisplay, setTotalDisplay, setPlusButtonDisplay, setTitle } = useTableSettingActions();
    const { spreadsheet: spreadsheetStore } = useJspreadSheetStore();
    return (
        <Container>
            <FunctionRow >
                <Button variant="contained" size="small" sx={{width:"100%"}} 
                    onClick={() => {
                        const instance = spreadsheetStore?.worksheets?.[0];
                        const [x1, y1, x2, y2] = instance.selectedContainer as [number, number, number, number];
                        const colStart = Math.min(x1, x2);
                        const rowStart = Math.min(y1, y2);
                        const colspan = Math.abs(x2 - x1) + 1;
                        const rowspan = Math.abs(y2 - y1) + 1;

                        const cellName = `${colIndexToLetter(colStart)}${rowStart + 1}`;
                        if (instance) {
                            instance.setMerge(cellName, colspan, rowspan);
                        }
                    }}
                >셀 병합(total)</Button>
            </FunctionRow>
            <FunctionRow>
                <Button variant="contained" size="small" sx={{width:"100%"}}
                    onClick={() => {
                        const instance = spreadsheetStore?.worksheets?.[0];
                        if(instance) {
                            const selectedCell = instance.selectedContainer;
                            if (Array.isArray(selectedCell) && selectedCell.length === 4 && selectedCell.every((v:any) => typeof v === "number")) {
                                const [x1, y1, x2, y2] = selectedCell as [number, number, number, number];
                                const colStart = Math.min(x1, x2);
                                const rowStart = Math.min(y1, y2);
                                const cellName = `${colIndexToLetter(colStart)}${rowStart + 1}`;
                                instance.removeMerge(cellName);
                            }
                        }
                    }}
                >병합 해제</Button>
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