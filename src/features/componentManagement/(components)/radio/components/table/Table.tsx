import { useState } from "react";
import styled from "@emotion/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Button, Dialog, Table2 } from "fone-design-system_v1";

import useComponentStore from "@/features/componentManagement/store/component";

import useCodeTypeStore from "../../store/codeType";
import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

export default function Table() {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const { radioData: data, setRadioData: setData } = useComponentStore();
  const { setIsStyleOpen, setIsDataOpen } = useDialogStore();
  const { idx, setIdx } = useIdxStore();
  const { selectedData, setSelectedData } = useDataStore();
  const { checkedRows, setCheckedRows, setDataType } = useCodeTypeStore();

  const toSafeRow = (row: any) => {
    if (!row) return row;
    return {
      ...row,
      style: {
        color: row.style?.color || "",
      },
    };
  };

  const columns = [
    {
      accessorKey: "componentId",
      header: "ID",
      editable: true,
      type: (row: any) => (row.crud === "C" ? "input" : "text"),
      required: true,
    },
    {
      accessorKey: "name",
      header: "컴포넌트명",
      editable: true,
      type: "input",
      required: true,
    },
    {
      accessorKey: "title",
      header: "라벨",
      editable: true,
      type: "input",
      required: true,
    },
    {
      accessorKey: "style",
      header: "스타일",
      editable: true,
      type: "custom",
      component: (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button onClick={() => setIsStyleOpen(true)} size="sm" fullWidth>
            <AddCircleOutlineIcon sx={{ fontSize: 18, color: "#4D4D4D" }} />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "required",
      header: "필수여부",
      editable: true,
      type: "checkbox",
      required: true,
      defaultChecked: false,
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
            const rowIdx = data.findIndex(
              item => item.componentId === row.componentId,
            );

            if (rowIdx >= 0) {
              setIdx(rowIdx);
            }
            setSelectedData(toSafeRow(row));

            if (row.dataType !== "commonCode" && row.dataType !== "api") {
              setIsWarningOpen(true);
            } else {
              setDataType(row.dataType);
              setIsDataOpen(true);
            }
          },
        },
      ],
    },
  ];

  const onSaveHandler = (rows: any[], allData: any[]) => {
    const newData = allData.map((item: any) => {
      const { crud, ...rest } = item;
      return rest;
    });

    const filteredData = newData.filter(item => item.componentId !== "");

    const rowIdx = allData.findIndex(
      item => item.componentId === rows[0].componentId,
    );

    setData(filteredData);

    if (rowIdx >= 0) {
      setIdx(rowIdx);
    }
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = data.filter(
      item => !rows.find((row: any) => row.componentId === item.componentId),
    );

    setData(newData);
  };

  const onRowClickHandler = (row: any, index: number) => {
    setSelectedData(toSafeRow(row));
    setIdx(index);
  };

  const onCheckedHandler = (rows: any[], index: number, allRows: any[]) => {
    const nextRow = allRows?.[index] ?? rows?.[0];
    if (!nextRow) return;

    setSelectedData(toSafeRow(nextRow));

    if (typeof index === "number" && index >= 0) {
      setIdx(index);
    }
  };

  return (
    <TableContainerStyle>
      <Table2
        // @ts-ignore
        columns={columns}
        data={data}
        checkbox
        onSave={onSaveHandler}
        onDelete={onDeleteHandler}
        onRowClick={onRowClickHandler}
        onChecked={onCheckedHandler}
        rowClickTriggerIdx={idx}
        modalData={{
          dataSourceNm: checkedRows[0]?.groupName,
          dataSourceCd: checkedRows[0]?.groupCode,
        }}
        onModalApplied={() => {
          const picked = checkedRows[0];
          if (picked) {
            const updatedSelected = {
              ...selectedData,
              dataSourceNm: picked.groupName,
              dataSourceCd: picked.groupCode,
            };

            setSelectedData(toSafeRow(updatedSelected));

            if (idx >= 0 && idx < data.length) {
              const nextData = data.map((item, i) => {
                if (i !== idx) return item;
                return {
                  ...item,
                  dataSourceNm: picked.groupName,
                  dataSourceCd: picked.groupCode,
                };
              });
              setData(nextData);
            }
          }

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
