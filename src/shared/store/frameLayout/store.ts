// src/shared/store/frame/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import {
  clampFrameInputs,
  DEFAULT_FRAME_SIZES,
  deriveFrameSizes,
} from "./defaults";
import type { FrameState } from "./types";

export const useFrameStore = create<FrameState>()(
  immer(
    persist(
      (set, get) => ({
        sizes: DEFAULT_FRAME_SIZES,

        actions: {
          setSize: (region, size) =>
            set(s => {
              s.sizes = clampFrameInputs({
                ...s.sizes,
                [region]: size,
              });
            }),

          patchSize: (region, patch) =>
            set(s => {
              s.sizes = clampFrameInputs({
                ...s.sizes,
                [region]: { ...s.sizes[region], ...patch },
              });
            }),

          setWidth: (region, width) =>
            set(s => {
              s.sizes = clampFrameInputs({
                ...s.sizes,
                [region]: { ...s.sizes[region], width },
              });
            }),

          setHeight: (region, height) =>
            set(s => {
              s.sizes = clampFrameInputs({
                ...s.sizes,
                [region]: { ...s.sizes[region], height },
              });
            }),

          setSizes: next =>
            set(s => {
              s.sizes = clampFrameInputs(next);
            }),

          syncDerivedSizes: viewport =>
            set(s => {
              s.sizes = deriveFrameSizes(viewport, s.sizes);
            }),

          reset: () =>
            set(s => {
              s.sizes = DEFAULT_FRAME_SIZES;
            }),
        },
      }),
      {
        name: "FRAME",

        // ✅ “입력값만” 저장 (derived는 저장 X)
        partialize: state => ({
          sizes: {
            header: { width: 0, height: state.sizes.header.height },
            leftNav: { width: state.sizes.nav.width, height: 0 },
            mdi: { width: 0, height: state.sizes.mdi.height },
            content: { width: 0, height: 0 },
          },
        }),
      },
    ),
  ),
);

// Layout 스토어와 동일한 헬퍼 훅 제공
export const useFrameActions = () => useFrameStore(s => s.actions);
