import { Button } from "fone-design-system_v1";

import useDataStore, { StyleData } from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

interface ActionsProps {
  styleData: StyleData | undefined;
}

export default function Actions({ styleData }: ActionsProps) {
  const { setIsOpen } = useDialogStore();
  const { data, setData } = useDataStore();
  const { idx } = useIdxStore();

  const selectedHandler = () => {
    setData(
      data.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            style: styleData || item.style,
          };
        }
        return item;
      }),
    );
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
