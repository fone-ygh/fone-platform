import { Box, Button, Select, TextField2 } from 'fone-design-system_v1';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { HeaderCellConfig } from '../interface/type';
import { Spreadsheet, Worksheet } from '@jspreadsheet-ce/react';
import { getHeaderCellPropsListData, useTableSettingActions, useTableSettingStore } from '../store/tableSettingStore';

const CellSettingArea = ({spreadsheet}: {spreadsheet: React.RefObject<Spreadsheet>}) => {


    const { selectedPos, selectedCellAddress, formData, headerCellPropsList } = useTableSettingStore();
    const { setFormData, setHeaderCellPropsList } = useTableSettingActions();
    console.log("formData : ", formData)
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
        // address가 "A1:A1" 같은 범위 형태면 좌상단 단일 셀 주소로 변환
        const singleAddress = address.includes(":") ? address.split(":")[0] : address;
        worksheet.setValue(singleAddress, header ?? "");
        if (overrideSelectItems) {
            setSelectItems(overrideSelectItems);
            return;
        }
        const currentHeaderCellProps = headerCellPropsList.find((x) => x.address === address);
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
                                            <Select key={key} defaultValue={value as any} value={value as any} onChange={(e) => {
                                                setFormData({ ...formData, [key]: e.target.value as any, ...(key === "type" && e.target.value === "select" ? {selectItems: []} : {})})
                                            }} 
                                                MenuItems={selectSettings.find((x) => x.key === key)?.value.map((x) => ({label: x, value: x})) as any} />
                                        </SettingRow>
                                    )
                                }
                                switch(typeof value) {
                                    case "string":
                                        return (
                                            <SettingRow key={key}>
                                                <SettingLabel>{key}</SettingLabel>
                                                <TextField2 type="text" value={value} onChange={(e) => {
                                                    console.log("string e.target.value : ", e.target.value)
                                                    setFormData({ ...formData, [key]: e.target.value })}
                                                    } />
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
                                            <SettingRow key={key} style={{flexDirection:"column", gap:"10px"}}>
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
                                        )
                                    default:
                                        return (
                                            <SettingRow key={key}>
                                                <SettingLabel>{key}</SettingLabel>
                                                <TextField2 type="text" value={value ?? ""} onChange={(e) => {
                                                    console.log("e.target.value : ", e.target.value)
                                                    setFormData({ ...formData, [key]: e.target.value })
                                                }} />
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
                        
                        

                            <Button 
                                variant="contained"
                                onClick={() => {
                                    if (!spreadsheet.current) return;
                                    const headers = spreadsheet.current[0].getHeaders().split(",");
                                    if (!selectedPos) return;
                                    // 주소를 단일이더라도 "A1:A1" 형태로 통일
                                    const address = `${headers[selectedPos.startCol]}${selectedPos.startRow + 1}:${headers[selectedPos.endCol]}${selectedPos.endRow + 1}`;
                                    // const mergedProps = formData.type === "select" ? { ...formData, selectItems } : { ...formData };
                                    // const next: HeaderCellConfig = {
                                    //     address,
                                    //     startCol: selectedPos.startCol,
                                    //     startRow: selectedPos.startRow,
                                    //     endCol: selectedPos.endCol,
                                    //     endRow: selectedPos.endRow,
                                    //     props: { ...mergedProps },
                                    // };

                                    setHeaderCellPropsList(getHeaderCellPropsListData(address));
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