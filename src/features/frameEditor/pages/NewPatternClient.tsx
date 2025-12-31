"use client";

import * as React from "react";

import { openPattern } from "@/shared/flows/frame/openPattern";

import { EditorShell } from "../components";

type Props = { originPatternId: string | null };

export default function NewPatternClient({ originPatternId }: Props) {
  console.log("originPatternId : ", originPatternId);
  React.useEffect(() => {
    const pid =
      originPatternId === "null" || originPatternId === "blank"
        ? null
        : originPatternId;

    openPattern(pid);
  }, [originPatternId]);

  return <EditorShell />;
}
