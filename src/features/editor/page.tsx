"use client";

import React, { useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Flex } from "fone-design-system_v1";

import ComponentArea from "./components/ComponentArea";
import EditStage from "./components/EditStage";
import SettingArea from "./components/SettingArea";

export default function Page({ data }: any) {
  return (
    <Container>
      <Flex
        justifyContent="space-between"
        sx={{ width: "100%", height: "100%" }}
      >
        <ComponentArea />
        <EditStage />
        <SettingArea />
      </Flex>
    </Container>
  );
}

/* ===================== Styled (그대로) ===================== */
export const Container = styled.div`
  background:
    radial-gradient(
      circle at 16px 16px,
      rgba(2, 6, 23, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, #f6f8fb 0%, #f0f4fa 100%);
  background-size:
    24px 24px,
    100% 100%;
  height: 100dvh;
`;
