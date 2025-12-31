"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import { TextField2 } from "fone-design-system_v1";

import useDataStore from "../../store/data";

export default function ComponentView() {
  const { selectedData } = useDataStore();

  const iconUrl = useMemo(() => {
    const file = selectedData?.style.icon;
    return file ? URL.createObjectURL(file) : null;
  }, [selectedData?.style.icon]);

  useEffect(() => {
    return () => {
      if (iconUrl) URL.revokeObjectURL(iconUrl);
    };
  }, [iconUrl]);

  const iconNode = iconUrl ? (
    <Image src={iconUrl} alt="" width={16} height={16} unoptimized />
  ) : undefined;

  const iconPosition = selectedData?.style.iconPosition;
  const startIcon = iconPosition === "right" ? undefined : iconNode;
  const endIcon = iconPosition === "right" ? iconNode : undefined;

  return (
    <ComponentViewStyle>
      <span className="name">{selectedData?.name}</span>
      <InputStyle>
        <div className="label">
          <span>{selectedData.title}</span>
          {selectedData.required === "Y" && <div className="required">*</div>}
        </div>
        <TextField2
          startAdornment={startIcon}
          endAdornment={endIcon}
          type={selectedData?.type || "text"}
          sx={{
            width: selectedData?.style.width
              ? `${selectedData.style.width}px`
              : undefined,
          }}
          placeholder={selectedData?.placeholder || ""}
        />
      </InputStyle>
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
