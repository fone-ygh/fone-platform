// src/shared/store/frameLayout/types.ts

/** frameLayout이 관리하는 영역(노드) */
export type FrameRegion = "header" | "sider" | "mdi" | "content";

/**
 * 추천2: 프레임의 각 영역을 “섹션처럼” 노드로 관리
 * - region은 4개로 고정이라 nodes를 Record로 두는 게 가장 안정적
 */
export interface FrameNode {
  /** 중복 방지: id = region */
  id: FrameRegion;
  type: FrameRegion;

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

/** region별로 1개씩만 존재 */
export type FrameNodes = Record<FrameRegion, FrameNode>;

export type FrameLayoutActions = {
  /* ---------------- Frame(Preview) Size ---------------- */
  setFrameSize: (w: number, h: number) => void;

  /* ---------------- Selection ---------------- */
  setSelectedIds: (ids: FrameRegion[]) => void;

  /* ---------------- Nodes ---------------- */
  setNodes: (next: FrameNodes) => void;

  setPatchNode: (
    id: FrameRegion,
    patch: Partial<Omit<FrameNode, "id" | "type">>,
  ) => void;

  setUpdateFrame: (
    id: FrameRegion,
    patch: Partial<Pick<FrameNode, "x" | "y" | "width" | "height" | "rotate">>,
  ) => void;

  /* ---------------- Z-Order ---------------- */
  setSendToFront: () => void;
  setSendToBack: () => void;
  setBringForward: () => void;
  setSendBackward: () => void;

  /* ---------------- Appearance ---------------- */
  setApplyColorToSelection: (color: string, target: "bg" | "text") => void;

  /* ---------------- Lock ---------------- */
  setLock: (id: FrameRegion, lock: boolean) => void;

  /* ---------------- Commit ---------------- */
  setCommitAfterTransform: () => void;

  /* ---------------- Reset ---------------- */
  /** 현재 frameSize 기준으로 기본 배치로 재배치 */
  setResetLayout: () => void;

  /** frameSize까지 포함해서 전체 초기화 */
  setReset: () => void;
};

export interface FrameLayoutState {
  /** ✅ B안(프리뷰 프레임)처럼 유저가 직접 정하는 “프레임 전체 크기(px)” */
  frameWidth: number;
  frameHeight: number;

  /** 4개 노드(header/sider/mdi/content) */
  nodes: FrameNodes;

  /** 선택 */
  selectedIds: FrameRegion[];

  /** transform commit 트리거 */
  version: number;

  actions: FrameLayoutActions;
}
