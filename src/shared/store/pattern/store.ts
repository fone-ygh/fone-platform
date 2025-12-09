// src/features/patterns/store/patternStore.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { ScreenDefinition } from "@/features/patterns/types";
import { persist } from "@/shared/lib/store-util";

type CustomPattern = ScreenDefinition & {
  // ScreenDefinition에도 id가 있겠지만, 어쨌든 우리가 생성한다는 의미로 확장
  id: string;
  createdAt: string;
  updatedAt?: string;
};

export interface PatternState {
  customPatterns: CustomPattern[];
  actions: {
    /** 항상 새 patternId를 만들어서 패턴 추가 */
    addPattern: (p: Omit<CustomPattern, "id" | "createdAt">) => string;
    removeCustomPattern: (id: string) => void;
    updateCustomPattern: (id: string, patch: Partial<ScreenDefinition>) => void;
    clearCustomPatterns: () => void;
  };
}

// patternId 생성 유틸
const makePatternId = () =>
  `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const usePatternStore = create<PatternState>()(
  immer(
    persist(
      (set, get) => ({
        customPatterns: [],
        actions: {
          addPattern: payload => {
            const id = makePatternId();
            const now = new Date().toISOString();

            const pattern: CustomPattern = {
              ...payload,
              id,
              createdAt: now,
              updatedAt: now,
            };

            set(s => {
              s.customPatterns.push(pattern);
            });

            return id; // 새로 만들어진 patternId를 리턴
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
        }),
      },
    ),
  ),
);

export const usePatternActions = () => usePatternStore(s => s.actions);
