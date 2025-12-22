import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "@/features/componentManagement/select/store/codeType";
import useIdxStore from "@/features/componentManagement/select/store/idx";
import useComponentStore from "@/features/componentManagement/store/component";

export default function CommonCodeTable() {
  const { dialogIdx: idx } = useIdxStore();
  const { selectedCheckedRows } = useCodeTypeStore();
  const { codeTypeData, setCodeTypeData } = useComponentStore();

  const columns = [
    {
      accessorKey: "code",
      header: "코드",
      width: "16%",
      required: true,
      editable: true,
      type: (row: any) => (row.crud === "C" ? "input" : "text"),
      align: "center",
    },
    {
      accessorKey: "codeName",
      header: "코드명",
      width: "24%",
      required: true,
      editable: true,
    },
    {
      accessorKey: "codeDescription",
      header: "코드내용",
      required: true,
      editable: true,
    },
  ];

  const onSaveHandler = (rows: any[]) => {
    const newData = rows.map(item => {
      return {
        code: item.code,
        codeName: item.codeName,
        codeDescription: item.codeDescription,
      };
    });

    const updatedData = codeTypeData[idx].commonCodeData.filter(item => {
      return !rows.find(row => row.code === item.code);
    });

    const updatedCodeTypeData = codeTypeData.map(ctd => {
      if (ctd.groupCode === selectedCheckedRows[0].groupCode) {
        return {
          ...ctd,
          commonCodeData: [...newData, ...updatedData],
        };
      }

      return ctd;
    });

    setCodeTypeData(updatedCodeTypeData);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = codeTypeData[idx].commonCodeData.filter(item => {
      return !rows.find(row => row.code === item.code);
    });

    const updatedCodeTypeData = codeTypeData.map(ctd => {
      if (ctd.groupCode === selectedCheckedRows[0].groupCode) {
        return {
          ...ctd,
          commonCodeData: newData,
        };
      }
      return ctd;
    });

    setCodeTypeData(updatedCodeTypeData);
  };

  return (
    <Table2
      title="공통코드"
      // @ts-ignore
      columns={columns}
      data={codeTypeData[idx].commonCodeData}
      onSave={onSaveHandler}
      onDelete={onDeleteHandler}
      checkbox
    />
  );
}
