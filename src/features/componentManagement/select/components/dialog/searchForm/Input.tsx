import styled from "@emotion/styled";
import { TextField2 } from "fone-design-system_v1";
import { FieldValues, UseFormRegister } from "react-hook-form";

import useCodeTypeStore from "../../../store/codeType";

interface InputProps {
  register: UseFormRegister<FieldValues>;
}

export default function Input({ register }: InputProps) {
  const { dataType } = useCodeTypeStore();

  return (
    <InputStyle>
      <span>{dataType === "commonCode" ? "그룹명" : "API명"}</span>
      <TextField2 sx={{ height: 30 }} {...register("name")} defaultValue="" />
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
