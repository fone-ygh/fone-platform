// src/features/editor/components/canvas/sectionItems/GridSectionItem.tsx
"use client";

import React from "react";

import type { GridSection } from "@/shared/store";
import JspreadSheet from "@/features/table/ui/JspreadSheet";

type Props = {
  item: GridSection;
};

export default function GridSectionItem({ item }: Props) {
  return (
    <div
      style={{
        padding: 8,
        width: "100%",
        lineHeight: 1.4,
      }}
    >
      {/* Grid 영역 내용 */}
      <JspreadSheet />
    </div>
  );
}
