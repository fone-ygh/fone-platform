// src/shared/store/control/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import { EDITOR_MODE, EditorMode } from "./editorMode";
import type { EditorStore } from "./types";

const clampZoom = (z: number) => Math.min(200, Math.max(25, Math.round(z)));

export const useEDITORStore = create<EditorStore>()(
  immer(
    persist(
      set => ({
        canvasWidth: 1920,
        canvasHeight: 2000,

        zoom: 0,
        canvasZoom: 60,

        panX: 50,
        panY: 100,

        showGrid: true,
        gridSize: 16,
        gridColor: "#e2e8f0",

        snapToGrid: true,
        snapToGuides: true,
        snapToElements: true,
        snapTolerance: 6,

        showRulers: false,
        showGuides: true,

        editorMode: EDITOR_MODE.idle(),

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
              s.zoom = clampZoom(value);
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

          setEditorMode: mode =>
            set(s => {
              s.editorMode = mode;
            }),
          resetEditorMode: () =>
            set(s => {
              s.editorMode = EDITOR_MODE.idle();
            }),
        },
      }),
      {
        name: "EDITOR",
        partialize: () => ({}),
      },
    ),
  ),
);

export const useEDITORActions = () => useEDITORStore(s => s.actions);
