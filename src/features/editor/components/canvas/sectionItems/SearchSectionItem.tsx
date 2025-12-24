// src/features/editor/components/canvas/sectionItems/SearchSectionItem.tsx
"use client";

import React from "react";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Flex, Label, TextField2 } from "fone-design-system_v1";

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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* ✅ 왼쪽: 라벨+인풋들 */}
        <Flex spacing={5}>
          <Flex spacing={2}>
            <Label size="medium">주문번호</Label>
            <TextField2 placeholder="주문번호" />
          </Flex>

          <Flex spacing={2}>
            <Label size="medium">고객명</Label>
            <TextField2 placeholder="예) 홍길동" />
          </Flex>

          <Flex spacing={2}>
            <Label size="medium">상태</Label>
            <TextField2 placeholder="진행중" />
          </Flex>

          <Flex spacing={2}>
            <Label size="medium">상태</Label>
            <TextField2 placeholder="진행중" />
          </Flex>

          <Flex spacing={2}>
            <Label size="medium">상태</Label>
            <TextField2 placeholder="진행중" />
          </Flex>
        </Flex>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "1rem",
            flexShrink: 0,
          }}
        >
          <Button iconOnly variant="outlined">
            {" "}
            <ReplayIcon />
          </Button>

          <Button variant="contained" startIcon={<SearchIcon />}>
            검색
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
