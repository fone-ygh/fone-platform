import { useState } from "react";
import styled from "@emotion/styled";
import { Select as FoneSelect } from "fone-design-system_v1";

import useComponentStore from "@/shared/store/components/component";

import useDataStore from "../../store/data";

export default function Select() {
  const [value, setValue] = useState("");

  const { selectedData } = useDataStore();
  const { codeTypeData } = useComponentStore();
  const commonCode = codeTypeData.find(
    ct => ct.groupCode === selectedData?.dataSourceCd,
  )?.commonCodeData;

  const menuItems = commonCode?.map(code => ({
    value: code.code,
    label: code.codeName,
  }));

  return (
    <InputStyle>
      <div className="label">
        <span>{selectedData.label}</span>
        {selectedData.required === "Y" && <div className="required">*</div>}
      </div>

      <FoneSelect
        sx={{ width: 200 }}
        all={selectedData.all === "Y"}
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
