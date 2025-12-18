"use client";

import styled from "@emotion/styled";

import ComponentView from "../components/componentView/ComponentView";
import Dialog from "../components/dialog/Dialog";
import Table from "../components/table/Table";

export default function ButtonPage() {
  return (
    <ButtonPageStyle>
      <Table />
      <ComponentView />
      <Dialog />
    </ButtonPageStyle>
  );
}

const ButtonPageStyle = styled.div`
  width: 100%;
  height: 100%;
  padding: 1.6rem;
  gap: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
