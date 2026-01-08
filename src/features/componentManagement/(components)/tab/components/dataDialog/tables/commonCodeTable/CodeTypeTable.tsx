import { Table2 } from "fone-design-system_v1";

import useComponentStore from "@/features/componentManagement/store/component";

import useCodeTypeStore from "../../../../store/codeType";
import useDialogStore from "../../../../store/dialog";
import useIdxStore from "../../../../store/idx";

export default function CodeTypeTable() {
  const { idx, setIdx } = useIdxStore();
  const { codeTypeData, setCodeTypeData } = useComponentStore();
  const { setCheckedRows, setSelectedCheckedRows } = useCodeTypeStore();
  const { setIsDataOpen } = useDialogStore();

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

  const onSaveHandler = (rows: any[], allData: any[]) => {
    const newData = rows.map(item => {
      return {
        groupCode: item.groupCode,
        groupName: item.groupName,
        groupDescription: item.groupDescription,
        commonCodeData: item.commonCodeData || [],
      };
    });

    const updatedData = codeTypeData.filter(item => {
      return !rows.find(row => row.groupCode === item.groupCode);
    });

    const rowIdx = allData.findIndex(
      item => item.groupCode === rows[0].groupCode,
    );

    setCodeTypeData([...newData, ...updatedData]);
    setSelectedCheckedRows(rows);
    setIdx(rowIdx);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = codeTypeData.filter(item => {
      return !rows.find(row => row.groupCode === item.groupCode);
    });

    setCodeTypeData(newData);
  };

  const onRowClickHandler = (row: any, index: number) => {
    setSelectedCheckedRows([row]);
    setIdx(index);
  };

  const onRowDoubleClickHandler = (row: any) => {
    setCheckedRows([row]);
    setIsDataOpen(false);
  };

  const onCheckedHandler = (checkedRows: any[]) => {
    setSelectedCheckedRows(checkedRows);
  };

  return (
    <Table2
      title="코드유형"
      // @ts-ignore
      columns={columns}
      data={codeTypeData}
      onSave={onSaveHandler}
      onDelete={onDeleteHandler}
      onRowClick={onRowClickHandler}
      onRowDoubleClick={onRowDoubleClickHandler}
      rowClickTriggerIdx={idx}
      onChecked={onCheckedHandler}
      checkbox
    />
  );
}
