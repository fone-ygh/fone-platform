// src/shared/store/frameLayout/defaults.ts
import type { FrameNode, FrameNodes, FrameRegion } from "./types";

export const DEFAULT_FRAME_WIDTH = 1440;
export const DEFAULT_FRAME_HEIGHT = 900;

export const DEFAULT_HEADER_H = 56;
export const DEFAULT_SIDER_W = 240;
export const DEFAULT_MDI_H = 40;

export const MIN_NODE_W = 60;
export const MIN_NODE_H = 40;

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function clampNodeToFrame(
  node: FrameNode,
  frameW: number,
  frameH: number,
): FrameNode {
  const w = clamp(node.width, MIN_NODE_W, Math.max(MIN_NODE_W, frameW));
  const h = clamp(node.height, MIN_NODE_H, Math.max(MIN_NODE_H, frameH));

  const x = clamp(node.x, 0, Math.max(0, frameW - w));
  const y = clamp(node.y, 0, Math.max(0, frameH - h));

  return { ...node, x, y, width: w, height: h };
}

export function clampNodesToFrame(
  nodes: FrameNodes,
  frameW: number,
  frameH: number,
): FrameNodes {
  return {
    header: clampNodeToFrame(nodes.header, frameW, frameH),
    sider: clampNodeToFrame(nodes.sider, frameW, frameH),
    mdi: clampNodeToFrame(nodes.mdi, frameW, frameH),
    content: clampNodeToFrame(nodes.content, frameW, frameH),
  };
}

/**
 * 추천2의 기본 배치(초기값):
 * - header: 상단
 * - sider: 좌측
 * - mdi: content 상단바(가정)
 * - content: 나머지
 *
 * 이후엔 유저가 자유롭게 이동/리사이즈 가능.
 */
export function createDefaultNodes(frameW: number, frameH: number): FrameNodes {
  const headerH = clamp(DEFAULT_HEADER_H, MIN_NODE_H, frameH);
  const siderW = clamp(DEFAULT_SIDER_W, MIN_NODE_W, frameW);
  const mdiH = clamp(DEFAULT_MDI_H, 0, frameH);

  const header: FrameNode = {
    id: "header",
    type: "header",
    x: 0,
    y: 0,
    width: frameW,
    height: headerH,
    z: 3,
    lock: false,
    title: "Header",
    bg: "#ffffff",
    color: "#111827",
  };

  const sider: FrameNode = {
    id: "sider",
    type: "sider",
    x: 0,
    y: headerH,
    width: siderW,
    height: Math.max(MIN_NODE_H, frameH - headerH),
    z: 1,
    lock: false,
    title: "Sider",
    bg: "#ffffff",
    color: "#111827",
  };

  const mdi: FrameNode = {
    id: "mdi",
    type: "mdi",
    x: siderW,
    y: headerH,
    width: Math.max(MIN_NODE_W, frameW - siderW),
    height: mdiH,
    z: 2,
    lock: false,
    title: "MDI",
    bg: "#ffffff",
    color: "#111827",
  };

  const content: FrameNode = {
    id: "content",
    type: "content",
    x: siderW,
    y: headerH + mdiH,
    width: Math.max(MIN_NODE_W, frameW - siderW),
    height: Math.max(MIN_NODE_H, frameH - headerH - mdiH),
    z: 0,
    lock: false,
    title: "Content",
    bg: "#ffffff",
    color: "#111827",
  };

  return clampNodesToFrame({ header, sider, mdi, content }, frameW, frameH);
}

/** z 정규화(0..n-1) */
export function normalizeZ(nodes: FrameNodes): FrameNodes {
  const arr = Object.values(nodes)
    .slice()
    .sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  const next: FrameNodes = { ...nodes };
  arr.forEach((n, i) => {
    next[n.id] = { ...next[n.id], z: i };
  });
  return next;
}

export function maxZ(nodes: FrameNodes): number {
  return Math.max(...Object.values(nodes).map(n => n.z ?? 0));
}

export function applyZChange(
  nodes: FrameNodes,
  selected: FrameRegion[],
  change: (z: number) => number,
): FrameNodes {
  const next: FrameNodes = { ...nodes };
  selected.forEach(id => {
    const cur = next[id];
    next[id] = { ...cur, z: change(cur.z ?? 0) };
  });
  return normalizeZ(next);
}
