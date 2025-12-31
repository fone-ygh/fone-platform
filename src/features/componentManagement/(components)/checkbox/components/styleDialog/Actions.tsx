import { Button } from "fone-design-system_v1";

import useComponentStore, {
  CheckboxStyleData,
} from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

interface ActionsProps {
  styleData: CheckboxStyleData | undefined;
}

export default function Actions({ styleData }: ActionsProps) {
  const { setIsOpen } = useDialogStore();
  const { checkboxData: data, setCheckboxData: setData } = useComponentStore();
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
