// src/shared/store/layout/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import {
  createSection,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
} from "./defaults";
import type { InsertTool, LayoutState, Section, SectionType } from "./types";
import { applyZChange, cloneSection, maxZ, normalizeZ } from "./utils";

export const useLayoutStore = create<LayoutState>()(
  immer(
    persist(
      (set, get) => ({
        canvasWidth: DEFAULT_CANVAS_WIDTH,
        canvasHeight: DEFAULT_CANVAS_HEIGHT,

        sections: [],
        selectedIds: [],
        version: 0,

        insertTool: null as InsertTool,

        scopeParentId: null,

        actions: {
          /* ---------------- Canvas ---------------- */
          setCanvasSize: (w, h) =>
            set(s => {
              s.canvasWidth = w;
              s.canvasHeight = h;
            }),

          /* ---------------- Selection ---------------- */
          setSelectedIds: ids =>
            set(s => {
              s.selectedIds = [...ids];
            }),

          /* ---------------- Sections set/clear ---------------- */
          setSections: next =>
            set(s => {
              s.sections = normalizeZ(next);
              s.selectedIds = [];
            }),

          setClearSections: () =>
            set(s => {
              s.sections = [];
              s.selectedIds = [];
            }),

          /* ---------------- CRUD ---------------- */
          setAddSection: (type: SectionType, init) => {
            const cur = get().sections;
            const z = maxZ(cur) + 1;
            const sec = createSection(type, z, init);
            set(s => {
              s.sections = normalizeZ([...s.sections, sec]);
            });
            return sec.id;
          },

          setPatchSection: (id, patch) =>
            set(s => {
              s.sections = s.sections.map(ss =>
                ss.id === id ? ({ ...ss, ...patch } as Section) : ss,
              );
            }),

          setUpdateFrame: (id, patch) =>
            set(s => {
              s.sections = s.sections.map(ss =>
                ss.id === id
                  ? ({
                      ...ss,
                      x: patch.x ?? ss.x,
                      y: patch.y ?? ss.y,
                      width: patch.width ?? ss.width,
                      height: patch.height ?? ss.height,
                      rotate: patch.rotate ?? ss.rotate,
                    } as Section)
                  : ss,
              );
            }),

          setDeleteSelected: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              const setSel = new Set(s.selectedIds);
              const next = s.sections.filter(sec => !setSel.has(sec.id));
              s.sections = normalizeZ(next);
              s.selectedIds = [];
            }),

          setDuplicateSelected: () =>
            set(s => {
              if (!s.selectedIds.length) return;

              const setSel = new Set(s.selectedIds);
              const picked = s.sections
                .filter(sec => setSel.has(sec.id))
                .sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

              let zPtr = maxZ(s.sections) + 1;
              const clones: Section[] = picked.map(sec =>
                cloneSection(sec, zPtr++),
              );

              s.sections = normalizeZ([...s.sections, ...clones]);
              s.selectedIds = clones.map(c => c.id);
            }),

          /* ---------------- Z-Order ---------------- */
          setSendToFront: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              const top = maxZ(s.sections);
              const moved = s.sections.map(sec =>
                s.selectedIds.includes(sec.id) ? { ...sec, z: top + 1 } : sec,
              );
              s.sections = normalizeZ(moved);
            }),

          setSendToBack: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              const moved = s.sections.map(sec =>
                s.selectedIds.includes(sec.id) ? { ...sec, z: -1 } : sec,
              );
              s.sections = normalizeZ(moved);
            }),

          setBringForward: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              s.sections = applyZChange(s.sections, s.selectedIds, z => z + 1);
            }),

          setSendBackward: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              s.sections = applyZChange(s.sections, s.selectedIds, z => z - 1);
            }),

          /* ---------------- Appearance ---------------- */
          setApplyColorToSelection: (color, target) =>
            set(s => {
              if (!s.selectedIds.length) return;
              s.sections = s.sections.map(sec => {
                if (!s.selectedIds.includes(sec.id)) return sec;
                if (target === "bg") return { ...sec, bg: color };
                if (target === "text") return { ...sec, color };
                return sec;
              });
            }),

          /* ---------------- Commit ---------------- */
          setCommitAfterTransform: () =>
            set(s => {
              s.version += 1;
            }),

          setInsertTool: (tool: InsertTool) =>
            set(s => {
              s.insertTool = tool;
            }),

          /* ---------------- Lock ---------------- */
          setLock: (id, lock) =>
            set(s => {
              s.sections = s.sections.map(sec =>
                sec.id === id ? { ...sec, lock } : sec,
              );
            }),

          /* ---------------- Drilldown Scope ---------------- */
          setScopeParentId: parentId =>
            set(s => {
              s.scopeParentId = parentId;
              s.selectedIds = []; // 스코프 바뀌면 선택 초기화
            }),

          /* ---------------- 🔹 Reset 전체 초기화 ---------------- */
          setReset: () =>
            set(s => {
              s.canvasWidth = DEFAULT_CANVAS_WIDTH;
              s.canvasHeight = DEFAULT_CANVAS_HEIGHT;
              s.sections = [];
              s.selectedIds = [];
              s.version = 0;
              s.insertTool = null;
              s.scopeParentId = null;
            }),
        },
      }),
      {
        name: "LAYOUT",
        // actions 직렬화 이슈 회피 — 현재는 아무 것도 저장하지 않음
        partialize: () => ({}),
      },
    ),
  ),
);

// Editor 스토어와 동일한 헬퍼 훅 제공
export const useLayoutActions = () => useLayoutStore(s => s.actions);
