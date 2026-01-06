import { Button } from "fone-design-system_v1";

import useComponentStore, {
  RadioStyleData,
} from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";
import useDialogStore from "../../store/dialog";
import useIdxStore from "../../store/idx";

interface ActionsProps {
  styleData: RadioStyleData | undefined;
}

export default function Actions({ styleData }: ActionsProps) {
  const { setIsStyleOpen } = useDialogStore();
  const { radioData: data, setRadioData: setData } = useComponentStore();
  const { selectedData, setSelectedData } = useDataStore();
  const { idx } = useIdxStore();

  const selectedHandler = () => {
    if (!styleData || !selectedData) return;

    let updatedData: any[] = [];

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
    setIsStyleOpen(false);
  };

  return (
    <>
      <Button size="small" variant="contained" onClick={selectedHandler}>
        선택
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => setIsStyleOpen(false)}
      >
        취소
      </Button>
    </>
  );
}
