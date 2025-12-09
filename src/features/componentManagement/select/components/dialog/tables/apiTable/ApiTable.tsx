import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "@/features/componentManagement/select/store/codeType";
import useDataStore from "@/features/componentManagement/select/store/data";
import useDialogStore from "@/features/componentManagement/select/store/dialog";

export default function ApiTable() {
  const { apiData: data } = useDataStore();
  const {
    setSelectedGroupCode,
    setSelectedGroupName,
    setGroupCode,
    setGroupName,
  } = useCodeTypeStore();
  const { setIsOpen } = useDialogStore();

  const columns = [
    {
      accessorKey: "apiCode",
      header: "API코드",
      width: "16%",
    },
    {
      accessorKey: "apiName",
      header: "API명",
      width: "24%",
    },
    {
      accessorKey: "apiDescription",
      header: "API내용",
    },
  ];

  const onRowClickHandler = (row: any, idx: number) => {
    setSelectedGroupCode(row.apiCode);
    setSelectedGroupName(row.apiName);
  };

  const onRowDoubleClickHandler = (row: any) => {
    setGroupCode(row.apiCode);
    setGroupName(row.apiName);

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
      onRowClick={onRowClickHandler}
      onRowDoubleClick={onRowDoubleClickHandler}
    />
  );
}
