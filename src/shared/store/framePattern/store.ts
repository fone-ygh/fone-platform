// src/shared/store/editor/framePattern/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import type {
  CustomFramePattern,
  FramePatternMeta,
  FramePatternState,
} from "./types";

function genCustomId() {
  // 프레임 패턴임을 id에서 구분하기 쉽게 prefix를 분리
  return `frame_custom_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

const initialMeta: FramePatternMeta = {
  title: "",
  description: "",
  patternId: null,
  originPatternId: null,
};

export const useFramePatternStore = create<FramePatternState>()(
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

            const newPattern: CustomFramePattern = {
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
        name: "FRAME_PATTERNS",
        partialize: state => ({
          customPatterns: state.customPatterns,
          // meta는 새로고침 때 초기화돼도 되면 저장 안 해도 됨.
          // meta까지 로컬스토리지에 저장하고 싶으면 아래 라인 추가:
          // meta: state.meta,
        }),
      },
    ),
  ),
);

// actions 헬퍼
export const useFramePatternActions = () =>
  useFramePatternStore(s => s.actions);
