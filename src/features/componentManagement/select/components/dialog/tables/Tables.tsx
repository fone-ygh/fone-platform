import styled from "@emotion/styled";

import useCodeTypeStore from "../../../store/codeType";
import ApiTableContainer from "./apiTable/ApiTableContainer";
import CommonCodeTableContainer from "./commonCodeTable/CommonCodeTableContainer";

export default function Tables() {
  const { dataType } = useCodeTypeStore();

  return (
    <TablesStyle>
      {dataType === "commonCode" && <CommonCodeTableContainer />}
      {dataType === "api" && <ApiTableContainer />}
    </TablesStyle>
  );
}

const TablesStyle = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0 0.3rem;
  height: 300px;
`;
