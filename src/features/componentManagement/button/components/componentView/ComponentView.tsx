"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import { Button } from "fone-design-system_v1";

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
    <Image
      src={iconUrl}
      alt=""
      width={16}
      height={16}
      style={{
        filter:
          selectedData?.style.variant === "contained"
            ? "brightness(0) invert(1)"
            : undefined,
      }}
      unoptimized
    />
  ) : undefined;

  // iconPosition 값이 "right"면 endIcon, 그 외는 startIcon으로 처리
  const iconPosition = selectedData?.style.iconPosition;
  const startIcon = iconPosition === "right" ? undefined : iconNode;
  const endIcon = iconPosition === "right" ? iconNode : undefined;

  return (
    <ComponentViewStyle>
      <span className="name">{selectedData?.name}</span>
      <Button
        startIcon={startIcon}
        endIcon={endIcon}
        variant={selectedData?.style.variant}
        color={selectedData?.style.color}
        sx={{
          width: selectedData?.style.width
            ? `${selectedData.style.width}px`
            : undefined,
        }}
      >
        {selectedData?.title}
      </Button>
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
