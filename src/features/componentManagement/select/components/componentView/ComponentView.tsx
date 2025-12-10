import styled from "@emotion/styled";

import useDataStore from "../../store/data";
import Select from "./Select";

export default function ComponentView() {
  const { selectedSelectData } = useDataStore();

  return (
    <ComponentViewStyle>
      <span className="name">{selectedSelectData?.name}</span>
      <Select />
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
