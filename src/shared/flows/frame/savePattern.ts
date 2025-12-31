// src/shared/flows/frame/savePattern.ts
"use client";

import { useFrameLayoutStore, useFramePatternStore } from "@/shared/store";

type SavePatternOptions = {
  /** 새 패턴 저장이면 true (id 새로 발급) */
  createNew?: boolean;

  /** 새로 만들 때 기본 title/description */
  title?: string;
  description?: string;
};

/**
 * frameLayout(현재 편집 중) -> framePattern(저장 모델)로 스냅샷 저장
 * - patternId가 custom이면 업데이트
 * - built-in이거나 없으면 새로 생성
 * - 반환값: 저장된 custom patternId
 */
export function savePattern(
  patternId?: string | null,
  options: SavePatternOptions = {},
) {
  const frame = useFrameLayoutStore.getState();
  const framePattern = useFramePatternStore.getState();

  const meta = framePattern.meta;

  const title = options.title ?? meta.title ?? "Untitled Frame Pattern";
  const description = options.description ?? meta.description ?? "";

  const base = {
    title,
    description,
    originPatternId: meta.originPatternId ?? null,

    frameWidth: frame.frameWidth,
    frameHeight: frame.frameHeight,
    nodes: frame.nodes,
  };

  const exists =
    !!patternId && framePattern.customPatterns.some(p => p.id === patternId);

  // createNew 옵션이거나, patternId가 없거나, 존재하지 않으면 새로 생성
  if (options.createNew || !patternId || !exists) {
    const newId = framePattern.actions.addPattern(base);
    return newId;
  }

  // 기존 custom 업데이트
  framePattern.actions.updateCustomPattern(patternId, base);

  // meta도 동기화(프레임 편집기 상단/저장 상태 등에 쓰기 좋음)
  framePattern.actions.setMeta({
    title,
    description,
    patternId,
    originPatternId: base.originPatternId ?? null,
  });

  return patternId;
}
