// src/features/framePatterns/components/PatternCard.tsx
"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";

import type {
  CustomFramePattern,
  FramePattern,
} from "@/shared/store/framePatterns/types";

import LayoutThumbnail, { type FrameThumbNode } from "./LayoutThumbnail";

type PatternLike = FramePattern | CustomFramePattern;

interface PatternCardProps {
  pattern: PatternLike;
  onSelect?: (patternId: string) => void;
}

function createBuiltinThumbNodes(patternId: string): FrameThumbNode[] {
  // 썸네일용 기준 프레임 크기(대략적인 상대 배치만 보여주면 됨)
  const W = 1440;
  const H = 900;

  const headerH = 56;
  const siderW = 240;
  const mdiH = 40;

  switch (patternId) {
    case "f1-2": {
      // Header + Content
      return [
        {
          id: "header",
          type: "header",
          x: 0,
          y: 0,
          width: W,
          height: headerH,
          z: 2,
        },
        {
          id: "content",
          type: "content",
          x: 0,
          y: headerH,
          width: W,
          height: H - headerH,
          z: 0,
        },
      ];
    }

    case "f1-3": {
      // Sider + Content
      return [
        {
          id: "sider",
          type: "sider",
          x: 0,
          y: 0,
          width: siderW,
          height: H,
          z: 1,
        },
        {
          id: "content",
          type: "content",
          x: siderW,
          y: 0,
          width: W - siderW,
          height: H,
          z: 0,
        },
      ];
    }

    case "fx-1":
    case "f1-1":
    default: {
      // Header + Sider + MDI + Content
      return [
        {
          id: "header",
          type: "header",
          x: 0,
          y: 0,
          width: W,
          height: headerH,
          z: 3,
        },
        {
          id: "sider",
          type: "sider",
          x: 0,
          y: headerH,
          width: siderW,
          height: H - headerH,
          z: 2,
        },
        {
          id: "mdi",
          type: "mdi",
          x: siderW,
          y: headerH,
          width: W - siderW,
          height: mdiH,
          z: 1,
        },
        {
          id: "content",
          type: "content",
          x: siderW,
          y: headerH + mdiH,
          width: W - siderW,
          height: H - headerH - mdiH,
          z: 0,
        },
      ];
    }
  }
}

export default function PatternCard({ pattern, onSelect }: PatternCardProps) {
  const handleClick = () => onSelect?.(pattern.id);

  const nodesForThumb = React.useMemo<FrameThumbNode[]>(() => {
    // 커스텀 패턴이면 nodes가 있을 수 있음
    if ("nodes" in pattern && pattern.nodes) {
      return Object.values(pattern.nodes).map(n => ({
        id: n.id,
        type: n.type,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        z: n.z,
      }));
    }

    // 빌트인(메타만 있는 경우) -> id로 썸네일 기본 레이아웃 생성
    return createBuiltinThumbNodes(pattern.id);
  }, [pattern]);

  return (
    <Card
      variant="outlined"
      sx={{ height: 220, display: "flex", flexDirection: "column" }}
    >
      <CardActionArea onClick={handleClick} sx={{ height: "100%" }}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ mb: 1.5, display: "flex", justifyContent: "center" }}>
            <LayoutThumbnail nodes={nodesForThumb} width={220} height={120} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {pattern.title}
            </Typography>

            {"description" in pattern && pattern.description && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  color: "text.secondary",
                }}
              >
                {pattern.description}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
