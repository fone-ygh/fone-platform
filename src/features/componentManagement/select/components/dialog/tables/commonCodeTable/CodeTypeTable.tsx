import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "@/features/componentManagement/select/store/codeType";
import useDataStore from "@/features/componentManagement/select/store/data";
import useDialogStore from "@/features/componentManagement/select/store/dialog";

export default function CodeTypeTable() {
  const { codeTypeData, setCodeTypeData, setCommonCodeData } = useDataStore();
  const { setCheckedRows, setSelectedCheckedRows } = useCodeTypeStore();
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

    const updatedData = codeTypeData.filter(item => {
      return !rows.find(row => row.groupCode === item.groupCode);
    });

    setCodeTypeData([...newData, ...updatedData]);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = codeTypeData.filter(item => {
      return !rows.find(row => row.groupCode === item.groupCode);
    });

    setCodeTypeData(newData);
  };

  const onRowClickHandler = (row: any) => {
    setCommonCodeData(row.commonCodeData || []);
  };

  const onRowDoubleClickHandler = (row: any) => {
    setCheckedRows([row]);
    setIsOpen(false);
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
      rowClickTriggerIdx={0}
      onChecked={onCheckedHandler}
      checkbox
    />
  );
}
