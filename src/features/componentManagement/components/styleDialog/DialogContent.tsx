import styled from "@emotion/styled";
import { VerticalTable } from "fone-design-system_v1";

import { ButtonStyleData } from "@/features/componentManagement/store/component";

import useDataStore from "../../input/store/data";

interface DialogContentProps {
  setStyleData: React.Dispatch<
    React.SetStateAction<ButtonStyleData | undefined>
  >;
  columns: any[];
}

export default function DialogContent({
  setStyleData,
  columns,
}: DialogContentProps) {
  const { selectedData } = useDataStore();

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
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;
