// src/features/patterns/store/patternStore.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";
import type { Section } from "@/shared/store/layout/types";

/**
 * 빌트인 / 커스텀과 무관하게
 * "실제 저장되는 사용자 정의 패턴" 모델
 */
export interface CustomPattern {
  /** 커스텀 패턴 고유 id (custom_ 프리픽스 권장) */
  id: string;

  /**
   * 이 패턴의 원형
   * - 빌트인: "p3-1", "p4-2" ...
   * - 커스텀에서 복제: "custom_xxx"
   * - 완전 새로 만든 패턴: null
   */
  originPatternId: string | null;

  /** 패턴 이름 / 설명 (PatternList 카드에서 사용) */
  title: string;
  description?: string;

  /** 이 패턴을 만들 당시의 캔버스 사이즈 */
  canvasWidth: number;
  canvasHeight: number;

  /** 레이아웃 상태 스냅샷 */
  sections: Section[];

  createdAt: string;
  updatedAt?: string;
}

export interface PatternState {
  customPatterns: CustomPattern[];
  actions: {
    /** 새 커스텀 패턴 추가하고 id 리턴 */
    addPattern: (
      p: Omit<CustomPattern, "id" | "createdAt" | "updatedAt">,
    ) => string;

    removeCustomPattern: (id: string) => void;

    updateCustomPattern: (
      id: string,
      patch: Partial<Omit<CustomPattern, "id">>,
    ) => void;

    clearCustomPatterns: () => void;
  };
}

function genCustomId() {
  return `custom_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export const usePatternStore = create<PatternState>()(
  immer(
    persist(
      (set, get) => ({
        customPatterns: [],
        actions: {
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
        }),
      },
    ),
  ),
);

export const usePatternActions = () => usePatternStore(s => s.actions);
