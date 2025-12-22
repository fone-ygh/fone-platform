// src/features/editor/hooks/useCurrentPatternMeta.ts
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import { SCREEN_PATTERNS } from "@/shared/store/pattern/default";
import {
  usePatternActions,
  usePatternStore,
} from "@/shared/store/pattern/store";

export function useCurrentPatternMeta() {
  const searchParams = useSearchParams();
  const urlPatternId = searchParams.get("id");
  const urlOriginPatternId = searchParams.get("originPatternId");

  const customPatterns = usePatternStore(s => s.customPatterns);
  const meta = usePatternStore(s => s.meta);
  const { setMeta } = usePatternActions();

  React.useEffect(() => {
    // 이미 메타 타이틀이 있으면 재초기화 안 함
    if (meta.title) return;

    // 1) URL의 id로 커스텀 패턴 찾기
    if (urlPatternId) {
      const found = customPatterns.find(p => p.id === urlPatternId);
      if (found) {
        setMeta({
          title: found.title,
          description: found.description ?? "",
          patternId: found.id,
          originPatternId: found.originPatternId ?? urlOriginPatternId,
        });
        return;
      }
    }

    // 2) 빌트인 패턴에서 시작한 경우
    if (urlPatternId) {
      const builtin = SCREEN_PATTERNS.find(p => p.id === urlOriginPatternId);
      setMeta({
        title: builtin?.title ?? "",
        description: builtin?.description ?? "",
        patternId: null,
        originPatternId: urlOriginPatternId,
      });
    }
  }, [
    urlPatternId,
    urlOriginPatternId,
    customPatterns,
    meta.title, // title만 보는 걸로 충분
    setMeta,
  ]);

  return {
    title: meta.title,
    description: meta.description,
    patternId: meta.patternId,
    originPatternId: meta.originPatternId ?? urlOriginPatternId ?? null,
    setTitle: (title: string) => setMeta({ title }),
    setDescription: (description: string) => setMeta({ description }),
    setMeta,
  };
}
