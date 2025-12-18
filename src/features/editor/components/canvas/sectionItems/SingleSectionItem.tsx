// src/features/editor/components/canvas/sectionItems/SingleSectionItem.tsx
"use client";

import React from "react";

import type { SingleSection } from "@/shared/store";

type Props = {
  item: SingleSection;
};

export default function SingleSectionItem({ item }: Props) {
  return (
    <div
      style={{
        padding: 8,
        width: "100%",
        lineHeight: 1.4,
      }}
    >
      {/* Single 영역 내용 */}
    </div>
  );
}
