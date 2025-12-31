// src/features/editor/page.tsx
"use client";

import { useEffect } from "react";

import { openPattern } from "@/shared/flows/openPattern";
import { createSectionsForPattern } from "@/shared/store/editor/contentLayout/defaults";
import { useContentLayoutActions } from "@/shared/store/editor/contentLayout/store";

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
  const { setSections, setReset } = useContentLayoutActions();

  useEffect(() => {
    if (routeId === "new") {
      // 새 화면: patternId 기반으로 레이아웃 생성
      const pid = originPatternId ?? "blank";
      openPattern(pid);
    } else {
      // 기존 화면: id 기반으로 저장된 레이아웃 불러오기 (TODO)
      // 예시:
      // fetch(`/api/editor/${id}`)
      //   .then(res => res.json())
      //   .then(data => setSections(data.sections));
    }
  }, [routeId, originPatternId]);

  return <EditorShell />;
}
