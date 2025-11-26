import { Box, Button, Select, TextField2 } from 'fone-design-system_v1';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { HeaderCellConfig } from '../interface/type';
import { Spreadsheet, Worksheet } from '@jspreadsheet-ce/react';
import { useTableSettingActions, useTableSettingStore } from '../store/tableSettingStore';

const CellSettingArea = ({spreadsheet}: {spreadsheet: React.RefObject<Spreadsheet>}) => {

    const { selectedPos } = useTableSettingStore();

    const { selectedCellAddress, formData, headerCellPropsList } = useTableSettingStore();
    const { setFormData, setHeaderCellPropsList } = useTableSettingActions();
    
    console.log("formData : ", formData);

    const [selectItems, setSelectItems] = useState<{label:string, value:string}[]>([]);

    // 선택된 셀 변경 시 해당 셀에 저장된 selectItems를 로드
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!selectedCellAddress) {
                setSelectItems([]);
                return;
            }
            const current = headerCellPropsList.find((x) => x.address === selectedCellAddress);
            if (current?.props?.type === 'select') {
                setSelectItems((current.props.selectItems as {label:string, value:string}[] | undefined) ?? []);
            } else {
                setSelectItems([]);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [selectedCellAddress, headerCellPropsList]);

    const resetCell = (worksheet: Worksheet, address: string, header?: string, overrideSelectItems?: {label:string, value:string}[]) => {
        worksheet.setValue(address, header ?? "");
        if (overrideSelectItems) {
            setSelectItems(overrideSelectItems);
            return;
        }
        const currentHeaderCellProps = headerCellPropsList.find((x) => x.address === address);
        console.log("currentHeaderCellProps : ", currentHeaderCellProps);
        if (currentHeaderCellProps) {
            setSelectItems((currentHeaderCellProps.props.selectItems as {label:string, value:string}[] | undefined) ?? []);
        }
    }
    
    const selectSettings = [{key: "align", value: ["left", "center", "right"]}, {key: "type", value: ["input", "button", "select", "checkbox", "datePicker"]}]

    return (
        <div style={{width:"50%"}}>
            <div>
                <div style={{fontSize:"20px", fontWeight:"bold"}}>선택 셀 설정 값</div>
                <div>
                    <Box display="flex" flexDirection="column" gap="15px">
                        <p>Selected Cell : {selectedCellAddress || "-"}</p>
                        {formData && 
                            Object.keys(formData).map((key) => {
                                const value = formData[key as keyof typeof formData];
                                if(selectSettings.find((x) => x.key === key)) {
                                    return (
                                        <SettingRow key={key}>
                                            <SettingLabel>{key}</SettingLabel>
                                            <Select key={key} defaultValue={value as any} value={value as any} onChange={(e) => setFormData({ ...formData, [key]: e.target.value as any })} 
                                                MenuItems={selectSettings.find((x) => x.key === key)?.value.map((x) => ({label: x, value: x})) as any} />
                                        </SettingRow>
                                    )
                                }
                                switch(typeof value) {
                                    case "string":
                                        return (
                                            <SettingRow key={key}>
                                                <SettingLabel>{key}</SettingLabel>
                                                <TextField2 type="text" value={value} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                                            </SettingRow>
                                        )
                                    case "boolean":
                                        return (
                                            <SettingRow key={key}>
                                                <SettingLabel>{key}</SettingLabel>
                                                <input type="checkbox" checked={value} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />
                                            </SettingRow>
                                        )
                                    case "object":
                                        return (
                                            <SettingRow key={key}>
                                                <SettingLabel>type</SettingLabel>
                                                <Select defaultValue={formData.type as any} value={formData.type as any} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} 
                                                    MenuItems={[{label: "input", value: "input"}, {label: "button", value: "button"}, {label: "select", value: "select"}, {label: "checkbox", value: "checkbox"}, {label: "datePicker", value: "datePicker"}] as any} />
                                            </SettingRow>
                                        )
                                    default:
                                        return (
                                            <SettingRow key={key}>
                                                <SettingLabel>{key}</SettingLabel>
                                                <TextField2 type="text" value={value} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                                            </SettingRow>
                                        )
                                    }
                                }
                                // return (
                                //     <SettingRow key={key}>
                                //         <SettingLabel>{key}</SettingLabel>
                                //         <TextField2 type="text" value={value} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                                //     </SettingRow>
                                // )
                        )}
                        
                        {formData.type === "select" &&  
                            <SettingRow style={{flexDirection:"column", gap:"10px"}}>
                                <div style={{display:"flex", gap:"10px", justifyContent:"space-between"}}>
                                    <SettingLabel>selectItems</SettingLabel>
                                    <Button variant="contained" onClick={() => setSelectItems([...selectItems, {label: "", value: ""}])}>추가</Button>
                                </div>
                                {/* <TextField2 type="text" onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} /> */}
                                <Box sx={{display:"flex", gap:"10px", flexDirection:"column", paddingLeft:"30px"}}>
                                    {selectItems.map((item: {label:string, value:string}, index) => (
                                        <Box key={index} style={{display:"flex", gap:"10px"}}>
                                            <SettingLabel>label {index + 1}</SettingLabel>
                                            <TextField2 value={item.label} onChange={(e) => setSelectItems([...selectItems.slice(0, index), { label: e.target.value, value: item.value }, ...selectItems.slice(index + 1)])} />
                                            <SettingLabel>value {index + 1}</SettingLabel>
                                            <TextField2 value={item.value} onChange={(e) => setSelectItems([...selectItems.slice(0, index), { label: item.label, value: e.target.value }, ...selectItems.slice(index + 1)])} />
                                        </Box>
                                    ))}
                                </Box>
                            </SettingRow>
                        }

                            <Button 
                                variant="contained"
                                onClick={() => {
                                    console.log("headerCellPropsList : ", headerCellPropsList);
                                    if (!spreadsheet.current) return;
                                    const headers = spreadsheet.current[0].getHeaders().split(",");
                                    if (!selectedPos) return;
                                    const address = `${headers[selectedPos.col]}${selectedPos.row + 1}`;
                                    const mergedProps = formData.type === "select" ? { ...formData, selectItems } : { ...formData };
                                    const next: HeaderCellConfig = {
                                        address,
                                        col: selectedPos.col,
                                        row: selectedPos.row,
                                        props: { ...mergedProps },
                                    };

                                    const setHeaderCellPropsListData = () => {
                                        const prev = headerCellPropsList;
                                        const idx = prev.findIndex((x) => x.address === address);
                                        if (idx >= 0) {
                                            const copy = prev.slice();
                                            copy[idx] = next;
                                            return copy;
                                        }
                                        return [...prev, next];
                                    }
                                    setHeaderCellPropsList(setHeaderCellPropsListData());
                                    resetCell(spreadsheet.current![0] as Worksheet, address, formData.header as string, formData.type === "select" ? selectItems : undefined);
                                }}
                            >저장</Button>
                    </Box>
                </div>
            </div>
            
        </div>
    )
}

export default CellSettingArea;

const SettingRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

const SettingLabel = styled.div`
    width: 100px;
`;

const SettingInput = styled.input`
    width: 300px;
`;

const SettingSelect = styled.select`
    width: 300px;
`;