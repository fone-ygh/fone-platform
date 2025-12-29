"use client";

import { Checkbox, Flex, Label } from "fone-design-system_v1";

import { useEDITORActions, useEDITORStore } from "@/shared/store";
import { HrStyle, InputStyle, LabelStyle } from "@/shared/styles/control";

export default function SnapControl() {
  const { snapToGrid, snapToGuides, snapToElements, snapTolerance } =
    useEDITORStore();

  const {
    setSnapToGrid,
    setSnapToGuides,
    setSnapToElements,
    setSnapTolerance,
  } = useEDITORActions();

  return (
    <div>
      <Flex spacing="1.2rem" alignItems="center">
        <Checkbox
          checked={snapToGrid}
          onChange={(e: any) => setSnapToGrid(!!e?.target?.checked)}
        />
        <Label style={{ margin: 0 }}>그리드에 스냅</Label>
      </Flex>
      <Flex spacing="1.2rem" alignItems="center" style={{ marginTop: ".4rem" }}>
        <Checkbox
          checked={snapToGuides}
          onChange={(e: any) => setSnapToGuides(!!e?.target?.checked)}
        />
        <Label style={{ margin: 0 }}>가이드에 스냅</Label>
      </Flex>
      <Flex spacing="1.2rem" alignItems="center" style={{ marginTop: ".4rem" }}>
        <Checkbox
          checked={snapToElements}
          onChange={(e: any) => setSnapToElements(!!e?.target?.checked)}
        />
        <LabelStyle style={{ margin: 0 }}>요소 간 스냅</LabelStyle>
      </Flex>

      <HrStyle />

      <Flex spacing="1rem" alignItems="center">
        <LabelStyle htmlFor="snapTol">허용 오차(px)</LabelStyle>
        <InputStyle
          id="snapTol"
          type="number"
          value={snapTolerance}
          min={1}
          max={20}
          onChange={e =>
            setSnapTolerance(Math.max(1, Math.min(20, Number(e.target.value))))
          }
        />
      </Flex>
    </div>
  );
}
