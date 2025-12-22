import { useMemo } from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { Button } from "fone-design-system_v1";
import { FieldValues, UseFormReset } from "react-hook-form";

import useComponentStore from "@/shared/store/components/component";

import useCodeTypeStore from "../../../store/codeType";

interface ResetButtonProps {
  reset: UseFormReset<FieldValues>;
}

export default function ResetButton({ reset }: ResetButtonProps) {
  const { dataType } = useCodeTypeStore();
  const { codeTypeData, apiData, setCodeTypeData, setApiData } =
    useComponentStore();
  const initialCodeTypeData = useMemo(() => codeTypeData, []);
  const initialApiData = useMemo(() => apiData, []);

  const onResetHandler = () => {
    if (dataType === "commonCode") {
      setCodeTypeData(initialCodeTypeData);
    } else {
      setApiData(initialApiData);
    }

    reset({ name: "" });
  };

  return (
    <Button size="small" variant="outlined" onClick={onResetHandler}>
      <AutorenewIcon sx={{ fontSize: 20 }} />
    </Button>
  );
}
