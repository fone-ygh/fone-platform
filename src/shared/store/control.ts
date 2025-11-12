// src/shared/store/control.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

const clampZoom = (z: number) => Math.min(200, Math.max(25, Math.round(z)));

export type EditorStore = {
  canvasWidth: number;
  canvasHeight: number;

  /** (선택) 미사용 */
  zoom: number;

  /** 캔버스 전용 줌(%) */
  canvasZoom: number;

  /** 캔버스 전용 팬(px) — zoom-layer에 적용 */
  panX: number;
  panY: number;

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

    /** 팬 제어 */
    setPan: (x: number, y: number) => void;
    panBy: (dx: number, dy: number) => void;
    resetPan: () => void;

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

export const useEDITORStore = create<EditorStore>()(
  immer(
    persist(
      set => ({
        canvasWidth: 1920,
        canvasHeight: 2000,

        zoom: 0,
        canvasZoom: 100,

        panX: 0,
        panY: 0,

        showGrid: true,
        gridSize: 16,
        gridColor: "#e2e8f0",

        snapToGrid: true,
        snapToGuides: true,
        snapToElements: true,
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
              s.panX = 0;
              s.panY = 0;
            }),

          setPan: (x, y) =>
            set(s => {
              s.panX = Math.round(x);
              s.panY = Math.round(y);
            }),
          panBy: (dx, dy) =>
            set(s => {
              s.panX = Math.round(s.panX + dx);
              s.panY = Math.round(s.panY + dy);
            }),
          resetPan: () =>
            set(s => {
              s.panX = 0;
              s.panY = 0;
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
        // 함수(actions) 직렬화 이슈 회피: 현재는 스토리지에 아무 것도 저장 안 함
        partialize: () => ({}),
      },
    ),
  ),
);

export const useEDITORActions = () => useEDITORStore(s => s.actions);
