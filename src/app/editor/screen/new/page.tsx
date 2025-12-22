// src/app/editor/screen/new/page.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { EditorShell } from "@/features/editor/components";
import { openPattern } from "@/shared/flows/openPattern";

export default function Page() {
  const sp = useSearchParams();
  const originPatternId = sp.get("originPatternId");

  React.useEffect(() => {
    const pid =
      originPatternId === "null" || originPatternId === "blank"
        ? null
        : originPatternId;

    openPattern(pid);
  }, [originPatternId]);
  return <EditorShell />;
}
