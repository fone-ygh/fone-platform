import { useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Dialog as FoneDialog } from "fone-design-system_v1";

import useComponentStore from "@/features/componentManagement/store/component";

import useDialogStore from "../../store/dialog";
import Actions from "./Actions";
import DialogContent from "./DialogContent";

export default function StyleDialog() {
  const [styleData, setStyleData] = useState<
    { [key: string]: any } | undefined
  >();
  const { isOpen, setIsOpen } = useDialogStore();

  const columns = [
    {
      accessorKey: "width",
      title: "너비(px)",
      type: "inputNum",
      required: true,
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
    <FoneDialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      size="sm"
      dialogTitle="스타일"
      dialogContent={
        <DialogContent setStyleData={setStyleData} columns={columns} />
      }
      actions={<Actions styleData={styleData} />}
    />
  );
}
