import styled from "@emotion/styled";
import { Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "../../store/codeType";
import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";

export default function Table() {
  const { setIsOpen } = useDialogStore();
  const { selectData, setSelectData, setSelectIdx } = useDataStore();
  const { groupCode, groupName, setGroupCode, setGroupName, setDataType } =
    useCodeTypeStore();

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
      accessorKey: "style",
      header: "스타일",
      editable: true,
      type: "input",
    },
    {
      accessorKey: "required",
      header: "필수여부",
      editable: true,
      type: "checkbox",
    },
    {
      accessorKey: "defaultValue",
      header: "기본값",
      editable: true,
      type: "checkbox",
    },
    {
      role: "group",
      header: "데이터",
      columns: [
        {
          accessorKey: "dataType",
          header: "타입",
          editable: true,
          selectItems: [
            { value: "commonCode", label: "공통코드" },
            { value: "api", label: "API" },
          ],
          required: true,
          type: "select",
        },
        {
          accessorKey: "dataSourceNm",
          header: "소스",
          type: "modal",
          editable: true,
          modalFn: (row: any) => {
            setDataType(row.dataType);
            setIsOpen(true);
          },
        },
      ],
    },
  ];

  const onSaveHandler = (rows: any[], allData: any[]) => {
    const newData = allData.map((item: any) => {
      return {
        componentId: item.componentId,
        name: item.name,
        style: item.style,
        required: item.required,
        defaultValue: item.defaultValue,
        dataType: item.dataType,
        dataSourceCd: item.dataSourceCd,
        dataSourceNm: item.dataSourceNm,
      };
    });

    const filteredData = newData.filter(item => item.componentId !== "");

    setSelectData(filteredData);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = selectData.filter(
      item => !rows.find((row: any) => row.componentId === item.componentId),
    );

    setSelectData(newData);
  };

  const onRowClickHandler = (row: any, idx: any) => {
    setSelectIdx(idx);
  };

  return (
    <div>
      <Table2
        // @ts-ignore
        columns={columns}
        data={selectData}
        checkbox
        onSave={onSaveHandler}
        onDelete={onDeleteHandler}
        onRowClick={onRowClickHandler}
        modalData={{ dataSourceNm: groupName, dataSourceCd: groupCode }}
        onModalApplied={() => {
          setGroupCode("");
          setGroupName("");
        }}
      />
    </div>
  );
}

const DataSourceContainerStyle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 1.2rem;
  padding-left: 0.8rem;
  justify-content: space-between;
`;
