// src/features/screens/dialogs/SelectPatternDialog.tsx
"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import PatternCard from "@/features/patterns/components/PatternCard";
import { SCREEN_PATTERNS } from "@/shared/store/patterns/default";
import { usePatternStore } from "@/shared/store/patterns/store";
import type { CustomPattern } from "@/shared/store/patterns/types";

const TAB_BUILTIN = "builtin";
const TAB_CUSTOM = "custom";

type Props = {
  open: boolean;
  onClose: () => void;

  /** ✅ 선택 즉시 “에디터 진입” (originPatternId로 push) */
  onSelect: (patternId: string) => void;

  /** (선택) 빈 화면으로 시작 노출 여부 */
  showBlank?: boolean;
  onSelectBlank?: () => void;
};

export default function SelectPatternDialog({
  open,
  onClose,
  onSelect,
  showBlank = false,
  onSelectBlank,
}: Props) {
  const { customPatterns } = usePatternStore();

  const [tab, setTab] = React.useState<string>(TAB_BUILTIN);
  const isBuiltinTab = tab === TAB_BUILTIN;
  const isCustomTab = tab === TAB_CUSTOM;

  const handleChangeTab = (_: React.SyntheticEvent, value: string) => {
    setTab(value);
  };

  const handlePick = (p: CustomPattern) => {
    onSelect(p.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              패턴 선택
            </Typography>
            <Typography variant="caption" color="text.secondary">
              선택 즉시 에디터로 들어가
            </Typography>
          </Box>

          {showBlank && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                onSelectBlank?.();
                onClose();
              }}
            >
              빈 화면으로 시작하기
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 탭 헤더 (PatternList랑 동일한 느낌) */}
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
            <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
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
              {SCREEN_PATTERNS.map(p => (
                <PatternCard
                  key={p.id}
                  pattern={p as any}
                  onSelect={handlePick}
                />
              ))}
            </div>
          </Box>
        )}

        {/* 사용자 지정 패턴 탭 */}
        {isCustomTab && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
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
                {customPatterns.map(p => (
                  <PatternCard
                    key={p.id}
                    pattern={p as any}
                    onSelect={handlePick}
                  />
                ))}
              </div>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="text" onClick={onClose}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
