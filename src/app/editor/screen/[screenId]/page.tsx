// src/app/editor/screen/[screenId]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import EditorShell from "@/features/editor/components/EditorShell";
import { openScreen } from "@/shared/flows/openScreen";

export default function Page() {
  const params = useParams();
  const screenId = String((params as any)?.screenId ?? "");

  React.useEffect(() => {
    if (!screenId) return;
    openScreen(screenId);
  }, [screenId]);

  return <EditorShell />;
}
