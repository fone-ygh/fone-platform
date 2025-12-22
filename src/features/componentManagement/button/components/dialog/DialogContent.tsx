import styled from "@emotion/styled";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { VerticalTable } from "fone-design-system_v1";

import { StyleData } from "@/shared/store/components/component";

import useDataStore from "../../store/data";

interface DialogContentProps {
  setStyleData: React.Dispatch<React.SetStateAction<StyleData | undefined>>;
}

export default function DialogContent({ setStyleData }: DialogContentProps) {
  const { selectedData } = useDataStore();

  const columns = [
    {
      accessorKey: "width",
      title: "너비(px)",
      type: "inputNum",
      required: true,
    },
    {
      accessorKey: "color",
      title: "색상",
      type: "color",
      required: true,
    },
    {
      accessorKey: "variant",
      title: "종류",
      type: "select",
      required: true,
      menuItems: [
        {
          value: "contained",
          label: "채움",
        },
        {
          value: "outlined",
          label: "테두리",
        },
        {
          value: "text",
          label: "텍스트",
        },
      ],
    },
    {
      accessorKey: "icon",
      title: "아이콘",
      type: "file",
      accept: "image/*",
      icon: <AddPhotoAlternateIcon sx={{ fontSize: 18 }} />,
    },
    {
      accessorKey: "iconPosition",
      title: "아이콘위치",
      type: "select",
      required: true,
      disabled: (data: any) => {
        return !data.icon;
      },
      menuItems: [
        {
          value: "left",
          label: "왼쪽",
        },
        {
          value: "right",
          label: "오른쪽",
        },
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
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;
