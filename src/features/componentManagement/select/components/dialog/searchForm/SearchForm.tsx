import { useMemo } from "react";
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";

import useCodeTypeStore from "../../../store/codeType";
import useDataStore from "../../../store/data";
import ButtonGroup from "./ButtonGroup";
import Input from "./Input";

export default function SearchForm() {
  const { handleSubmit, register, reset } = useForm();

  const { dataType } = useCodeTypeStore();
  const {
    codeTypeData,
    apiData,
    setCodeTypeData,
    setCommonCodeData,
    setApiData,
  } = useDataStore();

  const initialCodeTypeData = useMemo(() => codeTypeData, []);
  const initialApiData = useMemo(() => apiData, []);

  const onSubmit = (data: any) => {
    if (dataType === "commonCode") {
      const filteredCodeTypeData = initialCodeTypeData.filter(ctd => {
        return (
          ctd.groupName.includes(data.name) ||
          ctd.groupCode.includes(data.name.toUpperCase())
        );
      });

      setCodeTypeData(filteredCodeTypeData);
      setCommonCodeData(filteredCodeTypeData?.[0]?.commonCodeData || []);
    } else {
      const filteredApiData = initialApiData.filter(ad => {
        return (
          ad.groupName.includes(data.name) ||
          ad.groupCode.includes(data.name.toUpperCase())
        );
      });
      setApiData(filteredApiData);
    }
  };

  return (
    <SearchFormStyle onSubmit={handleSubmit(onSubmit)}>
      <Input register={register} />
      <ButtonGroup reset={reset} />
    </SearchFormStyle>
  );
}

const SearchFormStyle = styled.form`
  display: flex;
  padding: 1rem;
  width: 100%;
  height: 7.5rem;
  border: 1px solid #c4c4c4;
  border-radius: 1.2rem;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 0.2rem 0.8rem 0px;
  align-items: center;
  justify-content: space-between;
`;
