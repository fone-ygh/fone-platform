// src/features/framePatterns/components/PatternList.tsx
"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import { FRAME_PATTERNS } from "@/shared/store/framePatterns/default";
import { useFramePatternStore } from "@/shared/store/framePatterns/store";
import type { CustomFramePattern } from "@/shared/store/framePatterns/types";

import PatternCard from "./PatternCard";

const TAB_BUILTIN = "builtin";
const TAB_CUSTOM = "custom";

/** ✅ 썸네일 색상 설명(legend) - FrameRegion 기준 */
function FrameColorLegend() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
      <LegendItem label="Header" dotSx={{ bgcolor: "primary.light" }} />
      <LegendItem label="Sider" dotSx={{ bgcolor: "secondary.light" }} />
      <LegendItem label="MDI" dotSx={{ bgcolor: "warning.light" }} />
      <LegendItem label="Content" dotSx={{ bgcolor: "success.light" }} />
    </Box>
  );
}

function LegendItem({ label, dotSx }: { label: string; dotSx: any }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "divider",
          ...dotSx,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

type PatternListProps = {
  title?: string;

  /** "빈 프레임으로 시작하기" */
  onCreateBlank?: () => void;

  /** 패턴 선택(빌트인/커스텀 동일) */
  onSelectPattern?: (patternId: string) => void;

  /** (선택) blank 버튼 숨기고 싶으면 false */
  showBlankButton?: boolean;
};

export default function PatternList({
  title = "프레임 패턴",
  onCreateBlank,
  onSelectPattern,
  showBlankButton = true,
}: PatternListProps) {
  const { customPatterns } = useFramePatternStore();

  const [tab, setTab] = React.useState<string>(TAB_BUILTIN);

  const handleChangeTab = (_: React.SyntheticEvent, value: string) => {
    setTab(value);
  };

  const handlePick = (p: CustomFramePattern) => {
    onSelectPattern?.(p.id);
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
              {title}
            </Typography>
          </Box>

          {/* Blank 시작 버튼 */}
          {showBlankButton && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onCreateBlank?.()}
              disabled={!onCreateBlank}
            >
              빈 프레임으로 시작하기
            </Button>
          )}
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
                justifyContent: "space-between",
                mb: 1,
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  기본 프레임 패턴
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  제품에서 제공하는 기본 프레임 템플릿
                </Typography>
              </Box>

              <FrameColorLegend />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "20px",
              }}
            >
              {FRAME_PATTERNS.map(p => (
                <PatternCard
                  key={p.id}
                  pattern={p}
                  onSelect={pid => onSelectPattern?.(pid)}
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
                justifyContent: "space-between",
                mb: 1,
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  사용자 지정 프레임 패턴
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  프레임 편집기에서 저장한 나만의 프레임 패턴
                </Typography>
              </Box>

              <FrameColorLegend />
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
                아직 저장된 사용자 지정 프레임 패턴이 없습니다.
              </Box>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "20px",
                }}
              >
                {customPatterns.map(p => (
                  <PatternCard
                    key={p.id}
                    pattern={p}
                    onSelect={() => handlePick(p)}
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
