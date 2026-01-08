"use client";

import styled from "@emotion/styled";

import ComponentView from "../components/componentView/ComponentView";
import DataDialog from "../components/dataDialog/DataDialog";
import Table from "../components/table/Table";

export default function TabPage() {
  return (
    <TabPageStyle>
      <Table />
      <ComponentView />
      <DataDialog />
    </TabPageStyle>
  );
}

const TabPageStyle = styled.div`
  width: 100%;
  height: 100%;
  padding: 1.6rem;
  gap: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
