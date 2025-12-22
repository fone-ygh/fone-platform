import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "@/features/componentManagement/select/store/codeType";
import useDataStore from "@/features/componentManagement/select/store/data";
import useDialogStore from "@/features/componentManagement/select/store/dialog";

export default function ApiTable() {
  const { apiData: data } = useDataStore();
  const { setCheckedRows, setSelectedCheckedRows } = useCodeTypeStore();
  const { setIsOpen } = useDialogStore();

  const columns = [
    {
      accessorKey: "groupCode",
      header: "API코드",
      width: "16%",
      align: "center",
    },
    {
      accessorKey: "groupName",
      header: "API명",
      width: "24%",
    },
    {
      accessorKey: "groupDescription",
      header: "API내용",
    },
  ];

  const onCheckedHandler = (rows: any[]) => {
    setSelectedCheckedRows(rows);
  };

  const onRowDoubleClickHandler = (row: any) => {
    setCheckedRows([row]);
    setIsOpen(false);
  };

  return (
    <Table2
      title="목록"
      // @ts-ignore
      columns={columns}
      data={data}
      checkbox
      isPlusButton={false}
      onRowDoubleClick={onRowDoubleClickHandler}
      onChecked={onCheckedHandler}
    />
  );
}
