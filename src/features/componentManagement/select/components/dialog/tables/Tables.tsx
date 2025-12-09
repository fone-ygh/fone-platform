import styled from "@emotion/styled";

import CodeTypeTable from "./CodeTypeTable";
import CommonCodeTable from "./CommonCodeTable";

export default function Tables() {
  return (
    <TablesStyle>
      <CodeTypeTable />
      <CommonCodeTable />
    </TablesStyle>
  );
}

const TablesStyle = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0 0.3rem;
  height: 300px;
`;
