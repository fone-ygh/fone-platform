import { useState } from "react";
import styled from "@emotion/styled";
import { Dialog, Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "../../store/codeType";
import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

export default function Table() {
  const { idx, setIdx } = useIdxStore();
  console.log(idx);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const { setIsOpen } = useDialogStore();
  const { selectData, setSelectData, setSelectedSelectData } = useDataStore();
  const { checkedRows, setCheckedRows, setDataType } = useCodeTypeStore();

  const columns = [
    {
      accessorKey: "componentId",
      header: "ID",
      editable: true,
      type: (row: any) => (row.crud === "C" ? "input" : "text"),
      required: true,
      width: 200,
    },
    {
      accessorKey: "name",
      header: "컴포넌트명",
      editable: true,
      type: "input",
      required: true,
    },
    {
      accessorKey: "label",
      header: "라벨",
      editable: true,
      type: "input",
      required: true,
    },
    {
      accessorKey: "style",
      header: "스타일",
      editable: true,
      type: "input",
    },
    {
      accessorKey: "required",
      header: "필수여부",
      editable: true,
      type: "checkbox",
    },
    {
      accessorKey: "all",
      header: "전체옵션여부",
      editable: true,
      type: "checkbox",
    },
    {
      role: "group",
      header: "데이터",
      columns: [
        {
          accessorKey: "dataType",
          header: "타입",
          editable: true,
          selectItems: [
            { value: "commonCode", label: "공통코드" },
            { value: "api", label: "API" },
          ],
          required: true,
          type: "select",
          onCellChange: (row: any) => (newValue: string) => ({
            ...row,
            dataType: newValue,
            dataSourceCd: "",
            dataSourceNm: "",
          }),
        },
        {
          accessorKey: "dataSourceNm",
          header: "소스",
          type: "modal",
          editable: true,
          required: true,
          modalFn: (row: any) => {
            if (row.dataType === "select" || row.dataType === "") {
              setIsWarningOpen(true);
            } else {
              setDataType(row.dataType);
              setIsOpen(true);
            }
          },
        },
      ],
    },
  ];

  const onSaveHandler = (rows: any[], allData: any[]) => {
    const newData = allData.map((item: any) => {
      return {
        componentId: item.componentId,
        name: item.name,
        label: item.label,
        style: item.style,
        required: item.required,
        all: item.all,
        defaultValue: item.defaultValue,
        dataType: item.dataType,
        dataSourceCd: item.dataSourceCd,
        dataSourceNm: item.dataSourceNm,
      };
    });

    const filteredData = newData.filter(item => item.componentId !== "");

    const rowIdx = allData.findIndex(
      item => item.componentId === rows[0].componentId,
    );

    setSelectData(filteredData);
    setSelectedSelectData(rows[0]);
    setIdx(rowIdx);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = selectData.filter(
      item => !rows.find((row: any) => row.componentId === item.componentId),
    );

    setSelectData(newData);
  };

  const onRowClickHandler = (row: any, index: number) => {
    setSelectedSelectData(row);
    setIdx(index);
  };

  return (
    <TableContainerStyle>
      <Table2
        // @ts-ignore
        columns={columns}
        data={selectData}
        checkbox
        onSave={onSaveHandler}
        onDelete={onDeleteHandler}
        onRowClick={onRowClickHandler}
        rowClickTriggerIdx={idx}
        modalData={{
          dataSourceNm: checkedRows[0]?.groupName,
          dataSourceCd: checkedRows[0]?.groupCode,
        }}
        onModalApplied={() => {
          setCheckedRows([]);
        }}
      />
      <Dialog
        open={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        type="error"
        dialogContent="데이터 타입을 선택해주세요."
      />
    </TableContainerStyle>
  );
}

const TableContainerStyle = styled.div`
  width: 100%;
  height: 400px;
`;
