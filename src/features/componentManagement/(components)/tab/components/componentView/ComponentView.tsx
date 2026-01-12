"use client";

import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { Tab, Tabs } from "@mui/material";

import useComponentStore from "@/features/componentManagement/store/component";

import useDataStore from "../../store/data";

export default function ComponentView() {
  const [value, setValue] = useState("");
  const { selectedData } = useDataStore();
  const { codeTypeData } = useComponentStore();
  const commonCode = codeTypeData.find(
    ct => ct.groupCode === selectedData?.dataSourceCd,
  )?.commonCodeData;

  const options = useMemo(
    () =>
      commonCode?.map(code => ({
        label: code.codeName,
        value: code.code,
      })) ?? [],
    [commonCode],
  );

  const safeValue = useMemo(() => {
    if (!options.length) return "";
    if (!value) return options[0].value;
    if (options.some(o => o.value === value)) return value;
    return options[0].value;
  }, [options, value]);

  if (!options.length) return null;

  return (
    <ComponentViewStyle>
      <span className="name">{selectedData?.name}</span>
      <TabStyle>
        <Tabs value={safeValue} onChange={(_, newValue) => setValue(newValue)}>
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
