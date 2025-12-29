import { Dialog as FoneDialog } from "fone-design-system_v1";

import useDialogStore from "../../store/dialog";
import Actions from "./Actions";
import DialogContent from "./DialogContent";

export default function DataDialog() {
  const { isOpen, setIsOpen } = useDialogStore();

  return (
    <FoneDialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      size="xl"
      dialogTitle="소스목록"
      dialogContent={<DialogContent />}
      actions={<Actions />}
    />
  );
}
