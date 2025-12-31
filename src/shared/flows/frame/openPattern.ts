// src/shared/flows/frame/openPattern.ts
"use client";

import { useFrameLayoutStore } from "@/shared/store/editor/frameLayout/store";
import type {
  FrameNode,
  FrameNodes,
  FrameRegion,
} from "@/shared/store/editor/frameLayout/types";
import { FRAME_PATTERNS } from "@/shared/store/framePatterns/default";
import { useFramePatternStore } from "@/shared/store/framePatterns/store";

/** 프레임 기본값(필요하면 너 프로젝트 기본값으로 바꿔도 됨) */
const DEFAULT_FRAME_W = 1440;
const DEFAULT_FRAME_H = 900;

const DEFAULT_HEADER_H = 56;
const DEFAULT_SIDER_W = 240;
const DEFAULT_MDI_H = 40;

function node(
  type: FrameRegion,
  x: number,
  y: number,
  width: number,
  height: number,
  z: number,
  title: string,
): FrameNode {
  return {
    id: type,
    type,
    x,
    y,
    width: Math.max(0, width),
    height: Math.max(0, height),
    z,
    lock: false,
    title,
    bg: "#ffffff",
    color: "#111827",
  };
}

/**
 * built-in frame pattern id -> FrameNodes 생성
 * - 지금은 최소 세트(f1-1/f1-2/f1-3/fx-1)만 지원
 * - hide는 width/height=0으로 표현(너 store에서 0 허용 안 하면 최소값으로 clamp될 수 있음)
 */
function createNodesForPattern(
  patternId: string,
  frameW: number,
  frameH: number,
): FrameNodes {
  const hideHeader = patternId === "f1-3";
  const hideSider = patternId === "f1-2";
  const hideMdi = patternId === "f1-2" || patternId === "f1-3";

  const headerH = hideHeader ? 0 : DEFAULT_HEADER_H;
  const siderW = hideSider ? 0 : DEFAULT_SIDER_W;
  const mdiH = hideMdi ? 0 : DEFAULT_MDI_H;

  const header = node("header", 0, 0, frameW, headerH, 3, "Header");
  const sider = node("sider", 0, headerH, siderW, frameH - headerH, 2, "Sider");
  const mdi = node("mdi", siderW, headerH, frameW - siderW, mdiH, 1, "MDI");
  const content = node(
    "content",
    siderW,
    headerH + mdiH,
    frameW - siderW,
    frameH - headerH - mdiH,
    0,
    "Content",
  );

  return { header, sider, mdi, content };
}

/**
 * frame 전용 패턴 열기
 * - frameLayout(nodes/frameSize)을 세팅해줘야 프레임 캔버스에 보임
 */
export function openPattern(originPatternId: string | null) {
  const frame = useFrameLayoutStore.getState();
  const framePattern = useFramePatternStore.getState();

  // 1) 초기화
  frame.actions.setReset();

  // 2) blank 분기 (지금은 reset 상태(기본 프레임) 그대로 사용)
  if (!originPatternId || originPatternId === "blank") {
    framePattern.actions.setMeta({
      title: "",
      description: "",
      patternId: null,
      originPatternId: null,
    });
    return;
  }

  // 3) custom 패턴이면 nodes 스냅샷 적용
  const custom = framePattern.customPatterns.find(
    p => p.id === originPatternId,
  );
  if (custom?.nodes) {
    const w = custom.frameWidth ?? frame.frameWidth ?? DEFAULT_FRAME_W;
    const h = custom.frameHeight ?? frame.frameHeight ?? DEFAULT_FRAME_H;

    frame.actions.setFrameSize(w, h);
    frame.actions.setNodes(custom.nodes);

    framePattern.actions.setMeta({
      title: custom.title,
      description: custom.description ?? "",
      patternId: custom.id,
      originPatternId: custom.originPatternId ?? null,
    });
    return;
  }

  // 4) built-in이면 id 기반으로 nodes 생성
  const builtIn = FRAME_PATTERNS.find(p => p.id === originPatternId);

  const w = frame.frameWidth ?? DEFAULT_FRAME_W;
  const h = frame.frameHeight ?? DEFAULT_FRAME_H;

  frame.actions.setFrameSize(w, h);
  frame.actions.setNodes(createNodesForPattern(originPatternId, w, h));

  framePattern.actions.setMeta({
    title: builtIn?.title ?? "",
    description: builtIn?.description ?? "",
    patternId: null,
    originPatternId,
  });
}
