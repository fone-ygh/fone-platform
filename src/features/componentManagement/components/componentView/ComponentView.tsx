"use client";

import styled from "@emotion/styled";

import useDataStore from "../../input/store/data";

interface ComponentViewProps {
  children: React.ReactNode;
}

export default function ComponentView({ children }: ComponentViewProps) {
  const { selectedData } = useDataStore();

  return (
    <ComponentViewStyle>
      <span className="name">{selectedData?.name}</span>
      {children}
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
