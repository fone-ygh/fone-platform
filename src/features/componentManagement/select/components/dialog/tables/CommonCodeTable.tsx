import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "../../../store/codeType";
import useDataStore from "../../../store/data";

export default function CommonCodeTable() {
  const { selectedGroupCode } = useCodeTypeStore();
  const {
    commonCodeData: data,
    codeTypeData,
    setCodeTypeData,
    setCommonCodeData,
  } = useDataStore();

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

    const updatedData = data.filter(item => {
      return !rows.find(row => row.code === item.code);
    });

    const updatedCodeTypeData = codeTypeData.map(ctd => {
      if (ctd.groupCode === selectedGroupCode) {
        return {
          ...ctd,
          commonCodeData: [...newData, ...updatedData],
        };
      }

      return ctd;
    });

    setCodeTypeData(updatedCodeTypeData);
    setCommonCodeData([...newData, ...updatedData]);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = data.filter(item => {
      return !rows.find(row => row.code === item.code);
    });

    const updatedCodeTypeData = codeTypeData.map(ctd => {
      if (ctd.groupCode === selectedGroupCode) {
        return {
          ...ctd,
          commonCodeData: newData,
        };
      }
      return ctd;
    });

    setCodeTypeData(updatedCodeTypeData);
    setCommonCodeData(newData);
  };

  return (
    <Table2
      title="공통코드"
      // @ts-ignore
      columns={columns}
      data={data}
      onSave={onSaveHandler}
      onDelete={onDeleteHandler}
      checkbox
    />
  );
}
