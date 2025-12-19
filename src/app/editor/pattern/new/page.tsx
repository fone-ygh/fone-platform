// src/app/editor/pattern/new/page.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import EditorShell from "@/features/editor/components/EditorShell";
import { openPattern } from "@/shared/flows/openPattern";

export default function Page() {
  const sp = useSearchParams();
  const originPatternId = sp.get("originPatternId"); // string | null (built-in id, custom_xxx, null)

  React.useEffect(() => {
    // originPatternId가 "null" 문자열로 올 수도 있어서 normalize
    const pid =
      originPatternId === "null" || originPatternId === "blank"
        ? null
        : originPatternId;

    openPattern(pid);
  }, [originPatternId]);

  return <EditorShell />;
}
