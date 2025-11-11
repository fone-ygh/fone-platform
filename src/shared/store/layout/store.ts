"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import { commitOrBounceLayout } from "./collision";
import { DEFAULT_PAGES, makeDefaultLayout } from "./defaults";
import { applyActiveFramesToTopLevel } from "./responsive";
import type {
  CommitResult,
  GuideTheme,
  LayoutState,
  Page,
  SectionItem,
  Theme,
} from "./types";
import { clamp, deepClone, genId } from "./utils";

/* ====================== Store Type ====================== */
export type LayoutStore = {
  theme: Theme;
  guideTheme: GuideTheme;
  brandHue: number;

  pages: Page[];
  currentPageId: string;

  selectedIds: string[];

  // undo/redo (페이지별 히스토리) — 메모리 전용(비영속)
  _undo: Record<string, LayoutState[]>;
  _redo: Record<string, LayoutState[]>;

  // 최근 커밋 에러 정보(겹침 등) — UI가 읽어 토스트/플래시 처리
  lastError: string | null;
  lastCollidedIds: string[];

  actions: {
    /* theme */
    setTheme: (t: Theme) => void;
    setGuideTheme: (g: GuideTheme) => void;
    setBrandHue: (h: number) => void;

    /* page */
    setCurrentPageId: (id: string) => void;
    addPage: (name?: string) => void;
    renamePage: (id: string, name: string) => void;
    duplicatePage: (id: string) => void;
    deletePage: (id: string) => void;

    /* selection */
    setSelectedIds: (ids: string[]) => void;
    clearSelection: () => void;
    toggleSelect: (id: string) => void;

    /* layout mutators (현재 페이지) */
    setCanvasSize: (w: number, h: number) => void;
    setActiveBreakpoint: (bpId: string) => void;
    setResponsiveInheritScale: (v: boolean) => void;
    setResponsiveViewportWidth: (w: number) => void;

    /* section CRUD */
    addPreset: (preset: SectionItem["type"] | "hero") => void;
    removeSections: (ids: string[]) => void;
    duplicateSections: (ids: string[]) => void;

    /* section prop */
    setSectionProp: <K extends keyof SectionItem>(
      id: string,
      key: K,
      value: SectionItem[K],
    ) => void;
    setSectionRect: (
      id: string,
      x: number,
      y: number,
      w?: number,
      h?: number,
    ) => CommitResult;
    moveSelectedBy: (dx: number, dy: number) => CommitResult;

    /* z-index */
    sendToFront: (ids: string[]) => void;
    sendToBack: (ids: string[]) => void;
    bringForward: (ids: string[]) => void;
    sendBackward: (ids: string[]) => void;

    /* history */
    pushHistory: () => void;
    undo: () => void;
    redo: () => void;

    /* project IO */
    toJSON: () => {
      version: number;
      theme: Theme;
      guideTheme: GuideTheme;
      brandHue: number;
      pages: Page[];
      currentPageId: string;
    };
    fromJSON: (proj: any) => void;

    /* internal utils (UI가 필요시 호출) */
    clearLastError: () => void;
  };
};

/* ====================== Store ====================== */
export const useLayoutStore = create<LayoutStore>()(
  immer(
    persist(
      (set, get) => ({
        theme: "light",
        guideTheme: "blue",
        brandHue: 210,

        pages: deepClone(DEFAULT_PAGES),
        currentPageId: deepClone(DEFAULT_PAGES[0].id),

        selectedIds: [],

        _undo: {},
        _redo: {},

        lastError: null,
        lastCollidedIds: [],

        actions: {
          /* theme */
          setTheme: t =>
            set(s => {
              s.theme = t;
            }),
          setGuideTheme: g =>
            set(s => {
              s.guideTheme = g;
            }),
          setBrandHue: h =>
            set(s => {
              s.brandHue = h;
            }),

          /* page */
          setCurrentPageId: id =>
            set(s => {
              if (!s.pages.some(p => p.id === id)) return;
              s.currentPageId = id;
              s.selectedIds = [];
              const pg = currentPageRef(s);
              pg.layout = applyActiveFramesToTopLevel(pg.layout);
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
            }),

          renamePage: (id, name) =>
            set(s => {
              const p = s.pages.find(x => x.id === id);
              if (p) p.name = name;
            }),

          duplicatePage: id =>
            set(s => {
              const orig = s.pages.find(p => p.id === id);
              if (!orig) return;
              const copy: Page = {
                id: genId("page"),
                name: `${orig.name} Copy`,
                layout: deepClone(orig.layout),
              };
              s.pages.push(copy);
              s.currentPageId = copy.id;
              s.selectedIds = [];
            }),

          deletePage: id =>
            set(s => {
              if (s.pages.length <= 1) return;
              const idx = s.pages.findIndex(p => p.id === id);
              if (idx < 0) return;
              s.pages.splice(idx, 1);
              if (s.currentPageId === id) s.currentPageId = s.pages[0].id;
              s.selectedIds = [];
              delete s._undo[id];
              delete s._redo[id];
            }),

          /* selection */
          setSelectedIds: ids =>
            set(s => {
              s.selectedIds = Array.from(new Set(ids));
            }),
          clearSelection: () =>
            set(s => {
              s.selectedIds = [];
            }),
          toggleSelect: id =>
            set(s => {
              s.selectedIds = s.selectedIds.includes(id)
                ? s.selectedIds.filter(x => x !== id)
                : [...s.selectedIds, id];
            }),

          /* layout props (current page) */
          setCanvasSize: (w, h) =>
            set(s => {
              const pg = currentPageRef(s);
              pg.layout.canvasWidth = clamp(w, 300, 4000);
              pg.layout.canvasHeight = clamp(h, 300, 4000);
            }),

          setActiveBreakpoint: bpId =>
            set(s => {
              const pg = currentPageRef(s);
              pg.layout.activeBp = bpId;
              pg.layout = applyActiveFramesToTopLevel(pg.layout);
            }),

          setResponsiveInheritScale: v =>
            set(s => {
              const pg = currentPageRef(s);
              pg.layout.responsive = {
                ...(pg.layout.responsive || {}),
                inheritScale: v,
              };
              pg.layout = applyActiveFramesToTopLevel(pg.layout);
            }),

          setResponsiveViewportWidth: w =>
            set(s => {
              const pg = currentPageRef(s);
              const width = clamp(w, 280, 1600);
              pg.layout.responsive = {
                ...(pg.layout.responsive || {}),
                viewportWidth: width,
              };
            }),

          /* section CRUD / presets */
          addPreset: preset =>
            set(s => {
              const pg = currentPageRef(s);
              const L = pg.layout;
              const padding = 24;
              const baseW = Math.floor(L.canvasWidth / 3);
              let item: SectionItem = {
                id: genId(),
                title: "Box",
                type: "box",
                x: padding,
                y: padding,
                width: Math.min(baseW, L.canvasWidth - padding * 2),
                height: 140,
                radius: 10,
                shadow: 1,
                z: 1,
                purpose: "card",
                autoColor: true,
              };

              switch (preset) {
                case "text":
                  item = {
                    ...item,
                    title: "Text",
                    type: "text",
                    text: "더블클릭하여 편집",
                    fontSize: 18,
                    textAlign: "left",
                    width: 420,
                    height: 120,
                    purpose: "neutral",
                    autoColor: false,
                    bg: "transparent",
                  };
                  break;
                case "image":
                  item = {
                    ...item,
                    title: "Image",
                    type: "image",
                    imageUrl:
                      "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=60",
                    objectFit: "cover",
                    width: 360,
                    height: 220,
                    purpose: "neutral",
                    autoColor: false,
                  };
                  break;
                case "button":
                  item = {
                    ...item,
                    title: "Button",
                    type: "button",
                    btnLabel: "페이지 이동",
                    btnHref: "page:About",
                    btnVariant: "solid",
                    width: 200,
                    height: 52,
                    purpose: "cta",
                    autoColor: true,
                  };
                  break;
                case "list":
                  item = {
                    ...item,
                    title: "List",
                    type: "list",
                    width: 300,
                    height: 200,
                    listItems: ["항목 A", "항목 B", "항목 C"],
                    purpose: "neutral",
                    autoColor: true,
                  };
                  break;
                case "card":
                  item = {
                    ...item,
                    title: "Card",
                    type: "card",
                    width: 320,
                    height: 220,
                    purpose: "card",
                    autoColor: true,
                  };
                  break;
                case "gallery":
                  item = {
                    ...item,
                    title: "Gallery",
                    type: "gallery",
                    width: L.canvasWidth - padding * 2,
                    height: 260,
                    purpose: "gallery",
                    autoColor: true,
                  };
                  break;
                case "hero":
                  item = {
                    ...item,
                    title: "Hero",
                    type: "box",
                    width: L.canvasWidth - padding * 2,
                    height: 260,
                    purpose: "hero",
                    autoColor: true,
                  };
                  break;
                case "tabs":
                  item = {
                    ...item,
                    title: "Tabs",
                    type: "tabs",
                    width: 560,
                    height: 240,
                    tabs: [
                      { label: "Tab 1", content: "첫 번째 탭 콘텐츠" },
                      { label: "Tab 2", content: "두 번째 탭 콘텐츠" },
                      { label: "Tab 3", content: "세 번째 탭 콘텐츠" },
                    ],
                    activeTabIndex: 0,
                    autoColor: true,
                    purpose: "neutral",
                  };
                  break;
                case "accordion":
                  item = {
                    ...item,
                    title: "Accordion",
                    type: "accordion",
                    width: 480,
                    height: 260,
                    accordion: [
                      { label: "아코디언 A", content: "내용 A", open: true },
                      { label: "아코디언 B", content: "내용 B", open: false },
                      { label: "아코디언 C", content: "내용 C", open: false },
                    ],
                    autoColor: true,
                    purpose: "neutral",
                  };
                  break;
                case "pricing":
                  item = {
                    ...item,
                    title: "Pricing",
                    type: "pricing",
                    width: 720,
                    height: 280,
                    pricing: [
                      {
                        name: "Basic",
                        price: "$9",
                        features: ["1 Project", "Email Support"],
                        highlight: false,
                      },
                      {
                        name: "Pro",
                        price: "$29",
                        features: ["5 Projects", "Priority Support"],
                        highlight: true,
                      },
                      {
                        name: "Team",
                        price: "$59",
                        features: ["Unlimited", "Dedicated Support"],
                        highlight: false,
                      },
                    ],
                    autoColor: true,
                    purpose: "card",
                  };
                  break;
              }

              // 새 박스 y 배치(간단 규칙)
              const paddingY = 24;
              const y = Math.min(
                L.canvasHeight - item.height - paddingY,
                paddingY + L.sections.length * (item.height + paddingY),
              );

              L.sections.push({ ...item, y: Math.max(paddingY, y) });
            }),

          removeSections: ids =>
            set(s => {
              const pg = currentPageRef(s);
              if (ids.length === 0) return;
              s.actions.pushHistory();
              pg.layout.sections = pg.layout.sections.filter(
                x => !ids.includes(x.id),
              );
              s.selectedIds = s.selectedIds.filter(x => !ids.includes(x));
            }),

          duplicateSections: ids =>
            set(s => {
              const pg = currentPageRef(s);
              if (ids.length === 0) return;
              s.actions.pushHistory();
              const copies: SectionItem[] = [];
              for (const id of ids) {
                const src = pg.layout.sections.find(x => x.id === id);
                if (!src) continue;
                copies.push({
                  ...deepClone(src),
                  id: genId(),
                  title: `${src.title} Copy`,
                  x: Math.min(src.x + 32, pg.layout.canvasWidth - src.width),
                  y: Math.min(src.y + 32, pg.layout.canvasHeight - src.height),
                });
              }
              pg.layout.sections.push(...copies);
              s.selectedIds = copies.map(c => c.id);
            }),

          /* section prop & rect */
          setSectionProp: (id, key, value) =>
            set(s => {
              const pg = currentPageRef(s);
              const t = pg.layout.sections.find(x => x.id === id);
              if (!t) return;
              (t as any)[key] = value;
            }),

          setSectionRect: (id, x, y, w, h) => {
            const s0 = get();
            const pg = currentPageRef(s0);
            const L = deepClone(pg.layout);
            const t = L.sections.find(x => x.id === id);
            if (!t)
              return {
                ok: false,
                message: "not found",
                collidedIds: [],
              } as CommitResult;

            // 크기/위치 보정
            const nx = clamp(x, 0, Math.max(0, L.canvasWidth - t.width));
            const ny = clamp(y, 0, Math.max(0, L.canvasHeight - t.height));
            t.x = nx;
            t.y = ny;
            if (typeof w === "number") t.width = Math.max(12, w);
            if (typeof h === "number") t.height = Math.max(12, h);

            const commit = commitOrBounceLayout(L);
            if (commit.ok) {
              get().actions.pushHistory();
              set(s => {
                const pg2 = currentPageRef(s);
                pg2.layout = L;
                s.lastError = null;
                s.lastCollidedIds = [];
              });
            } else {
              set(s => {
                s.lastError = commit.message;
                s.lastCollidedIds = commit.collidedIds;
              });
            }
            return commit;
          },

          moveSelectedBy: (dx, dy) => {
            const s0 = get();
            const ids = s0.selectedIds;
            if (ids.length === 0) return { ok: true } as CommitResult;

            const pg = currentPageRef(s0);
            const L = deepClone(pg.layout);

            for (const id of ids) {
              const t = L.sections.find(x => x.id === id);
              if (!t || t.locked) continue;
              t.x = clamp(t.x + dx, 0, Math.max(0, L.canvasWidth - t.width));
              t.y = clamp(t.y + dy, 0, Math.max(0, L.canvasHeight - t.height));
            }

            const commit = commitOrBounceLayout(L);
            if (commit.ok) {
              get().actions.pushHistory();
              set(s => {
                const pg2 = currentPageRef(s);
                pg2.layout = L;
                s.lastError = null;
                s.lastCollidedIds = [];
              });
            } else {
              set(s => {
                s.lastError = commit.message;
                s.lastCollidedIds = commit.collidedIds;
              });
            }
            return commit;
          },

          /* z-index */
          sendToFront: ids =>
            set(s => {
              if (!ids.length) return;
              const pg = currentPageRef(s);
              const maxZ = Math.max(
                0,
                ...pg.layout.sections.map(x => x.z ?? 0),
              );
              pg.layout.sections = pg.layout.sections.map(x =>
                ids.includes(x.id) ? { ...x, z: maxZ + 1 } : x,
              );
            }),
          sendToBack: ids =>
            set(s => {
              if (!ids.length) return;
              const pg = currentPageRef(s);
              const minZ = Math.min(
                0,
                ...pg.layout.sections.map(x => x.z ?? 0),
              );
              pg.layout.sections = pg.layout.sections.map(x =>
                ids.includes(x.id) ? { ...x, z: minZ - 1 } : x,
              );
            }),
          bringForward: ids =>
            set(s => {
              if (!ids.length) return;
              const pg = currentPageRef(s);
              pg.layout.sections = pg.layout.sections.map(x =>
                ids.includes(x.id) ? { ...x, z: (x.z ?? 0) + 1 } : x,
              );
            }),
          sendBackward: ids =>
            set(s => {
              if (!ids.length) return;
              const pg = currentPageRef(s);
              pg.layout.sections = pg.layout.sections.map(x =>
                ids.includes(x.id) ? { ...x, z: (x.z ?? 0) - 1 } : x,
              );
            }),

          /* history */
          pushHistory: () =>
            set(s => {
              const id = s.currentPageId;
              if (!s._undo[id]) s._undo[id] = [];
              const snap = deepClone(currentPageRef(s).layout);
              s._undo[id].push(snap);
              if (s._undo[id].length > 100) s._undo[id].shift();
              s._redo[id] = [];
            }),

          undo: () =>
            set(s => {
              const id = s.currentPageId;
              const stack = s._undo[id] || [];
              if (!stack.length) return;
              const prev = stack.pop()!;
              if (!s._redo[id]) s._redo[id] = [];
              const curSnap = deepClone(currentPageRef(s).layout);
              s._redo[id].push(curSnap);
              currentPageRef(s).layout = prev;
              s.selectedIds = [];
            }),

          redo: () =>
            set(s => {
              const id = s.currentPageId;
              const stack = s._redo[id] || [];
              if (!stack.length) return;
              const next = stack.pop()!;
              if (!s._undo[id]) s._undo[id] = [];
              const curSnap = deepClone(currentPageRef(s).layout);
              s._undo[id].push(curSnap);
              currentPageRef(s).layout = next;
              s.selectedIds = [];
            }),

          /* project IO */
          toJSON: () => {
            const s0 = get();
            return {
              version: 2,
              theme: s0.theme,
              guideTheme: s0.guideTheme,
              brandHue: s0.brandHue,
              pages: s0.pages,
              currentPageId: s0.currentPageId,
            };
          },

          fromJSON: (proj: any) =>
            set(s => {
              if (!proj || !Array.isArray(proj.pages)) return;
              s.pages = proj.pages;
              s.currentPageId = proj.currentPageId || proj.pages[0].id;
              s.theme = (proj.theme as Theme) || "light";
              s.guideTheme = (proj.guideTheme as any) || "blue";
              s.brandHue =
                typeof proj.brandHue === "number" ? proj.brandHue : 210;
              s.selectedIds = [];
            }),

          clearLastError: () =>
            set(s => {
              s.lastError = null;
              s.lastCollidedIds = [];
            }),
        },
      }),
      {
        name: "EDITOR_LAYOUT", // 기존 키 유지(데이터 연속성)
        // 함수/히스토리(_undo/_redo)는 저장하지 않고, 프로젝트 데이터만 저장
        partialize: state => ({
          theme: state.theme,
          guideTheme: state.guideTheme,
          brandHue: state.brandHue,
          pages: state.pages,
          currentPageId: state.currentPageId,
          selectedIds: [], // 선택은 복원하지 않음
        }),
      },
    ),
  ),
);

/* selector helper */
export const useLayoutActions = () => useLayoutStore(s => s.actions);

/* ============ internal helper (store scope) ============ */
function currentPageRef(s: LayoutStore): Page {
  return s.pages.find(p => p.id === s.currentPageId) || s.pages[0];
}
