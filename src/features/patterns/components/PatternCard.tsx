// src/features/patterns/components/PatternCard.tsx
"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";

import { createSectionsForPattern } from "@/shared/store/layout/defaults";

import type { ScreenPattern } from "../patterns";
import LayoutThumbnail from "./LayoutThumbnail"; // Section[] 축소해서 그리는 컴포넌트

interface PatternCardProps {
  pattern: ScreenPattern;
  onSelect?: (pattern: ScreenPattern) => void;
}

export default function PatternCard({ pattern, onSelect }: PatternCardProps) {
  const handleClick = () => onSelect?.(pattern);

  const sectionsForThumb = React.useMemo(
    () => createSectionsForPattern(pattern.id),
    [pattern.id],
  );

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
            // p: 2,
          }}
        >
          <Box sx={{ mb: 1.5, display: "flex", justifyContent: "center" }}>
            <LayoutThumbnail
              sections={sectionsForThumb}
              width={220}
              height={120}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {pattern.name}
            </Typography>
            {pattern.description && (
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
