// src/features/framePatterns/components/LayoutThumbnail.tsx
"use client";

import * as React from "react";
import { Box } from "@mui/material";

export type FrameThumbRegion = "header" | "sider" | "mdi" | "content";

export type FrameThumbNode = {
  id: string;
  type: FrameThumbRegion;
  x: number;
  y: number;
  width: number;
  height: number;
  z?: number;
};

interface LayoutThumbnailProps {
  nodes: FrameThumbNode[];
  width?: number;
  height?: number;
}

const KIND_BG: Record<FrameThumbRegion, string> = {
  header: "primary.light",
  sider: "secondary.light",
  mdi: "warning.light",
  content: "success.light",
};

export default function LayoutThumbnail({
  nodes,
  width = 240,
  height = 135,
}: LayoutThumbnailProps) {
  const valid = React.useMemo(
    () => nodes.filter(n => n.width > 0 && n.height > 0),
    [nodes],
  );

  if (!valid.length) {
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
        빈 프레임
      </Box>
    );
  }

  // bounding box 계산
  const minX = Math.min(...valid.map(n => n.x), 0);
  const minY = Math.min(...valid.map(n => n.y), 0);
  const maxX = Math.max(...valid.map(n => n.x + n.width));
  const maxY = Math.max(...valid.map(n => n.y + n.height));

  const layoutWidth = maxX - minX || 1;
  const layoutHeight = maxY - minY || 1;

  const padding = 4;
  const scale = Math.min(
    (width - padding * 2) / layoutWidth,
    (height - padding * 2) / layoutHeight,
  );

  // z순 정렬(겹칠 때 보기 좋게)
  const sorted = valid.slice().sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

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
      {sorted.map(n => (
        <Box
          key={n.id}
          sx={{
            position: "absolute",
            left: (n.x - minX) * scale + padding,
            top: (n.y - minY) * scale + padding,
            width: n.width * scale,
            height: n.height * scale,
            bgcolor: KIND_BG[n.type],
            borderRadius: 0.5,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        />
      ))}
    </Box>
  );
}
