// src/stores/useEDITORStore.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util"; // ← 앞서 'typeof _persist' 버전 래퍼

const clampZoom = (z: number) => Math.min(200, Math.max(25, Math.round(z)));

/* ============== Types ============== */
export type EditorStore = {
  canvasWidth: number;
  canvasHeight: number;

  zoom: number;
  canvasZoom: number;

  showGrid: boolean;
  gridSize: number;
  gridColor: string;

  snapToGrid: boolean;
  snapToGuides: boolean;
  snapToElements: boolean;
  snapTolerance: number;

  showRulers: boolean;
  showGuides: boolean;

  actions: {
    setCanvasWidth: (w: number) => void;
    setCanvasHeight: (h: number) => void;

    setZoom: (ext: number | ((prev: number) => number)) => void;
    setCanvasZoom: (next: number | ((prev: number) => number)) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    zoomReset: () => void;

    setShowGrid: (show: boolean) => void;
    setGridSize: (size: number) => void;
    setGridColor: (color: string) => void;

    setSnapToGrid: (snap: boolean) => void;
    setSnapToGuides: (snap: boolean) => void;
    setSnapToElements: (snap: boolean) => void;
    setSnapTolerance: (tol: number) => void;

    setShowRulers: (show: boolean) => void;
    setShowGuides: (show: boolean) => void;
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
        canvasZoom: 100,

        showGrid: true,
        gridSize: 16,
        gridColor: "#e2e8f0",

        snapToGrid: true,
        snapToGuides: true,
        snapToElements: false,
        snapTolerance: 6,

        showRulers: false,
        showGuides: true,

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
              s.zoom = Math.min(200, Math.max(25, Math.round(value)));
            }),
          setCanvasZoom: next =>
            set(s => {
              const value =
                typeof next === "function" ? next(s.canvasZoom) : next;
              s.canvasZoom = clampZoom(value);
            }),
          zoomIn: () =>
            set(s => {
              s.canvasZoom = clampZoom(s.canvasZoom + 10);
            }),
          zoomOut: () =>
            set(s => {
              s.canvasZoom = clampZoom(s.canvasZoom - 10);
            }),
          zoomReset: () =>
            set(s => {
              s.canvasZoom = 100;
            }),

          setShowGrid: show =>
            set(s => {
              s.showGrid = show;
            }),
          setGridSize: size =>
            set(s => {
              s.gridSize = size;
            }),
          setGridColor: color =>
            set(s => {
              s.gridColor = color;
            }),

          setSnapToGrid: snap =>
            set(s => {
              s.snapToGrid = snap;
            }),
          setSnapToGuides: snap =>
            set(s => {
              s.snapToGuides = snap;
            }),
          setSnapToElements: snap =>
            set(s => {
              s.snapToElements = snap;
            }),
          setSnapTolerance: tol =>
            set(s => {
              s.snapTolerance = tol;
            }),

          setShowRulers: show =>
            set(s => {
              s.showRulers = show;
            }),
          setShowGuides: show =>
            set(s => {
              s.showGuides = show;
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
