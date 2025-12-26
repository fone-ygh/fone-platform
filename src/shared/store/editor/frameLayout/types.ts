// src/shared/store/frame/types.ts

/** frame이 관리하는 영역 */
export type FrameRegion = "header" | "sider" | "mdi" | "content";

export type InsertTool = FrameRegion | null;

export interface Frame {
  id: string;
  parentId: string | null;
  type: FrameRegion;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  lock: boolean;

  rotate?: number;
  radius?: number;
  shaddow?: number;

  title?: string;

  bg?: string;
  color: string;
}

// Search
export interface HeaderRegion extends Frame {
  type: "header";
}

// Single
export interface SiderRegion extends Frame {
  type: "sider";
}

// Grid
export interface MdiRegion extends Frame {
  type: "mdi";
}

export interface contentRegion extends Frame {
  type: "content";
}

export type AnyRegion = HeaderRegion | SiderRegion | MdiRegion | contentRegion;

export type Size = {
  width: number;
  height: number;
};

export type FrameSizes = Record<FrameRegion, Size>;

export type ViewportSize = { width: number; height: number };

export type FrameActions = {
  setSize: (region: FrameRegion, size: Size) => void;
  patchSize: (region: FrameRegion, patch: Partial<Size>) => void;

  setWidth: (region: FrameRegion, width: number) => void;
  setHeight: (region: FrameRegion, height: number) => void;

  setSizes: (sizes: FrameSizes) => void;

  /** viewport 기준으로 content 등 파생 사이즈 동기화 */
  syncDerivedSizes: (viewport: ViewportSize) => void;

  reset: () => void;
};

export type FrameState = {
  sizes: FrameSizes;
  actions: FrameActions;
};
