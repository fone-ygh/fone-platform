import styled from "@emotion/styled";

import SearchForm from "./searchForm/SearchForm";
import Tables from "./tables/Tables";

export default function DialogContent() {
  return (
    <DialogContentStyle>
      <SearchForm />
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
