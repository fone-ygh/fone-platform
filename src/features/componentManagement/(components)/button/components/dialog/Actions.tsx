import { Button } from "fone-design-system_v1";

import useComponentStore, {
  ButtonStyleData,
} from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

interface ActionsProps {
  styleData: ButtonStyleData | undefined;
}

export default function Actions({ styleData }: ActionsProps) {
  const { setIsOpen } = useDialogStore();
  const { buttonData, setButtonData } = useComponentStore();
  const { selectedData, setSelectedData } = useDataStore();
  const { idx } = useIdxStore();

  const selectedHandler = () => {
    if (!styleData || !selectedData) return;

    let updatedData = [];

    if (
      selectedData.crud === "C" &&
      buttonData.find(data => data.componentId === selectedData.componentId) ===
        undefined
    ) {
      updatedData = [{ ...selectedData, style: styleData }, ...buttonData];
    } else {
      updatedData = buttonData.map((data, index) => {
        if (index === idx) {
          return {
            ...selectedData,
            style: styleData,
          };
        }

        return data;
      });
    }

    setButtonData(updatedData);
    setSelectedData({ ...selectedData, style: styleData });
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
