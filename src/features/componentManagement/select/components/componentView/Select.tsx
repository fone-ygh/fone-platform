import { useState } from "react";
import styled from "@emotion/styled";
import { Select as FoneSelect } from "fone-design-system_v1";

import useDataStore from "../../store/data";

export default function Select() {
  const [value, setValue] = useState("");

  const { selectedSelectData, codeTypeData } = useDataStore();
  const commonCode = codeTypeData.find(
    ct => ct.groupCode === selectedSelectData?.dataSourceCd,
  )?.commonCodeData;

  const menuItems = commonCode?.map(code => ({
    value: code.code,
    label: code.codeName,
  }));

  return (
    <InputStyle>
      <div className="label">
        <span>{selectedSelectData.label}</span>
        {selectedSelectData.required === "Y" && (
          <div className="required">*</div>
        )}
      </div>

      <FoneSelect
        sx={{ width: 200 }}
        all={selectedSelectData.all === "Y"}
        MenuItems={menuItems}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </InputStyle>
  );
}

const InputStyle = styled.div`
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
