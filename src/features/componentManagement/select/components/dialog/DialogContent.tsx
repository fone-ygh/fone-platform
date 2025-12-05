import styled from "@emotion/styled";

import SearchBar from "./searchBar/SearchBar";
import Tables from "./tables/Tables";

export default function DialogContent() {
  return (
    <DialogContentStyle>
      <SearchBar />
      <Tables />
    </DialogContentStyle>
  );
}

const DialogContentStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  height: 400px;
`;
