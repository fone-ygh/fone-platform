// src/shared/store/screen/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";
import { createSectionsForPattern } from "@/shared/store/contentLayout/defaults";
import type { AnySection } from "@/shared/store/contentLayout/types";
import { usePatternStore } from "@/shared/store/pattern/store";

import type { Screen } from "./types";

type ScreenState = {
  screens: Screen[];
  actions: {
    addScreen: (base: Omit<Screen, "id" | "createdAt" | "updatedAt">) => string;
    updateScreen: (id: string, patch: Partial<Omit<Screen, "id">>) => void;
    removeScreen: (id: string) => void;
  };
};

function genScreenId() {
  return `screen_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export const useScreenStore = create<ScreenState>()(
  immer(
    persist(
      set => ({
        screens: [],
        actions: {
          addScreen: base => {
            const id = genScreenId();
            const now = new Date().toISOString();

            set(s => {
              s.screens.push({
                id,
                createdAt: now,
                updatedAt: now,
                ...base,
              });
            });

            return id;
          },

          updateScreen: (id, patch) =>
            set(s => {
              s.screens = s.screens.map(sc =>
                sc.id === id
                  ? { ...sc, ...patch, updatedAt: new Date().toISOString() }
                  : sc,
              );
            }),

          removeScreen: id =>
            set(s => {
              s.screens = s.screens.filter(sc => sc.id !== id);
            }),
        },
      }),
      {
        name: "SCREENS",
        partialize: state => ({ screens: state.screens }),
      },
    ),
  ),
);

export const useScreenActions = () => useScreenStore(s => s.actions);

// ---- selectors (getState 기반, flows에서 쓰기 좋게) ----
export function getScreenById(id: string) {
  return useScreenStore.getState().screens.find(s => s.id === id) ?? null;
}

// ---- "new screen" 테스트 플로우에서 쓰는 헬퍼 ----
export function createScreenFromPattern(originPatternId: string | null) {
  const pattern = usePatternStore.getState();

  // custom이면 그걸 쓰고, 아니면 built-in defaults 쓰고, null이면 blank
  let sections: AnySection[] = [];
  let canvasWidth = 1920;
  let canvasHeight = 1080;

  if (!originPatternId) {
    sections = [];
  } else {
    const custom = pattern.customPatterns.find(p => p.id === originPatternId);
    if (custom) {
      sections = (custom.sections ?? []) as AnySection[];
      canvasWidth = custom.canvasWidth ?? 1920;
      canvasHeight = custom.canvasHeight ?? 1080;
    } else {
      sections = createSectionsForPattern(originPatternId) as AnySection[];
    }
  }

  const { addScreen } = useScreenStore.getState().actions;
  return addScreen({
    title: "Untitled Screen",
    status: "draft",
    originPatternId,
    canvasWidth,
    canvasHeight,
    sections,
  });
}
