import { useState } from "react";
import { Button, Dialog } from "fone-design-system_v1";

import useCodeTypeStore from "../../store/codeType";
import useDialogStore from "../../store/dialog";

export default function Actions() {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const { setIsOpen } = useDialogStore();
  const { selectedCheckedRows, setCheckedRows } = useCodeTypeStore();

  const selectedHandler = () => {
    if (selectedCheckedRows.length === 0 || selectedCheckedRows.length > 1) {
      setIsWarningOpen(true);
      return;
    }

    setCheckedRows(selectedCheckedRows);
    setIsOpen(false);
  };

  return (
    <>
      <Button size="small" variant="contained" onClick={selectedHandler}>
        선택
      </Button>
      <Button size="small" variant="outlined" onClick={() => setIsOpen(false)}>
        취소
      </Button>
      <Dialog
        open={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        type="error"
        dialogContent="하나의 항목을 선택해주세요."
      />
    </>
  );
}
