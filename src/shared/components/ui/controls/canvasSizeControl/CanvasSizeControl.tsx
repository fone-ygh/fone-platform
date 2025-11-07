"use client";

import { Button, Flex, TextField2 } from "fone-design-system_v1";

import {
  useEDITORActions,
  useEDITORStore,
} from "@/features/editor/lib/store/store";

export default function CanvasSizeControl() {
  const { setCanvasWidth, setCanvasHeight } = useEDITORActions();
  const { canvasWidth, canvasHeight } = useEDITORStore();

  /* Canvas */
  const handleCanvasW = (v: number) => {
    setCanvasWidth(v);
  };
  const handleCanvasH = (v: number) => {
    setCanvasHeight(v);
  };
  const resetCanvas = () => {
    setCanvasWidth(1200);
    setCanvasHeight(800);
  };

  return (
    <Flex flexDirection="column" spacing="1rem">
      <Flex spacing="1.2rem">
        <Flex flexDirection="column">
          <label>W</label>
          <TextField2
            type="number"
            value={canvasWidth}
            inputProps={{ min: 1 }}
            onChange={e => handleCanvasW(Number(e.target.value))}
          />
        </Flex>

        <Flex flexDirection="column">
          <label htmlFor="h">H</label>
          <TextField2
            type="number"
            value={canvasHeight}
            inputProps={{ min: 1 }}
            onChange={e => handleCanvasH(Number(e.target.value))}
          />
          <div />
        </Flex>
      </Flex>

      <Button onClick={resetCanvas} size="xsmall" variant="outlined">
        리셋(1200×800)
      </Button>
    </Flex>
  );
}
