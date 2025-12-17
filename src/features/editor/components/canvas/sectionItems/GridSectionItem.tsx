// src/features/editor/components/canvas/sectionItems/GridSectionItem.tsx
"use client";

import JspreadSheet from "@/features/table/ui/JspreadSheet";
import type { GridSection } from "@/shared/store";

type Props = {
  item: GridSection;
};

export default function GridSectionItem({ item }: Props) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <JspreadSheet />
    </div>
  );
}
