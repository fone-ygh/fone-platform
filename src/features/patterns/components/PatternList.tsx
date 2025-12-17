// src/features/patterns/components/PatternList.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import { SCREEN_PATTERNS } from "@/shared/store/pattern/default";
import { usePatternStore } from "@/shared/store/pattern/store";
import { CustomPattern } from "@/shared/store/pattern/types";

import PatternCard from "./PatternCard";

const TAB_BUILTIN = "builtin";
const TAB_CUSTOM = "custom";

export default function PatternList() {
  const router = useRouter();
  const customPatterns = usePatternStore(s => s.customPatterns);

  const [tab, setTab] = React.useState<string>(TAB_BUILTIN);

  const handleChangeTab = (_: React.SyntheticEvent, value: string) => {
    setTab(value);
  };

  const handleOpenScreen = (screen: CustomPattern) => {
    router.push(`/editor/new?originPatternId=${encodeURIComponent(screen.id)}`);
  };

  const handleCreateBlank = () => {
    router.push(`/editor/new?originPatternId=null`); // originPatternId 없음 = blank
  };

  const isBuiltinTab = tab === TAB_BUILTIN;
  const isCustomTab = tab === TAB_CUSTOM;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* 헤더 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              화면 패턴
            </Typography>
          </Box>

          {/* Blank 시작 버튼 */}
          <Button variant="outlined" size="small" onClick={handleCreateBlank}>
            빈 화면으로 시작하기
          </Button>
        </Box>

        {/* 탭 헤더 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tab} onChange={handleChangeTab} variant="fullWidth">
            <Tab
              label="기본 패턴"
              value={TAB_BUILTIN}
              sx={{ fontSize: 13, fontWeight: 600 }}
            />
            <Tab
              label="사용자 지정 패턴"
              value={TAB_CUSTOM}
              sx={{ fontSize: 13, fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* 기본 패턴 탭 */}
        {isBuiltinTab && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                기본 패턴
              </Typography>
              <Typography variant="caption" color="text.secondary">
                제품에서 제공하는 고정 레이아웃
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "20px",
              }}
            >
              {SCREEN_PATTERNS.map(screen => (
                <PatternCard
                  key={screen.id}
                  pattern={screen}
                  onSelect={handleOpenScreen}
                />
              ))}
            </div>
          </Box>
        )}

        {/* 사용자 지정 패턴 탭 */}
        {isCustomTab && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                사용자 지정 패턴
              </Typography>
              <Typography variant="caption" color="text.secondary">
                레이아웃 편집기에서 저장한 나만의 패턴
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {customPatterns.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center",
                  fontSize: 13,
                  color: "text.secondary",
                  borderRadius: 2,
                  border: "1px dashed rgba(148,163,184,0.6)",
                  bgcolor: "rgba(148,163,184,0.04)",
                }}
              >
                아직 저장된 사용자 지정 패턴이 없습니다.
              </Box>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "20px",
                }}
              >
                {customPatterns.map(screen => (
                  <PatternCard
                    key={screen.id}
                    pattern={screen}
                    onSelect={handleOpenScreen}
                  />
                ))}
              </div>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
