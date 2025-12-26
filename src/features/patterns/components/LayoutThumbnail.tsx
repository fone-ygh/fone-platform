// src/features/patterns/components/LayoutThumbnail.tsx
"use client";

import * as React from "react";
import { Box } from "@mui/material";

import type { Section, SectionType } from "@/shared/store/contentLayout/types";

interface LayoutThumbnailProps {
  sections: Section[];
  width?: number;
  height?: number;
}

const KIND_BG: Record<SectionType, string> = {
  search: "primary.light",
  single: "success.light",
  grid: "warning.light",
  tab: "secondary.light",
};

export default function LayoutThumbnail({
  sections,
  width = 240,
  height = 135,
}: LayoutThumbnailProps) {
  if (!sections.length) {
    return (
      <Box
        sx={{
          width,
          height,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.disabled",
          fontSize: 11,
        }}
      >
        빈 레이아웃
      </Box>
    );
  }

  // 실제 레이아웃의 bounding box 계산
  const minX = Math.min(...sections.map(s => s.x), 0);
  const minY = Math.min(...sections.map(s => s.y), 0);
  const maxX = Math.max(...sections.map(s => s.x + s.width));
  const maxY = Math.max(...sections.map(s => s.y + s.height));

  const layoutWidth = maxX - minX || 1;
  const layoutHeight = maxY - minY || 1;

  const padding = 4;
  const scale = Math.min(
    (width - padding * 2) / layoutWidth,
    (height - padding * 2) / layoutHeight,
  );

  return (
    <Box
      sx={{
        position: "relative",
        width,
        height,
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      {/* 실제 레이아웃을 축소해서 그리기 */}
      {sections.map(section => (
        <Box
          key={section.id}
          sx={{
            position: "absolute",
            left: (section.x - minX) * scale + padding,
            top: (section.y - minY) * scale + padding,
            width: section.width * scale,
            height: section.height * scale,
            bgcolor: KIND_BG[section.type],
            borderRadius: 0.5,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        />
      ))}
    </Box>
  );
}
