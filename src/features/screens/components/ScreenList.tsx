// src/features/screens/components/ScreenList.tsx
"use client";

import * as React from "react";
import { Box } from "@mui/material";

import type { Screen } from "../model/types";
import ScreenCard from "./ScreenCard";

type Props = {
  screens: Screen[];
  onOpen: (screenId: string) => void;
};

export default function ScreenList({ screens, onOpen }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {screens.map(s => (
        <ScreenCard key={s.id} screen={s} onOpen={() => onOpen(s.id)} />
      ))}
    </Box>
  );
}
