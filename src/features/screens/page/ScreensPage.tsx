// src/features/screens/page/ScreensPage.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import SelectPatternDialog from "../components/dialogs/SelectPatternDialog";

type ScreenStatus = "draft" | "published";

type ScreenItem = {
  id: string;
  title: string;
  updatedAt: string; // ISO
  status: ScreenStatus;
  /** 이 Screen이 “출발점으로 삼은” 패턴 (builtin/custom 구분 없이 id만) */
  originPatternId: string | null;
};

const TAB_ALL = "all";
const TAB_DRAFT = "draft";
const TAB_PUBLISHED = "published";

/** ✅ UI 테스트용 더미 (나중에 shared/store/screen로 교체) */
const MOCK_SCREENS: ScreenItem[] = [
  {
    id: "screen_1",
    title: "회원 목록",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "draft",
    originPatternId: "p2-1",
  },
  {
    id: "screen_2",
    title: "상품 상세",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: "published",
    originPatternId: "custom_xxx",
  },
  {
    id: "screen_3",
    title: "주문 내역",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "draft",
    originPatternId: null,
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  // 너무 과한 포맷 말고 가볍게
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export default function ScreensPage() {
  const router = useRouter();

  const [tab, setTab] = React.useState<string>(TAB_ALL);
  const [selectOpen, setSelectOpen] = React.useState(false);

  /** ✅ UI 테스트용: store로 교체 예정 */
  const [screens] = React.useState<ScreenItem[]>(MOCK_SCREENS);

  const filtered = React.useMemo(() => {
    if (tab === TAB_DRAFT) return screens.filter(s => s.status === "draft");
    if (tab === TAB_PUBLISHED)
      return screens.filter(s => s.status === "published");
    return screens;
  }, [screens, tab]);

  const handleOpenScreen = (screenId: string) => {
    // ✅ “기존 Screen 수정” 에디터
    router.push(`/editor/screen/${encodeURIComponent(screenId)}`);
  };

  const handleNewScreen = () => {
    setSelectOpen(true);
  };

  const handleSelectPattern = (patternId: string) => {
    // ✅ “새 Screen 만들기” → 패턴 선택 즉시 에디터 진입 (테스트 단계 플로우)
    router.push(
      `/editor/screen/new?originPatternId=${encodeURIComponent(patternId)}`,
    );
  };

  const handleSelectBlank = () => {
    router.push(`/editor/screen/new?originPatternId=null`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* 상단 헤더 (PatternList랑 동일 결) */}
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
              SCREEN
            </Typography>
            <Typography variant="caption" color="text.secondary">
              실제 화면을 만들고 관리해
            </Typography>
          </Box>

          <Button variant="outlined" size="small" onClick={handleNewScreen}>
            + 새 Screen
          </Button>
        </Box>

        {/* 탭 헤더 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab
              label="전체"
              value={TAB_ALL}
              sx={{ fontSize: 13, fontWeight: 600 }}
            />
            {/* <Tab
              label="초안"
              value={TAB_DRAFT}
              sx={{ fontSize: 13, fontWeight: 600 }}
            />
            <Tab
              label="배포"
              value={TAB_PUBLISHED}
              sx={{ fontSize: 13, fontWeight: 600 }}
            /> */}
          </Tabs>
        </Box>

        {/* 섹션 타이틀 + Divider (PatternList랑 동일 결) */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            스크린 목록
          </Typography>
          <Typography variant="caption" color="text.secondary">
            클릭하면 에디터로 열립니다.
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* 리스트 */}
        {filtered.length === 0 ? (
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
            아직 스크린이 없습니다. 우측 상단에서 새 Screen을 만들어봐.
          </Box>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "20px",
            }}
          >
            {filtered.map(s => (
              <Card key={s.id} variant="outlined" sx={{ height: 220 }}>
                <CardActionArea
                  sx={{ height: "100%" }}
                  onClick={() => handleOpenScreen(s.id)}
                >
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {/* 상단: 제목 + 상태 */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.2,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {s.title}
                      </Typography>
                    </Box>

                    {/* 중간: 메타 */}
                    <Box sx={{ mt: 0.5, display: "grid", gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        수정일: {formatDate(s.updatedAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        패턴: {s.originPatternId ? s.originPatternId : "blank"}
                      </Typography>
                    </Box>

                    {/* 하단: 미리보기 자리(나중에 썸네일 넣기) */}
                    <Box
                      sx={{
                        mt: "auto",
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "grey.50",
                        height: 96,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      Thumbnail
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* ✅ 패턴 선택 모달 (PatternList랑 같은 UI) */}
      <SelectPatternDialog
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        showBlank
        onSelectBlank={handleSelectBlank}
        onSelect={handleSelectPattern}
      />
    </Box>
  );
}
