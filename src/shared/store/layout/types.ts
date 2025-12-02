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

  rotate?: number;
  radius?: number;
  shadow?: number;

  title?: string;
  purpose?: string; // 'header' | 'sidebar' | 'main' | 'footer' | ...

  // colors
  bg?: string;
  color?: string;

  // text
  text?: string;
  textAlign?: "left" | "center" | "right";

  // image
  imageUrl?: string;
  objectFit?: "cover" | "contain" | "fill";

  // button
  btnLabel?: string;
  btnHref?: string;
  btnVariant?: "text" | "contained" | "outlined";

  // tabs
  tabs?: { label: string; content?: string }[];
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
