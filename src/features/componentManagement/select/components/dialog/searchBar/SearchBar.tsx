import styled from "@emotion/styled";

import ButtonGroup from "./ButtonGroup";
import Input from "./Input";

export default function SearchBar() {
  return (
    <SearchBarStyle>
      <Input />
      <ButtonGroup />
    </SearchBarStyle>
  );
}

const SearchBarStyle = styled.div`
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
