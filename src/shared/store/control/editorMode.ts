// src/shared/store/control/editorMode.ts
// (경로는 네가 정한 control 폴더 구조에 맞춰서)

import type { InsertTool } from "@/shared/store/layout/types";

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
  | { kind: "drilldown"; parentId: string; reason?: "dblclick" | "breadcrumb" };

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
} as const;
