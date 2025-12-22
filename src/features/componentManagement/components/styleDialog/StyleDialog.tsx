import { useState } from "react";
import { Dialog as FoneDialog } from "fone-design-system_v1";

import useDialogStore from "../../input/store/dialog";
import Actions from "./Actions";
import DialogContent from "./DialogContent";

interface DialogProps {
  data: any[];
  setData: (data: any[]) => void;
  columns: any[];
}

export default function StyleDialog({ data, setData, columns }: DialogProps) {
  const [styleData, setStyleData] = useState<
    { [key: string]: any } | undefined
  >();
  const { isOpen, setIsOpen } = useDialogStore();

  return (
    <FoneDialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      size="sm"
      dialogTitle="스타일"
      dialogContent={
        <DialogContent setStyleData={setStyleData} columns={columns} />
      }
      actions={<Actions styleData={styleData} data={data} setData={setData} />}
    />
  );
}
