// src/features/editor/components/canvas/sectionItems/SearchSectionItem.tsx
"use client";

import React from "react";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Box as MuiBox } from "@mui/material";
import { Box, Label, TextField2 } from "fone-design-system_v1";

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
      {/* ✅ 좌(필드들) / 우(버튼들) 양쪽 끝 정렬 */}
      <MuiBox
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* ✅ 왼쪽: 라벨+인풋들 */}
        <MuiBox
          sx={{
            flex: 1,
            minWidth: 0,
            display: "grid",
            gridTemplateColumns:
              "auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)",
            gap: "1.2rem",
            alignItems: "center",
          }}
        >
          <Label size="medium">주문번호</Label>
          <TextField2 placeholder="주문번호" />

          <Label size="medium">고객명</Label>
          <TextField2 placeholder="예) 홍길동" />

          <Label size="medium">상태</Label>
          <TextField2 placeholder="진행중" />
        </MuiBox>

        {/* ✅ 오른쪽: 버튼들 (끝에 딱 붙게) */}
        <MuiBox
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "1rem",
            flexShrink: 0,
          }}
        >
          {/* 초기화 버튼 (아이콘만) */}
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            sx={{
              height: "5.6rem",
              minWidth: "5.6rem",
              width: "5.6rem",
              px: 0,
              fontSize: "1.8rem",
              fontWeight: 900,
              borderRadius: "1.2rem",
              whiteSpace: "nowrap",
              "& .MuiButton-startIcon": { m: 0 },
              "& svg": { fontSize: "2.4rem" },
            }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{
              height: "5.6rem",
              px: "2.2rem",
              fontSize: "1.8rem",
              fontWeight: 900,
              borderRadius: "1.2rem",
              whiteSpace: "nowrap",
            }}
          >
            검색
          </Button>
        </MuiBox>
      </MuiBox>
    </Box>
  );
}
