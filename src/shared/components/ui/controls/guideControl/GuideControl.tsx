"use client";

import { Button, Flex } from "fone-design-system_v1";

import { HrStyle, LabelStyle } from "@/shared/styles/control";

export default function GuideControl() {
  const addVGuide = () => console.log("TODO: add vertical guide");
  const addHGuide = () => console.log("TODO: add horizontal guide");

  return (
    <div>
      <Flex spacing="1.2rem" alignItems="center">
        <LabelStyle style={{ margin: 0 }}>룰러 표시</LabelStyle>
      </Flex>
      <Flex spacing="1.2rem" alignItems="center" style={{ marginTop: ".4rem" }}>
        <LabelStyle style={{ margin: 0 }}>가이드 표시</LabelStyle>
      </Flex>
      <HrStyle />
      <Flex spacing=".8rem">
        <Button onClick={addVGuide} variant="outlined" size="xsmall">
          세로 가이드 추가
        </Button>
        <Button onClick={addHGuide} variant="outlined" size="xsmall">
          가로 가이드 추가
        </Button>
      </Flex>
    </div>
  );
}
