// src/features/patterns/components/PatternList.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Grid,
  Grid2,
  TextField,
  Typography,
} from "@mui/material";

import { SCREEN_PATTERNS } from "../patterns";
import type { ScreenDefinition } from "../types";
import PatternCard from "./PatternCard";

// 일단은 mock 데이터라고 가정
// const MOCK_SCREENS: ScreenDefinition[] = [
//   // { id, name, description, layout: Section[] } 형태
// ];

export default function PatternList() {
  const router = useRouter();

  const handleOpenScreen = (screen: ScreenDefinition) => {
    router.push(`/editor/new?patternId=${screen.id}`); // 혹은 /editor/new?patternId=... 대신 실제 screen id
  };

  const handleCreateBlank = () => {
    router.push("/editor/new?patternId=blank");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* 헤더 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              화면 목록
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              패턴으로 만들었거나 수정한 레이아웃을 한 눈에 확인할 수 있어요.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: { sm: "center" },
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateBlank}
            >
              새로 만들기
            </Button>
          </Box>
        </Box>

        {/* 카드 그리드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2%",
          }}
        >
          {SCREEN_PATTERNS.map(screen => (
            <Grid2 key={screen.id}>
              <PatternCard pattern={screen} onSelect={handleOpenScreen} />
            </Grid2>
          ))}

          {SCREEN_PATTERNS.length === 0 && (
            <Grid2>
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  검색 결과에 해당하는 화면이 없습니다.
                </Typography>
              </Box>
            </Grid2>
          )}
        </div>
      </Container>
    </Box>
  );
}
