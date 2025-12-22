// src/features/screens/components/ScreenCard.tsx
"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";

import type { Screen } from "../model/types";

type Props = {
  screen: Screen;
  onOpen: () => void;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ScreenCard({ screen, onOpen }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardActionArea
        onClick={onOpen}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ display: "grid", gap: 1.2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.2 }}
            >
              {screen.title}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            수정일: {formatDate(screen.updatedAt)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            시작 패턴:{" "}
            {screen.originPatternTitle ?? screen.originPatternId ?? "-"}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
