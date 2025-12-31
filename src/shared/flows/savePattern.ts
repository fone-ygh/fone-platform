// src/shared/flows/savePattern.ts

import { useContentLayoutStore, usePatternStore } from "../store";
import type { CustomPattern } from "../store";

type SavePatternOptions = {
  /** 새 패턴 저장이면 true (id 새로 발급) */
  createNew?: boolean;

  /** 새로 만들 때 기본 title/description */
  title?: string;
  description?: string;
};

/**
 * Layout(현재 편집 중) -> Pattern(저장 모델)로 복사
 * - patternId가 있으면 업데이트, 없으면 새로 생성
 * - 반환값 : 저장된 patternId
 */
export function savePattern(
  patternId?: string | null,
  options: SavePatternOptions = {},
) {}
