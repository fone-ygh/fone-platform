"use client";

import * as React from "react";

import { openPattern } from "@/shared/flows/openPattern";

import { EditorShell } from "../components";

type Props = { originPatternId: string | null };

export default function NewScreenClient({ originPatternId }: Props) {
  React.useEffect(() => {
    const pid =
      originPatternId === "null" || originPatternId === "blank"
        ? null
        : originPatternId;

    openPattern(pid);
  }, [originPatternId]);

  return <EditorShell />;
}
