import { Dialog as FoneDialog } from "fone-design-system_v1";

import useDialogStore from "../../store/dialog";
import Actions from "./Actions";
import DialogContent from "./DialogContent";

export default function DataDialog() {
  const { isDataOpen, setIsDataOpen } = useDialogStore();

  return (
    <FoneDialog
      open={isDataOpen}
      onClose={() => setIsDataOpen(false)}
      size="xl"
      dialogTitle="소스목록"
      dialogContent={<DialogContent />}
      actions={<Actions />}
    />
  );
}
