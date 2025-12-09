import { useEffect } from "react";
import styled from "@emotion/styled";
import SettingsIcon from "@mui/icons-material/Settings";
import { Button, Table2 } from "fone-design-system_v1";

import useCodeTypeStore from "../../store/codeType";
import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";

export default function Table() {
  const { setIsOpen } = useDialogStore();
  const {
    selectData: data,
    setSelectData: setData,
    selectId,
    setSelectId,
  } = useDataStore();
  const { groupCode, groupName } = useCodeTypeStore();

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
      width: "30%",
      columns: [
        {
          accessorKey: "dataType",
          header: "타입",
          editable: true,
          selectItems: [
            { value: "commonCode", label: "공드코드" },
            { value: "api", label: "API" },
          ],
          required: true,
          type: "select",
          width: "15%",
        },
        {
          accessorKey: "dataSourceNm",
          header: "소스",
          type: "custom",
          editable: true,
          width: "15%",
          component: (row: any) => {
            return (
              <DataSourceContainerStyle>
                <span>{row.dataSourceNm}</span>
                <Button
                  sx={{ height: 30 }}
                  size="small"
                  onClick={() => setIsOpen(true)}
                >
                  <SettingsIcon style={{ fontSize: 20 }} />
                </Button>
              </DataSourceContainerStyle>
            );
          },
        },
      ],
    },
  ];

  const onSaveHandler = (rows: any[]) => {
    const newData = rows.map(item => {
      return {
        componentId: item.componentId,
        name: item.name,
        style: item.style,
        required: item.required,
        defaultValue: item.defaultValue,
        dataType: item.dataType,
        dataSourceCd: item.dataSourceCode,
        dataSourceNm: item.dataSourceNm,
      };
    });

    const updatedData = data.filter(item => {
      return !rows.find((row: any) => row.componentId === item.componentId);
    });

    setData([...newData, ...updatedData]);
  };

  const onDeleteHandler = (rows: any[]) => {
    const newData = data.filter(
      item => !rows.find((row: any) => row.componentId === item.componentId),
    );

    setData(newData);
  };

  const onRowClickHandler = (row: any) => {
    setSelectId(row.componentId);
  };

  useEffect(() => {
    if (groupCode && groupName && selectId) {
      const updatedData = data.map(item => {
        if (item.componentId === selectId) {
          return {
            ...item,
            dataSourceCd: groupCode,
            dataSourceNm: groupName,
          };
        }
        return item;
      });
      setData(updatedData);
    }
  }, [groupCode, groupName, selectId]);

  console.log(data);

  return (
    <div>
      <Table2
        // @ts-ignore
        columns={columns}
        data={data}
        checkbox
        onSave={onSaveHandler}
        onDelete={onDeleteHandler}
        onRowClick={onRowClickHandler}
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
