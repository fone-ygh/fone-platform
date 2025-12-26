// src/shared/store/pattern/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";
import type { Section } from "@/shared/store/editor/contentLayout/types";

import { CustomPattern, PatternMeta, PatternState } from "./types";

function genCustomId() {
  return `custom_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

const initialMeta: PatternMeta = {
  title: "",
  description: "",
  patternId: null,
  originPatternId: null,
};

export const usePatternStore = create<PatternState>()(
  immer(
    persist(
      (set, get) => ({
        customPatterns: [],
        meta: initialMeta,
        actions: {
          setMeta: patch =>
            set(s => {
              s.meta = { ...s.meta, ...patch };
            }),

          addPattern: base => {
            const id = genCustomId();
            const now = new Date().toISOString();

            const newPattern: CustomPattern = {
              id,
              createdAt: now,
              ...base,
            };

            set(s => {
              s.customPatterns.push(newPattern);

              // 저장과 동시에 메타도 이 값으로 동기화
              s.meta.title = newPattern.title;
              s.meta.description = newPattern.description ?? "";
              s.meta.patternId = id;
              s.meta.originPatternId = newPattern.originPatternId || null;
            });

            return id;
          },

          removeCustomPattern: id =>
            set(s => {
              s.customPatterns = s.customPatterns.filter(p => p.id !== id);
            }),

          updateCustomPattern: (id, patch) =>
            set(s => {
              s.customPatterns = s.customPatterns.map(p =>
                p.id === id
                  ? { ...p, ...patch, updatedAt: new Date().toISOString() }
                  : p,
              );
            }),

          clearCustomPatterns: () =>
            set(s => {
              s.customPatterns = [];
            }),
        },
      }),
      {
        name: "PATTERNS",
        partialize: state => ({
          customPatterns: state.customPatterns,
          // meta는 새로고침 때 초기화되도 상관없으면 저장 안 해도 됨.
          // meta까지 로컬스토리지에 저장하고 싶으면 아래 라인 추가:
          // meta: state.meta,
        }),
      },
    ),
  ),
);

// actions 헬퍼
export const usePatternActions = () => usePatternStore(s => s.actions);
