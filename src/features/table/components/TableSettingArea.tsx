import React from 'react'
import styled from 'styled-components'
import { useTableSettingStore, useTableSettingActions } from '../store/tableSettingStore';
import { TextField2 } from 'fone-design-system_v1';

const TableSettingArea = () => {
    const { checkbox, noDisplay, paginationDisplay, totalDisplay, plusButtonDisplay, title } = useTableSettingStore();
    const { setCheckbox, setNoDisplay, setPaginationDisplay, setTotalDisplay, setPlusButtonDisplay, setTitle } = useTableSettingActions();
    return (
        <Container>
            <FunctionRow >
                <label htmlFor="title">제목 표시</label>
                <TextField2 type="input" id="title" value={title ?? ""} onChange={(e) => setTitle(e.target.value)} sx={{width:"70%"}} />
            </FunctionRow>
            <FunctionRow >
                <label htmlFor="checkboxSelect">체크박스 선택 가능</label>
                <input type="checkbox" id="checkboxSelect" checked={checkbox} onChange={(e) => setCheckbox(e.target.checked)} />
            </FunctionRow>
            <FunctionRow >
                <label htmlFor="noDisplay">No 표시</label>
                <input type="checkbox" id="noDisplay" checked={noDisplay} onChange={(e) => setNoDisplay(e.target.checked)} />
            </FunctionRow>
            <FunctionRow >
                <label htmlFor="paginationDisplay">페이지네이션 표시</label>
                <input type="checkbox" id="paginationDisplay" checked={paginationDisplay} onChange={(e) => setPaginationDisplay(e.target.checked)} />
            </FunctionRow>
            <FunctionRow >
                <label htmlFor="totalDisplay">합계 표시(total)</label>
                <input type="checkbox" id="totalDisplay" checked={totalDisplay} onChange={(e) => setTotalDisplay(e.target.checked)} />
            </FunctionRow>
            <FunctionRow>
                <label htmlFor="plusButtonDisplay">플러스 버튼 표시</label>
                <input type="checkbox" id="plusButtonDisplay" checked={plusButtonDisplay} onChange={(e) => setPlusButtonDisplay(e.target.checked)} />
            </FunctionRow>
        </Container>
    );
}

export default TableSettingArea;

const Container = styled.div`
    width: 100%;
    height: 100%;
`;

const FunctionRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
    justify-content: space-between;
`;