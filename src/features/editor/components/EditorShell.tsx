// src/features/editor/components/EditorShell.tsx
// "use client";  // ❌ 제거

import React from "react";
import { Flex } from "fone-design-system_v1";

import CanvasStage from "./canvas/CanvasStage";
import CanvasViewport from "./canvas/CanvasViewport";
import LeftPanel from "./panels/LeftPanel";
import RightPanel from "./panels/RightPanel";

export default function EditorShell() {
  return (
    <div style={{ height: "100dvh" }}>
      <Flex sx={{ height: "100%" }}>
        <LeftPanel />
        <CanvasViewport>
          <CanvasStage />
        </CanvasViewport>
        <RightPanel />
      </Flex>
    </div>
  );
}
