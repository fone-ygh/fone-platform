import styled from "@emotion/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { IconButton, Table2 } from "fone-design-system_v1";

import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

export default function Table() {
  const { idx, setIdx } = useIdxStore();
  const { data, setData, setSelectedData } = useDataStore();
  const { setIsOpen } = useDialogStore();

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
          <IconButton onClick={() => setIsOpen(true)}>
            <AddCircleOutlineIcon sx={{ fontSize: 18, color: "#4D4D4D" }} />
          </IconButton>
        </div>
      ),
    },
    {
      accessorKey: "function",
      header: "기능",
      editable: true,
      type: "select",
      required: true,
      selectItems: [
        {
          value: "01",
          label: "조회",
        },
        {
          value: "02",
          label: "팝업",
        },
        {
          value: "03",
          label: "확인",
        },
        {
          value: "04",
          label: "추가",
        },
        {
          value: "05",
          label: "삭제",
        },
      ],
    },
  ];

  const onSaveHandler = (rows: any[], allData: any[]) => {
    const newData = allData.map((item: any) => {
      return {
        componentId: item.componentId,
        name: item.name,
        title: item.title,
        style: item.style,
        function: item.function,
      };
    });

    const filteredData = newData.filter(item => item.componentId !== "");

    const rowIdx = allData.findIndex(
      item => item.componentId === rows[0].componentId,
    );

    setData(filteredData);
    setSelectedData(rows[0]);
    setIdx(rowIdx);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = data.filter(
      item => !rows.find((row: any) => row.componentId === item.componentId),
    );

    setData(newData);
  };

  const onRowClickHandler = (row: any, index: number) => {
    setSelectedData(row);
    setIdx(index);
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
        rowClickTriggerIdx={idx}
      />
    </TableContainerStyle>
  );
}

const TableContainerStyle = styled.div`
  width: 100%;
  height: 400px;
`;
