"use client";

import * as React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  createTheme,
  CssBaseline,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Link as MLink,
  Paper,
  Stack,
  SvgIcon,
  ThemeProvider,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";

/* Icons */
function CheckIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </SvgIcon>
  );
}

/* Tokens */
const PRIMARY = "#1f6feb";
const RADIUS = 12;
const TONE_WHITE = "#ffffff";
const TONE_NEUTRAL = "#F7F9FC";
const TONE_TINT = "#F3F7FF";
const GRID_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
      <rect width='24' height='24' fill='white'/>
      <path d='M24 0H0V24' fill='none' stroke='%23edf1f6' stroke-width='1'/>
    </svg>`,
  ) +
  '")';
const SOFT_SHADOW =
  "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)";
const HOVER_SHADOW =
  "0 2px 6px rgba(16,24,40,.06), 0 16px 48px rgba(16,24,40,.08)";

/* Theme */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: PRIMARY },
    divider: "rgba(18,24,40,0.10)",
    background: { default: "#ffffff", paper: "#ffffff" },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    htmlFontSize: 10,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Pretendard Variable", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Segoe UI Symbol", sans-serif',
    h1: { fontSize: "3.6rem", fontWeight: 900, letterSpacing: -0.2 },
    h2: { fontSize: "2.4rem", fontWeight: 800, letterSpacing: -0.1 },
    h4: { fontSize: "2.0rem", fontWeight: 800 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 700, borderRadius: RADIUS },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: RADIUS },
        outlined: { borderColor: "transparent" }, // 섹션 보더 X
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "none",
          "&::before": { display: "none" },
        },
        gutters: { paddingLeft: 0, paddingRight: 0 },
      },
    },
  },
});

/* Section */
type Tone = "white" | "neutral" | "tint";
const toneToColor: Record<Tone, string> = {
  white: TONE_WHITE,
  neutral: TONE_NEUTRAL,
  tint: TONE_TINT,
};
function Section({
  id,
  tone = "white",
  children,
}: {
  id?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <Box
      component="section"
      id={id}
      sx={{ bgcolor: toneToColor[tone], py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}

export default function Page() {
  const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(menuEl);
  const onOpen = (e: React.MouseEvent<HTMLElement>) =>
    setMenuEl(e.currentTarget);
  const onClose = () => setMenuEl(null);
  const elevate = useScrollTrigger({ disableHysteresis: true, threshold: 4 });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* 전역 격자 */}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: GRID_BG,
          backgroundRepeat: "repeat",
          backgroundSize: "24px 24px",
          opacity: 0.1,
        }}
      />

      {/* Skip link */}
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -9999,
          top: 8,
          bgcolor: "primary.main",
          color: "#fff",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { left: "50%", transform: "translateX(-50%)" },
        }}
      >
        Skip to content
      </Box>

      {/* Top note */}
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ minHeight: 36, display: "flex", alignItems: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            사내 전용 · 외부 공유 금지 · 접속 로그 기록
          </Typography>
        </Container>
      </Box>

      {/* Header — sticky (이전 상태) */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: elevate ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          transition: "all .2s ease",
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          <Container
            maxWidth="lg"
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <MLink
              href="/"
              underline="none"
              aria-label="Ultra Layout 홈"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                }}
              >
                UL
              </Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Ultra Layout
              </Typography>
            </MLink>

            <Stack
              direction="row"
              spacing={1}
              component="nav"
              aria-label="주요"
              sx={{ ml: 2 }}
            >
              <Button
                color="inherit"
                onMouseEnter={onOpen}
                // onClick={onOpen}
                aria-controls={open ? "layout" : undefined}
                href="/editor"
              >
                레이아웃
              </Button>
              {/* <Menu
                id="layout"
                anchorEl={menuEl}
                open={open}
                onClose={onClose}
                MenuListProps={{ onMouseLeave: onClose }}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <MenuItem
                  component={MLink}
                  href="/layout/layoutitem7/ddd"
                  onClick={onClose}
                >
                  all
                </MenuItem>
                <MenuItem
                  component={MLink}
                  href="/app/projects/new"
                  onClick={onClose}
                >
                  생성하기
                </MenuItem>
              </Menu> */}
              <Button color="inherit" href="/grid">
                그리드
              </Button>
              <Button color="inherit" href="#links">
                바로가기
              </Button>
              <Button color="inherit" href="#updates">
                공지
              </Button>
              <Button color="inherit" href="#faq">
                FAQ
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <Button color="inherit" href="#preview">
                라이브 미리보기
              </Button>
              <Button variant="contained" href="/app/projects/new">
                새 프로젝트
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box component="main" id="main">
        {/* Hero — tint */}
        <Section id="home" tone="tint">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: 1.2,
                }}
              >
                Ultra Layout Editor
              </Typography>
              <Typography variant="h1" sx={{ mb: 1 }}>
                레이아웃 편집 도구
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                드래그 배치, 스냅, 템플릿 재사용. 사내 페이지 제작을 단순하게.
              </Typography>

              <Stack direction="row" spacing={1.2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  href="/app/projects/new"
                  endIcon={
                    <SvgIcon viewBox="0 0 24 24">
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </SvgIcon>
                  }
                >
                  지금 시작하기
                </Button>
                <Button variant="outlined" href="#preview">
                  라이브 미리보기
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.2} flexWrap="wrap">
                {[
                  { n: "1,284", k: "활성 프로젝트" },
                  { n: "10/24", k: "최근 배포" },
                  { n: "정상", k: "시스템 상태" },
                ].map(s => (
                  <Box
                    key={s.k}
                    sx={{
                      px: 1.6,
                      py: 1,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,.85)",
                      backdropFilter: "saturate(140%) blur(2px)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      boxShadow: SOFT_SHADOW,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                      }}
                    />
                    <Typography fontWeight={800} color="primary.main">
                      {s.n}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.k}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: SOFT_SHADOW,
                  transition: "box-shadow .2s, transform .2s",
                  "&:hover": {
                    boxShadow: HOVER_SHADOW,
                    transform: "translateY(-2px)",
                  },
                  bgcolor: "#fff",
                }}
              >
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Preview
                  </Typography>
                </Box>
                <Card elevation={0} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={1.2}>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            height: 56,
                            bgcolor: "grey.50",
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                      {[...Array(3)].map((_, i) => (
                        <Grid item xs={12} sm={4} key={i}>
                          <Box
                            sx={{
                              height: 72,
                              bgcolor: "grey.50",
                              borderRadius: 2,
                            }}
                          />
                        </Grid>
                      ))}
                      {[...Array(8)].map((_, i) => (
                        <Grid item xs={6} sm={3} key={i}>
                          <Box
                            sx={{
                              height: 56,
                              bgcolor: "grey.50",
                              borderRadius: 2,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          </Grid>
        </Section>

        {/* Features — white */}
        <Section id="features" tone="white">
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h2">기능</Typography>
            <Typography color="text.secondary">
              필요한 기능만 담아 단순하게.
            </Typography>
          </Box>

          <Grid container spacing={2.4}>
            {[
              { t: "정밀 편집", d: "룰러·스냅·멀티 선택으로 빠른 배치." },
              {
                t: "레이어/페이지",
                d: "트리 레이어·탭으로 대형 레이아웃 정리.",
              },
              { t: "템플릿", d: "자주 쓰는 섹션을 저장·재사용." },
              { t: "컬러 시스템", d: "라이트/다크 테마 일괄 관리." },
              { t: "공유/내보내기", d: "프리뷰 공유, HTML/JSON 출력." },
              { t: "저장/이력", d: "자동 저장·되돌리기·감사 로그." },
            ].map(f => (
              <Grid item xs={12} sm={6} md={4} key={f.t}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.6,
                    boxShadow: SOFT_SHADOW,
                    transition: "box-shadow .2s, transform .2s",
                    "&:hover": {
                      boxShadow: HOVER_SHADOW,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      mb: 0.4,
                    }}
                    aria-hidden
                  >
                    <CheckIcon fontSize="small" />
                  </Box>
                  <Typography fontWeight={800}>{f.t}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.d}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Preview — neutral */}
        <Section id="preview" tone="neutral">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ mb: 1.2 }}>
                미리보기
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                실제 편집 화면과 동일한 그리드/가이드로 결과를 빠르게 확인.
              </Typography>
              <List dense sx={{ mb: 2 }}>
                {[
                  "정렬/분배 스냅",
                  "레이어 잠금/숨김",
                  "단축키(⌘D, ⌘G, ⌘S)",
                ].map(k => (
                  <ListItem key={k} sx={{ py: 0.2 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckIcon
                        sx={{ color: "primary.main" }}
                        fontSize="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{ variant: "body2" }}
                      primary={k}
                    />
                  </ListItem>
                ))}
              </List>
              <Stack direction="row" spacing={1.2}>
                <Button variant="contained" href="/app/projects">
                  프로젝트 보기
                </Button>
                <Button variant="outlined" href="/templates">
                  템플릿 갤러리
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: SOFT_SHADOW,
                  transition: "box-shadow .2s, transform .2s",
                  "&:hover": {
                    boxShadow: HOVER_SHADOW,
                    transform: "translateY(-2px)",
                  },
                  bgcolor: "#fff",
                }}
              >
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Preview
                  </Typography>
                </Box>
                <Card elevation={0} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={1.2}>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            height: 56,
                            bgcolor: "grey.50",
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                      {[...Array(3)].map((_, i) => (
                        <Grid item xs={12} sm={4} key={i}>
                          <Box
                            sx={{
                              height: 72,
                              bgcolor: "grey.50",
                              borderRadius: 2,
                            }}
                          />
                        </Grid>
                      ))}
                      {[...Array(8)].map((_, i) => (
                        <Grid item xs={6} sm={3} key={i}>
                          <Box
                            sx={{
                              height: 56,
                              bgcolor: "grey.50",
                              borderRadius: 2,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          </Grid>
        </Section>

        {/* Links — tint */}
        <Section id="links" tone="tint">
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h2">바로가기</Typography>
            <Typography color="text.secondary">
              자주 쓰는 내부 리소스.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  boxShadow: SOFT_SHADOW,
                  transition: "box-shadow .2s, transform .2s",
                  "&:hover": {
                    boxShadow: HOVER_SHADOW,
                    transform: "translateY(-2px)",
                  },
                  bgcolor: "#fff",
                }}
              >
                <Typography variant="h4" sx={{ mb: 1.2 }}>
                  시작
                </Typography>
                <Grid container spacing={1.2} sx={{ mt: 0.4 }}>
                  {[
                    { name: "새 프로젝트", href: "/app/projects/new" },
                    { name: "내 프로젝트", href: "/app/projects" },
                    { name: "템플릿 갤러리", href: "/templates" },
                    { name: "문서", href: "/docs" },
                    { name: "릴리즈 노트", href: "/changelog" },
                    { name: "시스템 상태", href: "/status" },
                  ].map(l => (
                    <Grid item xs={12} sm={6} key={l.name}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CheckIcon />}
                        href={l.href}
                        sx={{
                          justifyContent: "flex-start",
                          borderColor: "divider",
                        }}
                      >
                        {l.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: "grid", gap: 1.5 }}>
              <Paper
                elevation={0}
                sx={{ p: 2, boxShadow: SOFT_SHADOW, bgcolor: "#fff" }}
              >
                <Typography variant="h4" sx={{ mb: 1.2 }}>
                  공지
                </Typography>
                <Stack divider={<Divider />} spacing={1}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    py={0.6}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      width={80}
                    >
                      2025-10-10
                    </Typography>
                    <Box>
                      <Typography fontWeight={800}>
                        에디터 단축키 업데이트
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        중복(⌘D)·그룹(⌘G) 개선, 커맨드 검색(⌘K) 추가.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    py={0.6}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      width={80}
                    >
                      2025-10-02
                    </Typography>
                    <Box>
                      <Typography fontWeight={800}>
                        템플릿 갤러리 보강
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        대시보드/리포트 기본 템플릿 6종 추가.
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{ p: 2, boxShadow: SOFT_SHADOW, bgcolor: "#fff" }}
              >
                <Typography variant="h4" sx={{ mb: 1.2 }}>
                  시스템 상태
                </Typography>
                {["Core API", "Editor", "Auth (SSO)", "Export"].map(svc => (
                  <Stack
                    key={svc}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      py: 1,
                      borderBottom: "1px dashed",
                      borderColor: "divider",
                      "&:last-of-type": { borderBottom: "none" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                        }}
                      />
                      <Typography>{svc}</Typography>
                    </Box>
                    <Typography color="primary.main" fontWeight={800}>
                      정상
                    </Typography>
                  </Stack>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Section>

        {/* FAQ — neutral */}
        <Section id="faq" tone="neutral">
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h2">FAQ</Typography>
          </Box>
          <Stack gap={1}>
            {[
              {
                q: "브라우저에서만 사용?",
                a: "설치 없이 브라우저로 사용. Next.js 프로젝트에 임베드 가능.",
              },
              {
                q: "권한/협업은?",
                a: "SSO 연동. 조직/그룹 단위 보기·편집 권한 제공.",
              },
              {
                q: "데이터 저장 위치?",
                a: "사내 스토리지. 자동 저장·버전 이력·감사 로그 기록.",
              },
              {
                q: "외부 반출?",
                a: "기본 차단. 필요 시 보안 승인 절차를 따른다.",
              },
            ].map(it => (
              <Accordion key={it.q} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={700}>{it.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {it.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Section>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 5, bgcolor: TONE_WHITE }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <MLink
                href="/"
                aria-label="Ultra Layout 홈"
                underline="none"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.primary",
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                  }}
                >
                  UL
                </Box>
                <Typography fontWeight={800}>Ultra Layout</Typography>
              </MLink>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                사내 레이아웃 편집과 페이지 제작을 위한 통합 도구입니다. 빠르게
                만들고 안정적으로 배포하세요.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>
                Links
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <MLink href="/templates" underline="hover">
                  템플릿
                </MLink>
                <MLink href="/docs" underline="hover">
                  문서
                </MLink>
                <MLink href="/help" underline="hover">
                  도움말
                </MLink>
                <MLink href="/settings" underline="hover">
                  설정
                </MLink>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            gap={1}
          >
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Ultra Layout. Internal use only.
            </Typography>
            <Stack direction="row" spacing={2}>
              <MLink
                href="/policies/privacy"
                underline="hover"
                variant="caption"
              >
                개인정보
              </MLink>
              <MLink
                href="/policies/security"
                underline="hover"
                variant="caption"
              >
                보안
              </MLink>
              <MLink href="/policies/terms" underline="hover" variant="caption">
                이용 약관
              </MLink>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
