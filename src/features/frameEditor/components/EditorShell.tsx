// src/features/editor/components/EditorShell.tsx
"use client";

import { Flex } from "fone-design-system_v1";

import FrameCanvasStage from "./canvas/FrameCanvasStage";
import FrameCanvasViewport from "./canvas/FrameCanvasViewport";
import FrameLeftPanel from "./panels/FrameLeftPanel";
import FrameRightPanel from "./panels/FrameRightPanel";

export default function EditorShell() {
  return (
    <div style={{ height: "100dvh" }}>
      <Flex sx={{ height: "100%" }}>
        <FrameLeftPanel />
        <FrameCanvasViewport>
          <FrameCanvasStage />
        </FrameCanvasViewport>
        <FrameRightPanel />
      </Flex>
    </div>
  );
}
