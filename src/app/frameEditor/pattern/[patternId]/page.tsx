// src/app/editor/pattern/[patternId]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import EditorShell from "@/features/frameEditor/components/EditorShell";
import { openPattern } from "@/shared/flows/frame/openPattern";

export default function Page() {
  const params = useParams();
  const patternId = String((params as any)?.patternId ?? ""); // custom pattern id

  React.useEffect(() => {
    if (!patternId) return;
    openPattern(patternId);
  }, [patternId]);

  return <EditorShell />;
}
