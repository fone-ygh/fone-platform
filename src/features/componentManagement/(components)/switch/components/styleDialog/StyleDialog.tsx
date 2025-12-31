import { useState } from "react";
import { Dialog as FoneDialog } from "fone-design-system_v1";

import { CheckboxStyleData } from "@/features/componentManagement/store/component";

import useDialogStore from "../../store/dialog";
import Actions from "./Actions";
import DialogContent from "./DialogContent";

export default function StyleDialog() {
  const [styleData, setStyleData] = useState<CheckboxStyleData | undefined>();
  const { isOpen, setIsOpen } = useDialogStore();

  return (
    <FoneDialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      size="sm"
      dialogTitle="스타일"
      dialogContent={<DialogContent setStyleData={setStyleData} />}
      actions={<Actions styleData={styleData} />}
    />
  );
}
