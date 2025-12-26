// src/features/editor/components/canvas/sectionItems/SearchSectionItem.tsx
"use client";

import { Box } from "fone-design-system_v1";

import type { SearchSection } from "@/shared/store";

type Props = {
  item: SearchSection;
};

export default function SearchSectionItem({ item }: Props) {
  return (
    <Box
      style={{
        padding: 16,
        width: "100%",
        height: "100%",
        borderRadius: item.radius || "unset",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      ></Box>
    </Box>
  );
}
