import { Button } from "fone-design-system_v1";

import useCodeTypeStore from "../../store/codeType";
import useDialogStore from "../../store/dialog";

export default function Actions() {
  const { setIsOpen } = useDialogStore();
  const { selectedGroupCode, selectedGroupName, setGroupCode, setGroupName } =
    useCodeTypeStore();

  const selectedHandler = () => {
    setGroupCode(selectedGroupCode);
    setGroupName(selectedGroupName);
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
    </>
  );
}
