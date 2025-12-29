import styled from "@emotion/styled";
import { VerticalTable } from "fone-design-system_v1";

import { CheckboxStyleData } from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";

interface DialogContentProps {
  setStyleData: React.Dispatch<
    React.SetStateAction<CheckboxStyleData | undefined>
  >;
}

export default function DialogContent({ setStyleData }: DialogContentProps) {
  const { selectedData } = useDataStore();

  const columns = [
    {
      accessorKey: "color",
      title: "색상",
      type: "select",
      required: true,
      menuItems: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Error", value: "error" },
        { label: "Info", value: "info" },
        { label: "Success", value: "success" },
        { label: "Warning", value: "warning" },
        { label: "Default", value: "default" },
      ],
    },
  ];

  return (
    <DialogContentStyle>
      <VerticalTable
        items={columns}
        totalColumns={2}
        colGroup={colGroup}
        data={selectedData.style}
        onTableChange={data => setStyleData(data)}
      />
    </DialogContentStyle>
  );
}
const colGroup = ["16rem", ""];

const DialogContentStyle = styled.div`
  height: 40px;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;
