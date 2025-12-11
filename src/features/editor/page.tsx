// src/features/editor/page.tsx
"use client";

import { useEffect } from "react";

import { createSectionsForPattern } from "@/shared/store/layout/defaults";
import { useLayoutActions } from "@/shared/store/layout/store";
import type { Section } from "@/shared/store/layout/types";

import EditorShell from "./components/EditorShell";

type EditorFeaturePageProps = {
  routeId: string; // /editor/[id] 의 id 값
  id: string; // /editor/new?patternId=... 에서 넘어오는 값
  originPatternId?: string;
};

export default function Page({
  routeId,
  id,
  originPatternId,
}: EditorFeaturePageProps) {
  const { setSections, setReset } = useLayoutActions();

  useEffect(() => {
    // 매번 화면 들어올 때 초기화
    setReset();

    if (routeId === "new") {
      // 새 화면: patternId 기반으로 레이아웃 생성
      const pid = originPatternId ?? "blank";
      const sections = createSectionsForPattern(pid);
      setSections(sections);
    } else {
      // 기존 화면: id 기반으로 저장된 레이아웃 불러오기 (TODO)
      // 예시:
      // fetch(`/api/editor/${id}`)
      //   .then(res => res.json())
      //   .then(data => setSections(data.sections));
    }
  }, [routeId, originPatternId, setReset, setSections]);

  return <EditorShell />;
}
