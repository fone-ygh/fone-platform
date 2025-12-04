import { useState } from "react";
import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "../../../store/codeType";
import useDataStore from "../../../store/data";
import useDialogStore from "../../../store/dialog";

export default function CodeTypeTable() {
  const [idx, setIdx] = useState(0);

  const {
    codeTypeData: data,
    setCodeTypeData: setData,
    setCommonCodeData,
  } = useDataStore();
  const {
    setSelectedGroupCode,
    setSelectedGroupName,
    setGroupCode,
    setGroupName,
  } = useCodeTypeStore();
  const { setIsOpen } = useDialogStore();

  const columns = [
    {
      accessorKey: "groupCode",
      header: "그룹코드",
      align: "center",
      width: "16%",
      required: true,
      editable: true,
      type: (row: any) => (row.crud === "C" ? "input" : "text"),
    },
    {
      accessorKey: "groupName",
      header: "그룹명",
      width: "24%",
      required: true,
      editable: true,
    },
    {
      accessorKey: "groupDescription",
      header: "그룹내용",
      required: true,
      editable: true,
    },
  ];

  const onSaveHandler = (rows: any[]) => {
    const newData = rows.map(item => {
      return {
        groupCode: item.groupCode,
        groupName: item.groupName,
        groupDescription: item.groupDescription,
        commonCodeData: item.commonCodeData || [],
      };
    });

    const updatedData = data.filter(item => {
      return !rows.find(row => row.groupCode === item.groupCode);
    });

    setData([...newData, ...updatedData]);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = data.filter(item => {
      return !rows.find(row => row.groupCode === item.groupCode);
    });

    setData(newData);
  };

  const onRowClickHandler = (row: any, idx: number) => {
    setCommonCodeData(row.commonCodeData);
    setSelectedGroupCode(row.groupCode);
    setSelectedGroupName(row.groupName);

    setIdx(idx);
  };

  const onRowDoubleClickHandler = (row: any) => {
    setGroupCode(row.groupCode);
    setGroupName(row.groupName);
    setIsOpen(false);
  };

  return (
    <Table2
      title="코드유형"
      // @ts-ignore
      columns={columns}
      data={data}
      onSave={onSaveHandler}
      onDelete={onDeleteHandler}
      onRowClick={onRowClickHandler}
      onRowDoubleClick={onRowDoubleClickHandler}
      rowClickTriggerIdx={idx}
      checkbox
    />
  );
}
