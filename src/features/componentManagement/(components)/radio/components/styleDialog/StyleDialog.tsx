import { useState } from "react";
import { Dialog as FoneDialog } from "fone-design-system_v1";

import { RadioStyleData } from "@/features/componentManagement/store/component";

import useDialogStore from "../../store/dialog";
import Actions from "./Actions";
import DialogContent from "./DialogContent";

export default function StyleDialog() {
  const [styleData, setStyleData] = useState<RadioStyleData | undefined>();
  const { isStyleOpen, setIsStyleOpen } = useDialogStore();

  return (
    <FoneDialog
      open={isStyleOpen}
      onClose={() => setIsStyleOpen(false)}
      size="sm"
      dialogTitle="스타일"
      dialogContent={<DialogContent setStyleData={setStyleData} />}
      actions={<Actions styleData={styleData} />}
    />
  );
}
