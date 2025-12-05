// src/features/patterns/store/patternStore.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import type { PatternState } from "./type";

const nowIso = () => new Date().toISOString();

const makeCustomId = () => {
  const base =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;

  return `custom_${base}`;
};

export const usePatternStore = create<PatternState>()(
  immer(
    persist(
      (set, _get) => ({
        customPatterns: [],
        actions: {
          addPattern: pattern => {
            const id = makeCustomId();
            const createdAt = nowIso();

            set(s => {
              s.customPatterns.push({
                ...pattern,
                id: "p1-1",
                createdAt,
                updatedAt: createdAt,
              });
            });

            return id;
          },

          removeCustomPattern: id =>
            set(s => {
              s.customPatterns = s.customPatterns.filter(p => p.id !== id);
            }),

          updateCustomPattern: (id, patch) =>
            set(s => {
              const idx = s.customPatterns.findIndex(p => p.id === id);
              if (idx < 0) return;

              const prev = s.customPatterns[idx];
              const { id: _ignoreId, ...rest } = patch as any;

              s.customPatterns[idx] = {
                ...prev,
                ...rest,
                updatedAt: nowIso(),
              };
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

// actions 헬퍼
export const usePatternActions = () => usePatternStore(s => s.actions);
