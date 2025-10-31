/* ===== 공통 ===== */
export type ID = string;

export type WidgetType =
  | "box"
  | "text"
  | "image"
  | "button"
  | "list"
  | "card"
  | "gallery"
  | "tabs"
  | "accordion";

export type Frame = { x: number; y: number; width: number; height: number };

export type Item<T = any> = {
  id: ID;
  type: WidgetType;
  frame: Frame;
  data?: T;
};

/* ===== 편집 결과를 파일로 저장/불러오기 위한 "영구 상태 모델" ===== */
export type Canvas = { width: number; height: number; backgroud: number };

export type ViewPort = { zoom: number; scrollX: number; scrollY: number };

export type GuideLine = { id: ID; axis: "x" | "y"; pos: number };

export type SnapSettings = {
  enabled: boolean;
  grid: number; // 8/10/16...
  threshold: number; // px
  toGrid: boolean;
  toGuides: boolean;
  toObjects: boolean;
};

export type LayoutDoc = {
  version: 1;
  canvas: Canvas;
  viewport: ViewPort;
  items: Item[];
  selection: ID[];
  guides: GuideLine[];
  snap: SnapSettings;
  collisionMode: "free" | "avoid";
  name?: string;
  updatedAt?: string; // ISO
};

/* ===== 런타임(편집 중 일시 상태) ===== */
export type Tool = "select" | "drag" | "resize" | "hand" | "zoom";

export type DragState = {
  active: boolean;
  ids: ID[];
  startFrames: Record<ID, Frame>;
  pointerStart: { x: number; y: number };
};

export type ResizeHandle =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topRight"
  | "topLeft"
  | "bottomRight"
  | "bottomLeft";

export type ResizeState = {
  active: boolean;
  id: ID | null;
  handle: ResizeHandle;
  startFrame: Frame;
};

// 무엇에 스냅됐는지
export type SnapTargetType = "grid" | "guide" | "object";

// 실제 커밋 직전에 적용될 스냅 보정량(미리보기)
export type SnapPreview = {
  /** x축 보정(px) — 최종 x = rawX + offsetX */
  offsetX: number;
  /** y축 보정(px) — 최종 y = rawY + offsetY */
  offsetY: number;
  /** 무엇에 붙었는지(그리드/가이드/다른 오브젝트) */
  target?: SnapTargetType;
};

// 드래그/리사이즈 중 화면에 잠깐 그려줄 가이드 라인들
export type GuidePreview = {
  /** 수직 가이드 라인의 x 좌표들(px) */
  verticalLines: number[];
  /** 수평 가이드 라인의 y 좌표들(px) */
  horizontalLines: number[];
};

export type UIState = {
  tool: Tool;
  dragging: DragState;
  resizing: ResizeState;
  hoverId?: ID | null;
  guidePreview?: GuidePreview;
  snapPreview?: SnapPreview;
};
