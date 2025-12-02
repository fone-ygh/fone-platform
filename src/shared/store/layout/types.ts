// src/shared/store/layout/types.ts
export type SectionType = "search" | "single" | "grid" | "tab";

export type InsertTool = SectionType | null;

export interface Section {
  id: string;
  parentId: string | null;
  type: SectionType;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  lock: boolean;

  rotate?: number;
  radius?: number;
  shadow?: number;

  title?: string;

  bg?: string;
  color?: string;
}

// Search
export interface SearchSection extends Section {
  type: "search";
  // 검색필드 정의
  // fields: SearchField[];
}

// Single
export interface SingleSection extends Section {
  type: "single";
}

// Grid
export interface GridSection extends Section {
  type: "grid";

  // columns?: number;
  // pageSize?: number;
}

// Tab
export interface TabSection extends Section {
  type: "tab";
  tabs: { label: string; content?: string }[];
}

export interface LayoutState {
  canvasWidth: number;
  canvasHeight: number;

  sections: Section[];
  selectedIds: string[];
  version: number;

  insertTool: InsertTool;

  actions: {
    setCanvasSize: (w: number, h: number) => void;

    setSelectedIds: (ids: string[]) => void;

    setSections: (next: Section[]) => void;
    setClearSections: () => void;

    setAddSection: (type: SectionType, init?: Partial<Section>) => string;
    setPatchSection: (id: string, patch: Partial<Section>) => void;
    setUpdateFrame: (
      id: string,
      patch: Partial<Pick<Section, "x" | "y" | "width" | "height" | "rotate">>,
    ) => void;

    setDeleteSelected: () => void;
    setDuplicateSelected: () => void;

    setSendToFront: () => void;
    setSendToBack: () => void;
    setBringForward: () => void;
    setSendBackward: () => void;

    setApplyColorToSelection: (color: string, target: "bg" | "text") => void;

    setCommitAfterTransform: () => void;

    setInsertTool: (tool: InsertTool) => void;
  };
}
