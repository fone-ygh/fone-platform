"use client";

import { Flex, Switch, TextField2 } from "fone-design-system_v1";

import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { LabelStyle } from "@/shared/styles/control";

export default function GridControl() {
  const { showGrid, gridSize, gridColor } = useEDITORStore();

  const { setShowGrid, setGridSize, setGridColor } = useEDITORActions();

  return (
    <div>
      <Flex spacing="1.2rem" alignItems="center">
        <LabelStyle style={{ margin: 0 }}>격자 표시</LabelStyle>
        <Switch
          checked={showGrid}
          onChange={(e: any) => setShowGrid(!!e?.target?.checked)}
          size="small"
        />
      </Flex>

      <Flex spacing="1rem" alignItems="center" style={{ marginTop: ".6rem" }}>
        <LabelStyle htmlFor="grid-size">Size</LabelStyle>
        <TextField2
          id="grid-size"
          type="number"
          value={gridSize}
          inputProps={{ min: 4, max: 64 }}
          onChange={e =>
            setGridSize(Math.max(4, Math.min(64, Number(e.target.value))))
          }
        />
        <LabelStyle htmlFor="grid-color" style={{ marginLeft: "1rem" }}>
          Color
        </LabelStyle>
        <TextField2
          id="grid-color"
          type="color"
          value={gridColor}
          onChange={e => setGridColor(e.target.value)}
          style={{ width: "4rem", padding: 0 }}
        />
      </Flex>
    </div>
  );
}
