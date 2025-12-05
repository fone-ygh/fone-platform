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
  tabs?: { label: string; content?: string }[];
}

export type AnySection =
  | SearchSection
  | SingleSection
  | GridSection
  | TabSection;

export interface LayoutState {
  canvasWidth: number;
  canvasHeight: number;

  sections: AnySection[];
  selectedIds: string[];
  version: number;

  insertTool: InsertTool;

  // 드릴다운 스코프 (현재 캔버스가 어떤 parentId 그룹을 보여주는지)
  scopeParentId: string | null;

  actions: {
    setCanvasSize: (w: number, h: number) => void;

    setSelectedIds: (ids: string[]) => void;

    setSections: (next: AnySection[]) => void;
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

    /** 특정 섹션 lock 여부 설정 */
    setLock: (id: string, lock: boolean) => void;

    setCommitAfterTransform: () => void;

    setInsertTool: (tool: InsertTool) => void;

    // 스코프 변경 액션
    setScopeParentId: (parentId: string | null) => void;

    setReset: () => void;
  };
}
