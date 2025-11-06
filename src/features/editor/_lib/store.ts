// src/stores/useEDITORStore.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util"; // ← 앞서 'typeof _persist' 버전 래퍼

/* ============== Types ============== */
export type EditorStore = {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;

  actions: {
    setCanvasWidth: (w: number) => void;
    setCanvasHeight: (h: number) => void;
    setZoom: (next: number | ((prev: number) => number)) => void;
  };
};

/* ============== Store ============== */
/**
 * 핵심: immer( persist( initializer, options ) )
 * - persist를 안쪽에 두면, persist가 기대하는 StateCreator 형태와 일치
 * - create에는 <EditorStore> 하나만 준다(커리드 형식 유지)
 */
export const useEDITORStore = create<EditorStore>()(
  immer(
    persist(
      set => ({
        canvasWidth: 1920,
        canvasHeight: 2000,
        zoom: 0,
        actions: {
          setCanvasWidth: w =>
            set(s => {
              s.canvasWidth = w;
            }),
          setCanvasHeight: h =>
            set(s => {
              s.canvasHeight = h;
            }),
          setZoom: next =>
            set(s => {
              const value = typeof next === "function" ? next(s.zoom) : next;
              // 선택: 줌을 25~200%로 보정하고 싶으면 아래 한 줄, 아니면 s.zoom = value
              s.zoom = Math.min(200, Math.max(25, Math.round(value)));
            }),
        },
      }),
      {
        name: "EDITOR",
        // 함수(actions) 직렬화 방지: 아무 것도 저장 안 함
        partialize: () => ({}),
        // 필요한 키만 저장하려면 ↓
        // partialize: (s) => ({ canvasWidth: s.canvasWidth, canvasHeight: s.canvasHeight }),
      },
    ),
  ),
);

/* helper */
export const useEDITORActions = () => useEDITORStore(s => s.actions);
