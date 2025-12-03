// src/features/editor/page.tsx
"use client";

import { useEffect } from "react";

import { createSectionsForPattern } from "@/shared/store/layout/defaults";
import { useLayoutActions } from "@/shared/store/layout/store";
import type { Section } from "@/shared/store/layout/types";

import EditorShell from "./components/EditorShell";

type EditorFeaturePageProps = {
  id: string; // /editor/[id] 의 id 값
  patternId?: string; // /editor/new?patternId=... 에서 넘어오는 값
};

export default function Page({ id, patternId }: EditorFeaturePageProps) {
  const { reset, setSections } = useLayoutActions() as unknown as {
    reset: () => void;
    setSections: (sections: Section[]) => void;
  };

  useEffect(() => {
    console.log("id : ", id);
    console.log("patternId : ", patternId);
    // 매번 화면 들어올 때 초기화
    // reset();

    if (id === "new") {
      // 🔥 새 화면: patternId 기반으로 레이아웃 생성
      const pid = patternId ?? "blank";
      const sections = createSectionsForPattern(pid);
      setSections(sections);
    } else {
      // 🔥 기존 화면: id 기반으로 저장된 레이아웃 불러오기 (TODO)
      // 예시:
      // fetch(`/api/editor/${id}`)
      //   .then(res => res.json())
      //   .then(data => setSections(data.sections));
    }
  }, [id, patternId, reset, setSections]);

  return <EditorShell />;
}
