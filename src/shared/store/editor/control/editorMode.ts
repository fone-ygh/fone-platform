// src/shared/store/control/editorMode.ts

import type { InsertTool } from "../contentLayout";
import type { FrameRegion } from "../frameLayout/types";

export type EditorMode =
  | { kind: "idle" }
  | { kind: "pan"; reason: "space" | "middleMouse" }
  | { kind: "insert"; tool: InsertTool }
  | { kind: "transform"; op: "drag" | "resize" | "rotate"; ids: string[] }
  | {
      kind: "contentEdit";
      sectionId: string;
      surface: "sheet" | "text" | "custom";
      reason?: "dblclick" | "enter" | "toolbar";
    }
  | { kind: "drilldown"; parentId: string; reason?: "dblclick" | "breadcrumb" }
  // ✅ 프레임 편집 모드 추가
  | {
      kind: "frameEdit";
      region?: FrameRegion; // 선택적으로 "현재 편집 포커스"
      reason?: "toolbar" | "shortcut" | "dblclick";
    };

export const EDITOR_MODE = {
  idle: (): EditorMode => ({ kind: "idle" }),

  pan: (reason: "space" | "middleMouse"): EditorMode => ({
    kind: "pan",
    reason,
  }),

  insert: (tool: InsertTool): EditorMode => ({
    kind: "insert",
    tool,
  }),

  transform: (op: "drag" | "resize" | "rotate", ids: string[]): EditorMode => ({
    kind: "transform",
    op,
    ids,
  }),

  contentEdit: (
    sectionId: string,
    surface: "sheet" | "text" | "custom",
    reason?: "dblclick" | "enter" | "toolbar",
  ): EditorMode => ({
    kind: "contentEdit",
    sectionId,
    surface,
    reason,
  }),

  drilldown: (
    parentId: string,
    reason?: "dblclick" | "breadcrumb",
  ): EditorMode => ({
    kind: "drilldown",
    parentId,
    reason,
  }),

  // ✅ 추가
  frameEdit: (
    region?: FrameRegion,
    reason?: "toolbar" | "shortcut" | "dblclick",
  ): EditorMode => ({
    kind: "frameEdit",
    region,
    reason,
  }),
} as const;
