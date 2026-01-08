"use client";

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Tab, Tabs } from "@mui/material";

import useComponentStore from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";

export default function ComponentView() {
  const [value, setValue] = useState("");
  console.log(value);
  const { selectedData } = useDataStore();
  const { codeTypeData } = useComponentStore();
  const commonCode = codeTypeData.find(
    ct => ct.groupCode === selectedData?.dataSourceCd,
  )?.commonCodeData;

  const options = commonCode?.map(code => ({
    label: code.codeName,
    value: code.code,
  }));

  useEffect(() => {
    if (!options?.length) return;

    // options가 비동기로 들어오는 경우, value가 비어있으면 첫 번째 옵션으로 초기화
    // (또는 기존 value가 현재 options에 없으면 첫 번째 옵션으로 보정)
    const nextValue = !value
      ? options[0].value
      : options.some(o => o.value === value)
        ? value
        : options[0].value;

    if (nextValue === value) return;

    const timer = setTimeout(() => {
      setValue(nextValue);
    }, 0);

    return () => clearTimeout(timer);
  }, [options, value]);

  if (value !== options?.[0]?.value) return null;

  return (
    <ComponentViewStyle>
      <span className="name">{selectedData?.name}</span>
      <TabStyle>
        <Tabs value={value} onChange={(_, newValue) => setValue(newValue)}>
          {options?.map(option => (
            <Tab key={option.value} label={option.label} value={option.value} />
          ))}
        </Tabs>
      </TabStyle>
    </ComponentViewStyle>
  );
}

const ComponentViewStyle = styled.div`
  position: relative;
  width: 440px;
  height: 160px;
  border: 1px solid #9c9c9cff;
  display: flex;
  align-items: center;
  justify-content: center;

  .name {
    position: absolute;
    top: -1.1rem;
    left: 1rem;
    font-size: 1.4rem;
    background-color: #fff;
    padding: 0 0.5rem;
    text-align: center;
    font-weight: 500;
  }
`;

const TabStyle = styled.div`
  position: relative;
  gap: 0.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  .label {
    position: absolute;
    width: 200px;
    top: -2.3rem;
    left: 1rem;
    display: flex;
    gap: 0.2rem;
    span {
      font-size: 1.2rem;
    }
  }

  .required {
    color: #ec193a;
    font-size: 2rem;
    line-height: 2rem;
  }
`;
