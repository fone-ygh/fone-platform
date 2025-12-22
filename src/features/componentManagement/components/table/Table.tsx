import styled from "@emotion/styled";
import { Table2 } from "fone-design-system_v1";

import useDataStore from "../../input/store/data";
import useIdxStore from "../../input/store/idx";

interface TableProps {
  data: any[];
  setData: (data: any[]) => void;
  columns: any[];
}

export default function Table({ data, setData, columns }: TableProps) {
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
