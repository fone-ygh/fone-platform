// src/features/screens/page/ScreensHeader.tsx
"use client";

import * as React from "react";
import { Box, Button, Typography } from "@mui/material";

type Props = {
  title: string;
  onClickNew: () => void;
};

export default function ScreensHeader({ title, onClickNew }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>

      <Button variant="contained" size="small" onClick={onClickNew}>
        + 새 Screen
      </Button>
    </Box>
  );
}
