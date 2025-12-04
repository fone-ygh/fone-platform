import styled from "@emotion/styled";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "fone-design-system_v1";

export default function ButtonGroup() {
  return (
    <ButtonGroupStyle>
      <Button size="small" variant="outlined">
        <AutorenewIcon sx={{ fontSize: 20 }} />
      </Button>
      <Button size="small" variant="contained" startIcon={<SearchIcon />}>
        조회
      </Button>
    </ButtonGroupStyle>
  );
}

const ButtonGroupStyle = styled.div`
  display: flex;
  gap: 0.5rem;
`;
