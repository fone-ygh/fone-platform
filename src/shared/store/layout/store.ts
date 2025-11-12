// src/shared/store/layout.ts
"use client";

import { create, type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import type {
  Breakpoint,
  Frame,
  GuideLine,
  LayoutState,
  Page,
  Purpose,
  SectionItem,
  WidgetType,
} from "./types";

/* ================== helpers ================== */
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max));
const deepClone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const genId = (prefix = "s") =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const rectsOverlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) =>
  !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );

const isSolid = (s: SectionItem) => s.type === "box";

/* ================== defaults ================== */
const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: "base", label: "Base", width: 1200 },
  { id: "sm", label: "SM", width: 640 },
  { id: "md", label: "MD", width: 768 },
  { id: "lg", label: "LG", width: 1024 },
  { id: "xl", label: "XL", width: 1280 },
];

const START_SECTIONS: SectionItem[] = [
  {
    id: "s-1",
    title: "Header",
    type: "box",
    x: 12,
    y: 12,
    width: 1160,
    height: 80,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "header",
    autoColor: true,
  },
  {
    id: "s-2",
    title: "Sidebar",
    type: "box",
    x: 12,
    y: 108,
    width: 280,
    height: 300,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "sidebar",
    autoColor: true,
  },
  {
    id: "s-3",
    title: "Main",
    type: "box",
    x: 304,
    y: 108,
    width: 868,
    height: 300,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "main",
    autoColor: true,
  },
  {
    id: "s-4",
    title: "Footer",
    type: "box",
    x: 12,
    y: 422,
    width: 1160,
    height: 80,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "footer",
    autoColor: true,
  },
];

const makeDefaultLayout = (): LayoutState => ({
  version: 9,
  canvasWidth: 1200,
  canvasHeight: 900,
  sections: deepClone(START_SECTIONS),
  breakpoints: DEFAULT_BREAKPOINTS,
  activeBp: "base",
  responsive: { inheritScale: true, viewportWidth: 1200 },

  // 🔻 레일 호환 필드 사용한다면 types.ts의 LayoutState에 optional로 정의해둘 것
  showColumns: false,
  columns: 0,
  gutter: 0,
  containerPadding: 0,
});

/* ================== collision helpers ================== */
function clampInCanvas(s: SectionItem, W: number, H: number): SectionItem {
  const x = clamp(s.x, 0, Math.max(0, W - s.width));
  const y = clamp(s.y, 0, Math.max(0, H - s.height));
  return { ...s, x, y };
}

function collideBoxes(layout: LayoutState): string[] {
  const solids = layout.sections.filter(isSolid);
  const hit: string[] = [];
  for (let i = 0; i < solids.length; i++) {
    for (let j = i + 1; j < solids.length; j++) {
      const a = solids[i];
      const b = solids[j];
      if (
        rectsOverlap(
          { x: a.x, y: a.y, width: a.width, height: a.height },
          { x: b.x, y: b.y, width: b.width, height: b.height },
        )
      ) {
        hit.push(a.id, b.id);
      }
    }
  }
  return Array.from(new Set(hit));
}

function commitWithCollision(_before: LayoutState, after: LayoutState) {
  // canvas clamp
  const W = after.canvasWidth;
  const H = after.canvasHeight;
  after.sections = after.sections.map(s => clampInCanvas(s, W, H));
  // only box-to-box collision
  const bad = collideBoxes(after);
  if (bad.length) return { ok: false as const, hit: bad };
  return { ok: true as const };
}

/* ================== store shape ================== */
type ToastKind = "info" | "success" | "warning" | "error";
type Toast = { id: number; kind: ToastKind; message: string; ts: number };

type HistoryStacks = Record<
  string,
  { undo: LayoutState[]; redo: LayoutState[] }
>;
type StagingMap = Record<string, LayoutState | null>;

/** 기존 코드 호환을 위한 루트 파생 필드 포함 */
type LayoutStore = {
  /* 페이지/히스토리 */
  pages: Page[];
  currentPageId: string;
  selectedIds: string[];
  history: HistoryStacks;
  staging: StagingMap;

  /* ✅ 루트 파생 필드 */
  canvasWidth: number;
  canvasHeight: number;
  sections: SectionItem[];

  /** 그리드 레일 호환 필드 (일부 컴포넌트가 참조) */
  columns: number;
  gutter: number;
  containerPadding: number;
  showColumns: boolean;

  /* UI */
  toast: Toast | null;

  // 가이드 라인 (렌더 전용 상태)
  guideLines: GuideLine[];

  actions: LayoutActions;
};

type LayoutActions = {
  /* pages */
  setCurrentPage: (id: string) => void;
  addPage: (name?: string) => void;
  renamePage: (id: string, name: string) => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;

  /* selection */
  setSelectedIds: (next: string[] | ((prev: string[]) => string[])) => void;
  clearSelection: () => void;
  selectOne: (id: string) => void;
  toggleSelect: (id: string) => void;

  /* canvas basics */
  setCanvasSize: (w: number, h: number) => void;

  /* responsive */
  setActiveBreakpoint: (bpId: string) => void;
  setViewportWidth: (w: number) => void;

  /* history */
  undo: () => void;
  redo: () => void;

  /* transform pipeline */
  updateFrame: (id: string, rect: Partial<Frame>) => void; // move/resize 중
  commitAfterTransform: () => void; // move/resize 끝

  /* patch & utils */
  addSection: (
    type: WidgetType,
    opts?: Partial<SectionItem> & { history?: boolean },
  ) => string;
  patchSection: (
    id: string,
    patch: Partial<SectionItem>,
    opts?: { history?: boolean },
  ) => void;
  deleteSelected: () => void;
  removeSelected: () => void; // alias
  duplicateSelected: () => void;

  sendToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;

  applyColorToSelection: (color: string, target: "bg" | "text") => void;

  /* toast */
  showToast: (message: string, kind?: ToastKind) => void;
  clearToast: () => void;

  /* (옵션) 레일 보조 액션 */
  setColumns?: (n: number) => void;
  setGutter?: (n: number) => void;
  setContainerPadding?: (n: number) => void;
  setShowColumns?: (b: boolean) => void;

  // 가이드 라인 제어
  setGuideLines: (lines: GuideLine[]) => void;
  clearGuideLines: () => void;
};

/* ================== small utils ================== */
const getCurrentPage = (s: LayoutStore) =>
  s.pages.find(p => p.id === (s.currentPageId || s.pages[0]?.id));

/** 페이지의 layout → 루트 파생 필드 동기화 */
const deriveIntoRoot = (s: LayoutStore) => {
  const page = getCurrentPage(s);
  if (!page) return;
  const ly = page.layout;
  s.canvasWidth = ly.canvasWidth;
  s.canvasHeight = ly.canvasHeight;
  s.sections = ly.sections;
};

/* ================== creator ================== */
const initialLayout = makeDefaultLayout();

const creator: StateCreator<
  LayoutStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set, get) => ({
  /* 기본 상태 */
  pages: [
    { id: genId("page"), name: "Home", layout: deepClone(initialLayout) },
  ],
  currentPageId: "",
  selectedIds: [],
  history: {},
  staging: {},

  /* 루트 파생 필드(초기값: 첫 페이지 레이아웃 값으로 채움) */
  canvasWidth: initialLayout.canvasWidth,
  canvasHeight: initialLayout.canvasHeight,
  sections: initialLayout.sections,

  /* 레일 호환 필드(필요 시 컴포넌트에서 사용) */
  columns: 12,
  gutter: 16,
  containerPadding: 24,
  showColumns: true,

  toast: null,

  guideLines: [],

  actions: {
    /* ---------- pages ---------- */
    setCurrentPage: id =>
      set(s => {
        if (!s.pages.find(p => p.id === id)) return;
        s.currentPageId = id;
        s.selectedIds = [];
        deriveIntoRoot(s);
      }),

    addPage: name =>
      set(s => {
        const pg: Page = {
          id: genId("page"),
          name: name || `Page ${s.pages.length + 1}`,
          layout: makeDefaultLayout(),
        };
        s.pages.push(pg);
        s.currentPageId = pg.id;
        s.selectedIds = [];
        deriveIntoRoot(s);
      }),

    renamePage: (id, name) =>
      set(s => {
        const p = s.pages.find(x => x.id === id);
        if (p && name?.trim()) p.name = name.trim();
      }),

    duplicatePage: id =>
      set(s => {
        const orig = s.pages.find(x => x.id === id);
        if (!orig) return;
        const copy: Page = {
          id: genId("page"),
          name: `${orig.name} Copy`,
          layout: deepClone(orig.layout),
        };
        s.pages.push(copy);
        s.currentPageId = copy.id;
        s.selectedIds = [];
        deriveIntoRoot(s);
      }),

    deletePage: id =>
      set(s => {
        if (s.pages.length <= 1) return;
        const idx = s.pages.findIndex(x => x.id === id);
        if (idx === -1) return;
        s.pages.splice(idx, 1);
        if (s.currentPageId === id) {
          s.currentPageId = s.pages[0].id;
          s.selectedIds = [];
        }
        delete s.history[id];
        delete s.staging[id];
        deriveIntoRoot(s);
      }),

    /* ---------- selection ---------- */
    setSelectedIds: next =>
      set(s => {
        const value =
          typeof next === "function"
            ? (next as (p: string[]) => string[])(s.selectedIds)
            : next;
        s.selectedIds = value;
      }),
    clearSelection: () =>
      set(s => {
        s.selectedIds = [];
      }),
    selectOne: id =>
      set(s => {
        s.selectedIds = [id];
      }),
    toggleSelect: id =>
      set(s => {
        s.selectedIds = s.selectedIds.includes(id)
          ? s.selectedIds.filter(x => x !== id)
          : [...s.selectedIds, id];
      }),

    setGuideLines: lines =>
      set(s => {
        s.guideLines = lines;
      }),
    clearGuideLines: () =>
      set(s => {
        s.guideLines = [];
      }),

    /* ---------- canvas basics ---------- */
    setCanvasSize: (w, h) =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];
        page.layout.canvasWidth = Math.max(300, Math.round(w));
        page.layout.canvasHeight = Math.max(300, Math.round(h));
        const W = page.layout.canvasWidth;
        const H = page.layout.canvasHeight;
        page.layout.sections = page.layout.sections.map(sec =>
          clampInCanvas(sec, W, H),
        );
        deriveIntoRoot(s);
      }),

    /* ---------- responsive ---------- */
    setActiveBreakpoint: bpId =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!page.layout.breakpoints?.find(b => b.id === bpId)) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        page.layout.activeBp = bpId;

        const cw =
          page.layout.breakpoints.find(b => b.id === bpId)?.width ??
          page.layout.canvasWidth;
        page.layout.canvasWidth = cw;

        const readFrame = (sec: SectionItem): Frame => {
          const fr = sec.frames?.[bpId];
          if (fr) return deepClone(fr);
          if (page.layout.responsive?.inheritScale && bpId !== "base") {
            const baseW =
              page.layout.breakpoints?.find(b => b.id === "base")?.width ??
              page.layout.canvasWidth;
            const r = cw / baseW;
            return {
              x: Math.round(sec.x * r),
              y: sec.y,
              width: Math.round(sec.width * r),
              height: sec.height,
              rotate: sec.rotate ?? 0,
            };
          }
          return {
            x: sec.x,
            y: sec.y,
            width: sec.width,
            height: sec.height,
            rotate: sec.rotate ?? 0,
          };
        };

        page.layout.sections = page.layout.sections.map(sec => {
          const fr = readFrame(sec);
          return {
            ...sec,
            x: fr.x,
            y: fr.y,
            width: fr.width,
            height: fr.height,
            rotate: fr.rotate ?? sec.rotate,
          };
        });

        deriveIntoRoot(s);
      }),

    setViewportWidth: w =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        page.layout.responsive = {
          ...(page.layout.responsive || {}),
          viewportWidth: clamp(Math.round(w), 280, 1600),
        };
        // viewportWidth는 파생필드에 영향 없음 (canvas 변경 아님)
      }),

    /* ---------- history ---------- */
    undo: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        const prev = stacks.undo.pop();
        if (!prev) return;
        stacks.redo.push(deepClone(page.layout));
        page.layout = prev;
        s.selectedIds = [];
        deriveIntoRoot(s);
      }),

    redo: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        const next = stacks.redo.pop();
        if (!next) return;
        stacks.undo.push(deepClone(page.layout));
        page.layout = next;
        s.selectedIds = [];
        deriveIntoRoot(s);
      }),

    /* ---------- transform (Moveable 연동) ---------- */
    updateFrame: (id, rect) =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;

        // 첫 updateFrame 호출 시 snapshot 저장
        if (!s.staging[page.id]) {
          s.staging[page.id] = deepClone(page.layout);
        }

        const sec = page.layout.sections.find(x => x.id === id);
        if (!sec) return;

        const nx = rect.x ?? sec.x;
        const ny = rect.y ?? sec.y;
        const nw = rect.width ?? sec.width;
        const nh = rect.height ?? sec.height;
        const nr = rect.rotate ?? sec.rotate;

        sec.x = nx;
        sec.y = ny;
        sec.width = nw;
        sec.height = nh;
        if (typeof nr === "number") sec.rotate = nr;

        deriveIntoRoot(s);
      }),

    commitAfterTransform: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;

        const before = s.staging[page.id];
        s.staging[page.id] = null;

        const after = deepClone(page.layout);
        const result = commitWithCollision(before || after, after);

        if (!result.ok && before) {
          // 충돌 → 이전 레이아웃 복구 (히스토리 변화 없음)
          page.layout = before;
          deriveIntoRoot(s);
          return;
        }

        // 정상 커밋 → 히스토리 push
        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(before ? before : deepClone(page.layout));
        stacks.redo = [];
        page.layout = after;

        deriveIntoRoot(s);
      }),

    /* ---------- create / patch / delete ---------- */
    addSection: (type, opts) => {
      let newId = "";
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;

        const doHistory = opts?.history !== false;
        if (doHistory) {
          const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
          stacks.undo.push(deepClone(page.layout));
          stacks.redo = [];
        }

        const W = page.layout.canvasWidth;
        const H = page.layout.canvasHeight;
        const maxZ = Math.max(0, ...page.layout.sections.map(x => x.z ?? 0));

        const id = genId();
        newId = id;

        const sec: SectionItem = {
          id,
          title: opts?.title ?? cap(type),
          type,
          x: clamp(Math.round(opts?.x ?? 24), 0, Math.max(0, W - 12)),
          y: clamp(Math.round(opts?.y ?? 24), 0, Math.max(0, H - 12)),
          width: clamp(Math.round(opts?.width ?? 240), 12, W),
          height: clamp(Math.round(opts?.height ?? 160), 12, H),
          rotate: opts?.rotate ?? 0,
          radius: opts?.radius ?? 8,
          shadow: opts?.shadow ?? 0,
          z: (opts?.z ?? maxZ) + 1,
          purpose: (opts?.purpose as Purpose) ?? "neutral",
          bg: opts?.bg,
          autoColor: opts?.autoColor ?? true,
          textColorOverride: opts?.textColorOverride,
          frames: opts?.frames,
        };

        const fixed = clampInCanvas(sec, W, H);

        page.layout.sections.push(fixed);
        s.selectedIds = [id];
        deriveIntoRoot(s);
      });
      return newId;
    },

    patchSection: (id, patch, opts) =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;

        if (opts?.history !== false) {
          const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
          stacks.undo.push(deepClone(page.layout));
          stacks.redo = [];
        }

        const sec = page.layout.sections.find(x => x.id === id);
        if (!sec) return;
        Object.assign(sec, patch);

        // 안전 범위 보정
        sec.width = Math.max(12, sec.width);
        sec.height = Math.max(12, sec.height);
        sec.x = clamp(
          sec.x,
          0,
          Math.max(0, page.layout.canvasWidth - sec.width),
        );
        sec.y = clamp(
          sec.y,
          0,
          Math.max(0, page.layout.canvasHeight - sec.height),
        );

        deriveIntoRoot(s);
      }),

    deleteSelected: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;

        const sel = s.selectedIds;
        if (!sel.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        page.layout.sections = page.layout.sections.filter(
          sec => !sel.includes(sec.id),
        );
        s.selectedIds = [];
        deriveIntoRoot(s);
      }),

    // ✅ 깔끔한 별칭
    removeSelected: () => {
      const { deleteSelected } = get().actions;
      deleteSelected();
    },

    duplicateSelected: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!s.selectedIds.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        const grid = 10;
        const copies: SectionItem[] = [];
        for (const id of s.selectedIds) {
          const sec = page.layout.sections.find(x => x.id === id);
          if (!sec) continue;
          copies.push({
            ...deepClone(sec),
            id: genId(),
            title: sec.title + " Copy",
            x: clamp(
              sec.x + grid * 2,
              0,
              Math.max(0, page.layout.canvasWidth - sec.width),
            ),
            y: clamp(
              sec.y + grid * 2,
              0,
              Math.max(0, page.layout.canvasHeight - sec.height),
            ),
          } as SectionItem);
        }
        page.layout.sections.push(...copies);
        deriveIntoRoot(s);
      }),

    /* ---------- z-order ---------- */
    sendToFront: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!s.selectedIds.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        const maxZ = Math.max(0, ...page.layout.sections.map(x => x.z ?? 0));
        page.layout.sections = page.layout.sections.map(sec =>
          s.selectedIds.includes(sec.id) ? { ...sec, z: maxZ + 1 } : sec,
        );
        deriveIntoRoot(s);
      }),

    sendToBack: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!s.selectedIds.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        const minZ = Math.min(0, ...page.layout.sections.map(x => x.z ?? 0));
        page.layout.sections = page.layout.sections.map(sec =>
          s.selectedIds.includes(sec.id) ? { ...sec, z: minZ - 1 } : sec,
        );
        deriveIntoRoot(s);
      }),

    bringForward: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!s.selectedIds.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        page.layout.sections = page.layout.sections.map(sec =>
          s.selectedIds.includes(sec.id)
            ? { ...sec, z: (sec.z ?? 0) + 1 }
            : sec,
        );
        deriveIntoRoot(s);
      }),

    sendBackward: () =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!s.selectedIds.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        page.layout.sections = page.layout.sections.map(sec =>
          s.selectedIds.includes(sec.id)
            ? { ...sec, z: (sec.z ?? 0) - 1 }
            : sec,
        );
        deriveIntoRoot(s);
      }),

    applyColorToSelection: (color, target) =>
      set(s => {
        const page = getCurrentPage(s);
        if (!page) return;
        if (!s.selectedIds.length) return;

        const stacks = (s.history[page.id] ||= { undo: [], redo: [] });
        stacks.undo.push(deepClone(page.layout));
        stacks.redo = [];

        page.layout.sections = page.layout.sections.map(sec => {
          if (!s.selectedIds.includes(sec.id)) return sec;
          if (target === "bg") return { ...sec, bg: color, autoColor: false };
          return { ...sec, textColorOverride: color };
        });

        deriveIntoRoot(s);
      }),

    /* ---------- toast ---------- */
    showToast: (message, kind = "info") =>
      set(s => {
        s.toast = { id: Date.now(), kind, message, ts: Date.now() };
      }),
    clearToast: () =>
      set(s => {
        s.toast = null;
      }),

    /* ---------- (옵션) 레일 보조 액션 ---------- */
    setColumns: n =>
      set(s => {
        s.columns = Math.max(1, Math.floor(n));
      }),
    setGutter: n =>
      set(s => {
        s.gutter = Math.max(0, Math.floor(n));
      }),
    setContainerPadding: n =>
      set(s => {
        s.containerPadding = Math.max(0, Math.floor(n));
      }),
    setShowColumns: b =>
      set(s => {
        s.showColumns = !!b;
      }),
  },
});

/* ================== create (persist ∘ immer) ================== */
export const useLayoutStore = create<LayoutStore>()(
  persist(immer(creator), {
    name: "LAYOUT",
    // 지금은 아무 것도 저장하지 않음(함수 직렬화 이슈 회피)
    // ❗ partialize는 파라미터를 받는 함수여야 함
    partialize: _s => ({}) as Partial<LayoutStore>,
  }),
);
