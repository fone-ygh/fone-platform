// src/features/screens/components/EmptyState.tsx
"use client";

import * as React from "react";
import { Box, Button, Typography } from "@mui/material";

type Props = {
  title: string;
  description?: string;
  onClickNew: () => void;
};

export default function EmptyState({ title, description, onClickNew }: Props) {
  return (
    <Box
      sx={{
        mt: 2,
        py: 6,
        px: 3,
        borderRadius: 2,
        border: "1px dashed rgba(148,163,184,0.6)",
        bgcolor: "rgba(148,163,184,0.04)",
        textAlign: "center",
        display: "grid",
        gap: 1,
      }}
    >
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
        <Button variant="contained" size="small" onClick={onClickNew}>
          + 새 Screen
        </Button>
      </Box>
    </Box>
  );
}
