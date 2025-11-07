"use client";

import { useEffect } from "react";
import { Button, Flex, TextField2 } from "fone-design-system_v1";

import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { SmallNoteStyle } from "@/shared/styles/control";

export default function ZoomControl() {
  const { canvasZoom } = useEDITORStore();

  const { setCanvasZoom, zoomIn, zoomOut, zoomReset, setZoom } =
    useEDITORActions();

  useEffect(() => {
    setZoom(canvasZoom);
  }, [canvasZoom]);

  return (
    <div>
      <Flex spacing=".8rem" alignItems="center">
        <Button onClick={zoomOut} size="xsmall" variant="outlined">
          −
        </Button>
        <TextField2
          type="number"
          value={canvasZoom}
          inputProps={{ min: 25, max: 200 }}
          onChange={e => {
            setCanvasZoom(Number(e.target.value));
          }}
        />
        <Button onClick={zoomIn} size="xsmall" variant="outlined">
          ＋
        </Button>
        <Button onClick={zoomReset} size="xsmall" variant="outlined">
          100%
        </Button>
      </Flex>
      <SmallNoteStyle>25% ~ 200%</SmallNoteStyle>
    </div>
  );
}
