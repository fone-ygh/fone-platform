// src/features/editor/components/canvas/sectionItems/SearchSectionItem.tsx
"use client";

import React from "react";
import { Box } from "fone-design-system_v1";

import type { SearchSection } from "@/shared/store"; // 또는 정확한 경로

type Props = {
  item: SearchSection;
};

export default function SearchSectionItem({ item }: Props) {
  return (
    <Box
      style={{
        padding: 8,
        width: "100%",
        textAlign: "center",
        borderRadius: item.radius || "unset",
      }}
    ></Box>
  );
}
