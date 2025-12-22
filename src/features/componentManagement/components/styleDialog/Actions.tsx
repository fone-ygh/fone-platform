import { Button } from "fone-design-system_v1";

import useDataStore from "../../input/store/data";
import useDialogStore from "../../input/store/dialog";
import useIdxStore from "../../input/store/idx";

interface ActionsProps {
  styleData: { [key: string]: any } | undefined;
  data: any[];
  setData: (data: any[]) => void;
}

export default function Actions({ styleData, data, setData }: ActionsProps) {
  const { setIsOpen } = useDialogStore();

  const { selectedData, setSelectedData } = useDataStore();
  const { idx } = useIdxStore();

  const selectedHandler = () => {
    if (!styleData || !selectedData) return;

    let updatedData = [];

    if (
      selectedData.crud === "C" &&
      data.find(data => data.componentId === selectedData.componentId) ===
        undefined
    ) {
      updatedData = [{ ...selectedData, style: styleData }, ...data];
    } else {
      updatedData = data.map((data, index) => {
        if (index === idx) {
          return {
            ...selectedData,
            style: styleData,
          };
        }

        return data;
      });
    }

    setData(updatedData as any);
    setSelectedData({ ...selectedData, style: styleData as any });
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
