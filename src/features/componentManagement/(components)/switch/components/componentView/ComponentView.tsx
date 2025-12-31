"use client";

import styled from "@emotion/styled";
import { Switch } from "fone-design-system_v1";

import useDataStore from "../../store/data";

export default function ComponentView() {
  const { selectedData, setSelectedData } = useDataStore();

  return (
    <ComponentViewStyle>
      <span className="name">{selectedData?.name}</span>
      <InputStyle>
        <div className="label">
          <span>{selectedData.title}</span>
          {selectedData.required === "Y" && <div className="required">*</div>}
        </div>
        <Switch
          color={
            selectedData.style?.color as
              | "primary"
              | "secondary"
              | "error"
              | "info"
              | "success"
              | "warning"
              | "default"
          }
          checked={selectedData.defaultChecked === "Y"}
          onChange={() =>
            setSelectedData({
              ...selectedData,
              defaultChecked: selectedData.defaultChecked === "Y" ? "N" : "Y",
            })
          }
        />
      </InputStyle>
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

const InputStyle = styled.div`
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
