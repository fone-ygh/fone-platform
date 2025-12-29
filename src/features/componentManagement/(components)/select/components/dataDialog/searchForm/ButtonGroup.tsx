import styled from "@emotion/styled";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "fone-design-system_v1";
import { FieldValues, UseFormReset } from "react-hook-form";

import ResetButton from "./ResetButton";

interface ButtonGroupProps {
  reset: UseFormReset<FieldValues>;
}

export default function ButtonGroup({ reset }: ButtonGroupProps) {
  return (
    <ButtonGroupStyle>
      <ResetButton reset={reset} />
      <Button
        size="small"
        variant="contained"
        startIcon={<SearchIcon />}
        type="submit"
      >
        조회
      </Button>
    </ButtonGroupStyle>
  );
}

const ButtonGroupStyle = styled.div`
  display: flex;
  gap: 0.5rem;
`;
