import { Table2 } from "fone-design-system_v1";

import useComponentStore from "@/features/componentManagement/store/component";

import useCodeTypeStore from "../../../../store/codeType";
import useDialogStore from "../../../../store/dialog";

export default function ApiTable() {
  const { apiData: data } = useComponentStore();
  const { setCheckedRows, setSelectedCheckedRows } = useCodeTypeStore();
  const { setIsDataOpen } = useDialogStore();

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
    setIsDataOpen(false);
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
