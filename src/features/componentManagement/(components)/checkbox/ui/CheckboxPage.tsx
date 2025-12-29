"use client";

import styled from "@emotion/styled";

import ComponentView from "../components/componentView/ComponentView";
import StyleDialog from "../components/styleDialog/StyleDialog";
import Table from "../components/table/Table";

export default function CheckboxPage() {
  return (
    <CheckboxPageStyle>
      <Table />
      <ComponentView />
      <StyleDialog />
    </CheckboxPageStyle>
  );
}

const CheckboxPageStyle = styled.div`
  width: 100%;
  height: 100%;
  padding: 1.6rem;
  gap: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CheckboxStyle = styled.div`
  position: relative;
  gap: 0.6rem;

  .label {
    position: absolute;
    top: -2.3rem;
    left: -0.2rem;
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
