"use client";

import { Button, Flex } from "fone-design-system_v1";

export default function ServerIOControl() {
  const serverSave = () => {
    console.log("TODO: 서버 저장");
  };
  const serverLoad = () => {
    console.log("TODO: 서버 불러오기");
  };

  return (
    <div>
      <Flex spacing=".8rem">
        <Button onClick={serverSave} variant="contained" size="xsmall">
          저장
        </Button>
        <Button onClick={serverLoad} variant="outlined" size="xsmall">
          불러오기
        </Button>
      </Flex>
    </div>
  );
}
