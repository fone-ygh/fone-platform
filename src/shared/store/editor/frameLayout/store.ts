// src/shared/store/frameLayout/store.ts
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

import {
  applyZChange,
  clampNodesToFrame,
  clampNodeToFrame,
  createDefaultNodes,
  DEFAULT_FRAME_HEIGHT,
  DEFAULT_FRAME_WIDTH,
  maxZ,
  normalizeZ,
} from "./defaults";
import type { FrameLayoutState } from "./types";

export const useFrameLayoutStore = create<FrameLayoutState>()(
  immer(
    persist(
      (set, get) => ({
        frameWidth: DEFAULT_FRAME_WIDTH,
        frameHeight: DEFAULT_FRAME_HEIGHT,

        nodes: normalizeZ(
          createDefaultNodes(DEFAULT_FRAME_WIDTH, DEFAULT_FRAME_HEIGHT),
        ),
        selectedIds: [],
        version: 0,

        actions: {
          /* ---------------- Frame Size ---------------- */
          setFrameSize: (w, h) =>
            set(s => {
              s.frameWidth = Math.max(320, Math.round(w));
              s.frameHeight = Math.max(480, Math.round(h));
              s.nodes = clampNodesToFrame(s.nodes, s.frameWidth, s.frameHeight);
            }),

          /* ---------------- Selection ---------------- */
          setSelectedIds: ids =>
            set(s => {
              s.selectedIds = [...ids];
            }),

          /* ---------------- Nodes set ---------------- */
          setNodes: next =>
            set(s => {
              s.nodes = normalizeZ(
                clampNodesToFrame(next, s.frameWidth, s.frameHeight),
              );
              s.selectedIds = [];
            }),

          /* ---------------- CRUD ---------------- */
          setPatchNode: (id, patch) =>
            set(s => {
              const cur = s.nodes[id];
              const merged = { ...cur, ...patch };
              s.nodes[id] = clampNodeToFrame(
                merged,
                s.frameWidth,
                s.frameHeight,
              );
            }),

          setUpdateFrame: (id, patch) =>
            set(s => {
              const cur = s.nodes[id];
              const merged = {
                ...cur,
                x: patch.x ?? cur.x,
                y: patch.y ?? cur.y,
                width: patch.width ?? cur.width,
                height: patch.height ?? cur.height,
                rotate: patch.rotate ?? cur.rotate,
              };
              s.nodes[id] = clampNodeToFrame(
                merged,
                s.frameWidth,
                s.frameHeight,
              );
            }),

          /* ---------------- Z-Order ---------------- */
          setSendToFront: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              const top = maxZ(s.nodes);
              const next = { ...s.nodes };
              s.selectedIds.forEach(id => {
                next[id] = { ...next[id], z: top + 1 };
              });
              s.nodes = normalizeZ(next);
            }),

          setSendToBack: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              const next = { ...s.nodes };
              s.selectedIds.forEach(id => {
                next[id] = { ...next[id], z: -1 };
              });
              s.nodes = normalizeZ(next);
            }),

          setBringForward: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              s.nodes = applyZChange(s.nodes, s.selectedIds, z => z + 1);
            }),

          setSendBackward: () =>
            set(s => {
              if (!s.selectedIds.length) return;
              s.nodes = applyZChange(s.nodes, s.selectedIds, z => z - 1);
            }),

          /* ---------------- Appearance ---------------- */
          setApplyColorToSelection: (color, target) =>
            set(s => {
              if (!s.selectedIds.length) return;
              s.selectedIds.forEach(id => {
                const cur = s.nodes[id];
                if (target === "bg") s.nodes[id] = { ...cur, bg: color };
                if (target === "text") s.nodes[id] = { ...cur, color };
              });
            }),

          /* ---------------- Lock ---------------- */
          setLock: (id, lock) =>
            set(s => {
              s.nodes[id] = { ...s.nodes[id], lock };
            }),

          /* ---------------- Commit ---------------- */
          setCommitAfterTransform: () =>
            set(s => {
              s.version += 1;
            }),

          /* ---------------- Reset ---------------- */
          setResetLayout: () =>
            set(s => {
              s.nodes = normalizeZ(
                createDefaultNodes(s.frameWidth, s.frameHeight),
              );
              s.selectedIds = [];
              s.version += 1;
            }),

          setReset: () =>
            set(s => {
              s.frameWidth = DEFAULT_FRAME_WIDTH;
              s.frameHeight = DEFAULT_FRAME_HEIGHT;
              s.nodes = normalizeZ(
                createDefaultNodes(DEFAULT_FRAME_WIDTH, DEFAULT_FRAME_HEIGHT),
              );
              s.selectedIds = [];
              s.version = 0;
            }),
        },
      }),
      {
        name: "FRAME_LAYOUT",
        partialize: state => ({
          frameWidth: state.frameWidth,
          frameHeight: state.frameHeight,
          nodes: state.nodes,
        }),
      },
    ),
  ),
);

export const useFrameLayoutActions = () => useFrameLayoutStore(s => s.actions);
