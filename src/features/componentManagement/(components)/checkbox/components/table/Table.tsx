import styled from "@emotion/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Button, Table2 } from "fone-design-system_v1";

import useComponentStore from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

export default function Table() {
  const { checkboxData: data, setCheckboxData: setData } = useComponentStore();
  const { setIsOpen } = useDialogStore();
  const { idx, setIdx } = useIdxStore();
  const { setSelectedData } = useDataStore();

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
    setIdx(rowIdx);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = data.filter(
      item => !rows.find((row: any) => row.componentId === item.componentId),
    );

    setData(newData);
  };

  const onRowClickHandler = (row: any, index: number) => {
    const safeRow = {
      ...row,
      style: {
        width: row.style?.width || "",
        color: row.style?.color || "",
        variant: row.style?.variant || "",
        icon: row.style?.icon || null,
        iconPosition: row.style?.iconPosition || "",
      },
    };
    setSelectedData(safeRow);
    setIdx(index);
  };

  const onCheckedHandler = (rows: any[], index: number, allRows: any[]) => {
    setSelectedData(allRows[idx]);
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
      header: "타이틀",
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
          <Button onClick={() => setIsOpen(true)} size="sm" fullWidth>
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
    },
    {
      accessorKey: "defaultChecked",
      header: "defaultChecked",
      editable: true,
      type: "select",
      required: true,
      selectItems: [
        { value: "Y", label: "checked" },
        { value: "N", label: "unchecked" },
      ],
    },
  ];

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
        rowClickTriggerIdx={idx}
        onChecked={onCheckedHandler}
      />
    </TableContainerStyle>
  );
}

const TableContainerStyle = styled.div`
  width: 100%;
  height: 400px;
`;
