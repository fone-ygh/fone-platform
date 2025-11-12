// src/shared/store/layout/types.ts

/* ─────────────────────────────────────────────────────────
   Widget 기본 타입
───────────────────────────────────────────────────────── */
export type WidgetType =
  | "box"
  | "text"
  | "image"
  | "button"
  | "list"
  | "card"
  | "gallery"
  | "tabs"
  | "accordion"
  | "pricing";

export type Purpose =
  | "neutral"
  | "header"
  | "sidebar"
  | "main"
  | "footer"
  | "hero"
  | "card"
  | "gallery"
  | "cta"
  | "emphasis"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
};

/* ─────────────────────────────────────────────────────────
   섹션(위젯 인스턴스)
───────────────────────────────────────────────────────── */
export type SectionItem = {
  id: string;
  title: string;
  type: WidgetType;

  // 위치/사이즈(현재 활성 브레이크포인트 기준)
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;

  // 스타일
  bg?: string;
  z?: number;
  radius?: number;
  shadow?: number;
  locked?: boolean; // 편집잠금
  blockPointer?: boolean; // 포인터 차단

  // text
  text?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";

  // image
  imageUrl?: string;
  objectFit?: "cover" | "contain" | "fill";

  // button
  btnLabel?: string;
  btnHref?: string;
  btnVariant?: "solid" | "ghost";

  // list
  listItems?: string[];

  // tabs
  tabs?: { label: string; content: string }[];
  activeTabIndex?: number;

  // accordion
  accordion?: { label: string; content: string; open?: boolean }[];

  // pricing
  pricing?: {
    name: string;
    price: string;
    features: string[];
    highlight?: boolean;
  }[];

  // 목적/색상
  purpose?: Purpose;
  autoColor?: boolean;
  textColorOverride?: string;

  // 반응형 프레임(브레이크포인트ID → Frame)
  frames?: Record<string, Frame>;
};

export type Breakpoint = { id: string; label: string; width: number };

/* ─────────────────────────────────────────────────────────
   페이지 내부 "레이아웃 스냅샷" (페이지가 보관하는 순수 데이터)
   - 캔버스/컬럼 옵션 + 섹션 목록 + 반응형 옵션
───────────────────────────────────────────────────────── */
export type LayoutState = {
  version: number;

  // 캔버스 크기
  canvasWidth: number;
  canvasHeight: number;

  // 컬럼 가이드(패널에서 쓰는 값들) — 패널/그리드 표시용
  showColumns: boolean;
  columns: number;
  gutter: number;
  containerPadding: number;

  // 섹션들
  sections: SectionItem[];

  // 반응형
  breakpoints?: Breakpoint[];
  activeBp?: string;
  responsive?: {
    inheritScale?: boolean;
    viewportWidth?: number;
  };
};

export type GuideLine = {
  /** 수직/수평 가이드 */
  kind: "v" | "h";
  /** 가이드 위치(px): kind==='v'면 x, kind==='h'면 y 역할 */
  pos: number;
  /** (옵션) 그려줄 범위 시작/끝 y 또는 x (렌더 최적화용) */
  from?: number;
  to?: number;
  /** (옵션) 라인별 색상 커스터마이즈 */
  color?: string;
  /** (옵션) 디버깅/식별용 */
  id?: string;
};

export type Page = {
  id: string;
  name: string;
  layout: LayoutState;
};

export type Theme = "light" | "dark";
export type GuideTheme = "blue" | "green" | "magenta" | "amber";

/* ─────────────────────────────────────────────────────────
   커밋 결과(충돌 등)
───────────────────────────────────────────────────────── */
export type CommitResult =
  | { ok: true }
  | { ok: false; message: string; collidedIds: string[] };

/* ─────────────────────────────────────────────────────────
   스토어: 상태/액션
   - LayoutStore: 에디터가 다루는 "현재 페이지의 투영 상태" + 페이지/히스토리
   - LayoutActions: 전부 "필수" 메서드 (옵셔널 X)
───────────────────────────────────────────────────────── */

// 히스토리 스냅샷(가볍게 보관할 필드만 선별)
export type LayoutSnapshot = Pick<
  LayoutState,
  | "version"
  | "canvasWidth"
  | "canvasHeight"
  | "showColumns"
  | "columns"
  | "gutter"
  | "containerPadding"
  | "sections"
  | "breakpoints"
  | "activeBp"
  | "responsive"
>;

export type LayoutActions = {
  /* Canvas / Columns */
  setCanvasWidth: (w: number) => void;
  setCanvasHeight: (h: number) => void;
  setShowColumns: (b: boolean) => void;
  setColumns: (n: number) => void;
  setGutter: (n: number) => void;
  setContainerPadding: (n: number) => void;

  /* Pages */
  setCurrentPage: (id: string) => void;
  addPage: (name?: string) => void;
  renamePage: (id: string, name: string) => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;

  /* Select / Sections CRUD */
  setSelectedIds: (ids: string[]) => void;
  patchSection: (
    id: string,
    patch: Partial<SectionItem>,
    opts?: { silent?: boolean },
  ) => void;
  addSection: (sec: SectionItem) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;

  /* Z-index ops (선택 대상 전제) */
  bringForward: () => void;
  sendBackward: () => void;
  sendToFront: () => void;
  sendToBack: () => void;

  /* History / Commit */
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  startTransform: () => void; // 드래그/리사이즈 시작시 호출
  updateFrame: (id: string, next: Partial<Frame>) => void; // 변형 중 호출
  commitAfterTransform: () => void; // 변형 종료 후 커밋
};

/**
 * 에디터 전역 스토어(현재 페이지 투영 + 페이지/히스토리)
 * - 현재 페이지의 레이아웃 필드를 "최상위"로 복제하여 접근 편의 제공
 *   (패널/캔버스에서 바로 s.canvasWidth 처럼 접근)
 */
export type LayoutStore = {
  // 현재 페이지의 투영(= LayoutState의 필드들을 최상위에 노출)
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  showColumns: boolean;
  columns: number;
  gutter: number;
  containerPadding: number;
  sections: SectionItem[];
  breakpoints?: Breakpoint[];
  activeBp?: string;
  responsive?: {
    inheritScale?: boolean;
    viewportWidth?: number;
  };

  // 선택 상태
  selectedIds: string[];

  // 페이지/히스토리
  pages: Page[];
  currentPageId: string;
  history: LayoutSnapshot[];
  historyPtr: number;

  // 액션
  actions: LayoutActions;
};
