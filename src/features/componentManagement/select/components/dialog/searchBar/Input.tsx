import styled from "@emotion/styled";
import { TextField2 } from "fone-design-system_v1";

export default function Input() {
  return (
    <InputStyle>
      <span>그룹명</span>
      <TextField2 sx={{ height: 30 }} />
    </InputStyle>
  );
}

const InputStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  span {
    font-size: 1.2rem;
  }
`;
