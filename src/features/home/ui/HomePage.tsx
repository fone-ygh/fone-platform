// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { Button } from "@/shared/ui/button2/Button2";

/* ───────────────── Tokens / Const ───────────────── */
const SOFT_SHADOW =
  "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)";
const HOVER_SHADOW =
  "0 2px 6px rgba(16,24,40,.06), 0 16px 48px rgba(16,24,40,.08)";
const GRID_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
      <rect width='24' height='24' fill='white'/>
      <path d='M24 0H0V24' fill='none' stroke='%23edf1f6' stroke-width='1'/>
    </svg>`,
  ) +
  '")';

/* ───────────────── Icons ───────────────── */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
function ExpandMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ───────────────── Primitives ───────────────── */
const BackgroundGrid = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: ${GRID_BG};
  background-repeat: repeat;
  background-size: 24px 24px;
  opacity: 0.1;
`;

const SkipLink = styled.a`
  position: absolute;
  left: -9999px;
  top: 0.8rem;
  background: var(--ds-color-primary, #1f6feb);
  color: #fff;
  padding: 0.8rem 1.2rem;
  border-radius: 0.8rem;
  &:focus {
    left: 50%;
    transform: translateX(-50%);
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: var(--space-page-x, 1.6rem);
  padding-right: var(--space-page-x, 1.6rem);
`;

const HeaderBar = styled.header<{ $elevate: boolean }>`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${({ $elevate }) =>
    $elevate ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.9)"};
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(18, 24, 40, 0.1);
`;

const Toolbar = styled.div`
  min-height: 6.4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: inherit;
  text-decoration: none;
  &:focus-visible {
    outline: 2px solid var(--ds-color-primary, #1f6feb);
    outline-offset: 2px;
  }
`;

const BrandBadge = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 0.9rem;
  background: var(--ds-color-primary, #1f6feb);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
`;

const BrandName = styled.span`
  font-weight: 800;
  font-size: var(--ds-font-size-base, 1.5rem);
  letter-spacing: 0.01rem;
  color: var(--ds-text-default, #2d2d2d);
`;

const Nav = styled.nav`
  margin-left: auto;
  display: flex;
  gap: 0.4rem;
  & a.btn {
    text-decoration: none;
  }
`;

const Paper = styled.div`
  padding: 2rem;
  border-radius: 1.2rem;
  box-shadow: ${SOFT_SHADOW};
  transition:
    box-shadow 0.2s,
    transform 0.2s,
    border-color 0.2s;
  background: #fff;
  border: 1px solid rgba(18, 24, 40, 0.06);
  &:hover {
    box-shadow: ${HOVER_SHADOW};
    transform: translateY(-2px);
    border-color: rgba(18, 24, 40, 0.12);
  }
`;

const SectionWrap = styled.section<{ $tone: "white" | "neutral" | "tint" }>`
  padding: 6rem 0;
  background: ${({ $tone }) =>
    $tone === "tint" ? "#F3F7FF" : $tone === "neutral" ? "#F7F9FC" : "#ffffff"};
  ${({ $tone }) =>
    $tone === "tint"
      ? css`
          background-image:
            radial-gradient(
              60rem 30rem at 10% -10%,
              color-mix(
                in srgb,
                var(--ds-color-primary, #1f6feb) 10%,
                transparent
              ),
              transparent 60%
            ),
            radial-gradient(
              50rem 28rem at 90% -20%,
              color-mix(
                in srgb,
                var(--ds-color-primary, #1f6feb) 12%,
                transparent
              ),
              transparent 60%
            );
          background-blend-mode: screen;
        `
      : undefined};
  @media (min-width: 900px) {
    padding: 8rem 0;
  }
`;

/* Grid utils */
const TwoCol = styled.div`
  display: grid;
  gap: 4.8rem;
  grid-template-columns: 1fr;
  align-items: center;
  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Cards3 = styled.div`
  display: grid;
  gap: 2.4rem;
  grid-template-columns: 1fr;
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const SimpleGrid = styled.div<{ $colsSm?: number; $colsMd?: number }>`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(${({ $colsSm = 2 }) => $colsSm}, 1fr);
  @media (min-width: 600px) {
    grid-template-columns: repeat(${({ $colsSm = 2 }) => $colsSm}, 1fr);
  }
  @media (min-width: 900px) {
    grid-template-columns: repeat(${({ $colsMd = 3 }) => $colsMd}, 1fr);
  }
`;

/* Typography */
const Kicker = styled.div`
  letter-spacing: 0.12rem;
  font-weight: 800;
  font-size: var(--ds-font-size-sm, 1.3rem);
  color: var(--ds-color-primary, #1f6feb);
  margin-bottom: 0.6rem;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  font-size: var(--ds-font-size-display, 3.2rem);
  font-weight: 900;
  margin: 0 0 1rem 0;
  letter-spacing: -0.02rem;
`;

const Muted = styled.p`
  color: var(--ds-text-subtle, #6b7280);
  font-size: var(--ds-font-size-base, 1.5rem);
`;

const SectionTitle = styled.h2`
  font-size: var(--ds-font-size-heading, 2rem);
  font-weight: 800;
  margin: 0 0 1.2rem 0;
  text-align: center;
  letter-spacing: -0.01rem;
`;

const SectionSub = styled.p`
  text-align: center;
  color: var(--ds-text-subtle, #6b7280);
  font-size: var(--ds-font-size-base, 1.5rem);
`;

/* FAQ */
const Accordion = styled.details`
  border-radius: 0.8rem;
  background: #fff;
  border: 1px solid rgba(18, 24, 40, 0.1);
  &[open] summary svg {
    transform: rotate(180deg);
  }
`;
const AccordionSummary = styled.summary`
  list-style: none;
  cursor: pointer;
  display: flex;
  gap: 0.8rem;
  align-items: center;
  padding: 1.2rem 1.6rem;
  font-weight: 700;
  font-size: 1.5rem;
  &::-webkit-details-marker {
    display: none;
  }
  svg {
    width: 1.8rem;
    height: 1.8rem;
    transition: transform 0.2s;
    margin-left: auto;
  }
`;
const AccordionDetails = styled.div`
  padding: 0 1.6rem 1.6rem 1.6rem;
  color: var(--ds-text-subtle, #6b7280);
  font-size: var(--ds-font-size-base, 1.5rem);
`;

/* Stat pill */
const StatPill = styled.div`
  padding: 1rem 1.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(140%) blur(2px);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: ${SOFT_SHADOW};
  border: 1px solid rgba(18, 24, 40, 0.06);
`;
const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ds-color-primary, #1f6feb);
  flex: 0 0 auto;
`;

/* ───────────────── Page ───────────────── */
export default function Page() {
  const [elevate, setElevate] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevate(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <BackgroundGrid />
      <SkipLink href="#main">Skip to content</SkipLink>

      {/* Top note */}
      <div
        style={{
          borderBottom: "1px solid rgba(18,24,40,0.10)",
          background: "#f8fafc",
        }}
      >
        <Container>
          <div style={{ minHeight: 36, display: "flex", alignItems: "center" }}>
            <span
              style={
                {
                  color: "#6b7280",
                  fontSize: "var(--ds-font-size-sm, 1.3rem)",
                } as React.CSSProperties
              }
            >
              사내 전용 · 외부 공유 금지 · 접속 로그 기록
            </span>
          </div>
        </Container>
      </div>

      {/* Header */}
      <HeaderBar $elevate={elevate}>
        <Container>
          <Toolbar>
            <Brand href="/" aria-label="Ultra Layout 홈">
              <BrandBadge>UL</BrandBadge>
              <BrandName>Ultra Layout</BrandName>
            </Brand>

            <Nav aria-label="주요">
              {[
                { label: "레이아웃", href: "/editor" },
                { label: "그리드", href: "/grid" },
                { label: "리사이즈", href: "/resize" },
                { label: "공지", href: "#updates" },
                { label: "FAQ", href: "#faq" },
              ].map(item => (
                <Button key={item.href} variant="ghost" href={item.href}>
                  {item.label}
                </Button>
              ))}
            </Nav>
          </Toolbar>
        </Container>
      </HeaderBar>

      <main id="main">
        {/* Hero — tint */}
        <SectionWrap id="home" $tone="tint">
          <Container>
            <TwoCol>
              <div>
                <Kicker>Ultra Layout Editor</Kicker>
                <HeroTitle>레이아웃 편집 도구</HeroTitle>
                <Muted style={{ marginBottom: "3rem" }}>
                  드래그 배치, 스냅, 템플릿 재사용. 사내 페이지 제작을 단순하게.
                </Muted>

                <div
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    marginBottom: "3rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="solid"
                    color="primary"
                    as="a"
                    href="/app/projects/new"
                  >
                    지금 시작하기
                    <span aria-hidden style={{ display: "inline-flex" }}>
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </Button>
                  <Button
                    as="a"
                    variant="outline"
                    color="primary"
                    href="#preview"
                  >
                    라이브 미리보기
                  </Button>
                </div>

                <div
                  style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}
                >
                  {[
                    { n: "1,284", k: "활성 프로젝트" },
                    { n: "10/24", k: "최근 배포" },
                    { n: "정상", k: "시스템 상태" },
                  ].map(s => (
                    <StatPill key={s.k}>
                      <Dot aria-hidden />
                      <strong
                        style={
                          {
                            color: "var(--ds-color-primary, #1f6feb)",
                            fontWeight: 800,
                            fontSize: "var(--ds-font-size-base, 1.5rem)",
                          } as React.CSSProperties
                        }
                      >
                        {s.n}
                      </strong>
                      <span
                        style={
                          {
                            fontSize: "var(--ds-font-size-sm, 1.3rem)",
                            color: "var(--ds-text-subtle, #6b7280)",
                          } as React.CSSProperties
                        }
                      >
                        {s.k}
                      </span>
                    </StatPill>
                  ))}
                </div>
              </div>

              <div>
                <Paper>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    <span
                      style={
                        {
                          fontSize: "var(--ds-font-size-sm, 1.3rem)",
                          color: "var(--ds-text-subtle, #6b7280)",
                        } as React.CSSProperties
                      }
                    >
                      Preview
                    </span>
                  </div>

                  <div style={{ borderRadius: "1.2rem", overflow: "hidden" }}>
                    <div style={{ padding: "2rem" }}>
                      <div style={{ display: "grid", gap: "1.2rem" }}>
                        <div
                          style={{
                            height: 56,
                            background: "#f9fafb",
                            borderRadius: "1.2rem",
                          }}
                        />
                        <SimpleGrid $colsSm={3} $colsMd={3}>
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                height: 72,
                                background: "#f9fafb",
                                borderRadius: "1.2rem",
                              }}
                            />
                          ))}
                        </SimpleGrid>
                        <SimpleGrid $colsSm={2} $colsMd={4}>
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                height: 56,
                                background: "#f9fafb",
                                borderRadius: "1.2rem",
                              }}
                            />
                          ))}
                        </SimpleGrid>
                      </div>
                    </div>
                  </div>
                </Paper>
              </div>
            </TwoCol>
          </Container>
        </SectionWrap>

        {/* Features — white */}
        <SectionWrap id="features" $tone="white">
          <Container>
            <SectionTitle>기능</SectionTitle>
            <SectionSub>필요한 기능만 담아 단순하게.</SectionSub>

            <Cards3>
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
                <Paper
                  key={f.t}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: ".6rem",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--ds-color-primary, #1f6feb)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <CheckIcon width={14} height={14} />
                  </div>
                  <strong
                    style={
                      {
                        fontWeight: 800,
                        fontSize: "var(--ds-font-size-base, 1.5rem)",
                      } as React.CSSProperties
                    }
                  >
                    {f.t}
                  </strong>
                  <Muted style={{ margin: 0 }}>{f.d}</Muted>
                </Paper>
              ))}
            </Cards3>
          </Container>
        </SectionWrap>

        {/* Preview — neutral */}
        <SectionWrap id="preview" $tone="neutral">
          <Container>
            <TwoCol>
              <div>
                <SectionTitle style={{ textAlign: "left" }}>
                  미리보기
                </SectionTitle>
                <Muted style={{ marginBottom: "2rem" }}>
                  실제 편집 화면과 동일한 그리드/가이드로 결과를 빠르게 확인.
                </Muted>
                <ul style={{ marginBottom: "2rem", padding: 0 }}>
                  {[
                    "정렬/분배 스냅",
                    "레이어 잠금/숨김",
                    "단축키(⌘D, ⌘G, ⌘S)",
                  ].map(k => (
                    <li
                      key={k}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                        padding: ".2rem 0",
                      }}
                    >
                      <CheckIcon
                        width={14}
                        height={14}
                        style={{
                          color: "var(--ds-color-primary, #1f6feb)",
                          flex: "0 0 auto",
                        }}
                      />
                      <span
                        style={
                          {
                            fontSize: "var(--ds-font-size-base, 1.5rem)",
                          } as React.CSSProperties
                        }
                      >
                        {k}
                      </span>
                    </li>
                  ))}
                </ul>
                <div
                  style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}
                >
                  <Button
                    as="a"
                    variant="solid"
                    color="primary"
                    href="/app/projects"
                  >
                    프로젝트 보기
                  </Button>
                  <Button
                    as="a"
                    variant="outline"
                    color="primary"
                    href="/templates"
                  >
                    템플릿 갤러리
                  </Button>
                </div>
              </div>

              <div>
                <Paper>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    <span
                      style={
                        {
                          fontSize: "var(--ds-font-size-sm, 1.3rem)",
                          color: "var(--ds-text-subtle, #6b7280)",
                        } as React.CSSProperties
                      }
                    >
                      Preview
                    </span>
                  </div>

                  <div style={{ borderRadius: "1.2rem", overflow: "hidden" }}>
                    <div style={{ padding: "2rem" }}>
                      <div style={{ display: "grid", gap: "1.2rem" }}>
                        <div
                          style={{
                            height: 56,
                            background: "#f9fafb",
                            borderRadius: "1.2rem",
                          }}
                        />
                        <SimpleGrid $colsSm={3} $colsMd={3}>
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                height: 72,
                                background: "#f9fafb",
                                borderRadius: "1.2rem",
                              }}
                            />
                          ))}
                        </SimpleGrid>
                        <SimpleGrid $colsSm={2} $colsMd={4}>
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                height: 56,
                                background: "#f9fafb",
                                borderRadius: "1.2rem",
                              }}
                            />
                          ))}
                        </SimpleGrid>
                      </div>
                    </div>
                  </div>
                </Paper>
              </div>
            </TwoCol>
          </Container>
        </SectionWrap>

        {/* Links — tint */}
        <SectionWrap id="links" $tone="tint">
          <Container>
            <SectionTitle>바로가기</SectionTitle>
            <SectionSub>자주 쓰는 내부 리소스.</SectionSub>

            <div
              style={{
                display: "grid",
                gap: "3rem",
                gridTemplateColumns: "1fr",
              }}
            >
              <div>
                <Paper>
                  <h4
                    style={
                      {
                        fontSize: "var(--ds-font-size-heading, 2rem)",
                        fontWeight: 800,
                        marginBottom: "1.2rem",
                      } as React.CSSProperties
                    }
                  >
                    시작
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gap: "1.2rem",
                      marginTop: ".4rem",
                      gridTemplateColumns: "repeat(3, 1fr)",
                    }}
                  >
                    {[
                      { name: "새 프로젝트", href: "/app/projects/new" },
                      { name: "내 프로젝트", href: "/app/projects" },
                      { name: "템플릿 갤러리", href: "/templates" },
                      { name: "문서", href: "/docs" },
                      { name: "릴리즈 노트", href: "/changelog" },
                      { name: "시스템 상태", href: "/status" },
                    ].map(l => (
                      <Button
                        key={l.name}
                        as="a"
                        variant="outline"
                        color="primary"
                        href={l.href}
                        fullWidth
                        style={{
                          justifyContent: "flex-start",
                          border: "1px solid rgba(18,24,40,0.10)",
                        }}
                      >
                        <CheckIcon width={16} height={16} />
                        {l.name}
                      </Button>
                    ))}
                  </div>
                </Paper>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "1.5rem",
                  gridTemplateColumns: "repeat(2, 1fr)",
                }}
              >
                <Paper>
                  <h4
                    style={
                      {
                        fontSize: "var(--ds-font-size-heading, 2rem)",
                        fontWeight: 800,
                        marginBottom: "1.2rem",
                      } as React.CSSProperties
                    }
                  >
                    공지
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {[
                      {
                        date: "2025-10-10",
                        title: "에디터 단축키 업데이트",
                        desc: "중복(⌘D)·그룹(⌘G) 개선, 커맨드 검색(⌘K) 추가.",
                      },
                      {
                        date: "2025-10-02",
                        title: "템플릿 갤러리 보강",
                        desc: "대시보드/리포트 기본 템플릿 6종 추가.",
                      },
                    ].map((n, i, a) => (
                      <div
                        key={n.date}
                        style={{
                          display: "flex",
                          gap: "2rem",
                          alignItems: "flex-start",
                          padding: ".6rem 0",
                          borderBottom:
                            i !== a.length - 1
                              ? "1px dashed rgba(18,24,40,0.10)"
                              : "none",
                        }}
                      >
                        <span
                          style={
                            {
                              width: 80,
                              color: "var(--ds-text-subtle, #6b7280)",
                              fontSize: "var(--ds-font-size-sm, 1.3rem)",
                            } as React.CSSProperties
                          }
                        >
                          {n.date}
                        </span>
                        <div>
                          <strong
                            style={
                              {
                                fontWeight: 800,
                                fontSize: "var(--ds-font-size-base, 1.5rem)",
                              } as React.CSSProperties
                            }
                          >
                            {n.title}
                          </strong>
                          <Muted style={{ marginTop: ".2rem" }}>{n.desc}</Muted>
                        </div>
                      </div>
                    ))}
                  </div>
                </Paper>

                <Paper>
                  <h4
                    style={
                      {
                        fontSize: "var(--ds-font-size-heading, 2rem)",
                        fontWeight: 800,
                        marginBottom: "1.2rem",
                      } as React.CSSProperties
                    }
                  >
                    시스템 상태
                  </h4>
                  {["Core API", "Editor", "Auth (SSO)", "Export"].map(
                    (svc, i, a) => (
                      <div
                        key={svc}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1rem 0",
                          borderBottom:
                            i !== a.length - 1
                              ? "1px dashed rgba(18,24,40,0.10)"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.8rem",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--ds-color-primary, #1f6feb)",
                            }}
                          />
                          <span
                            style={
                              {
                                fontSize: "var(--ds-font-size-base, 1.5rem)",
                              } as React.CSSProperties
                            }
                          >
                            {svc}
                          </span>
                        </div>
                        <strong
                          style={
                            {
                              color: "var(--ds-color-primary, #1f6feb)",
                              fontSize: "var(--ds-font-size-base, 1.5rem)",
                            } as React.CSSProperties
                          }
                        >
                          정상
                        </strong>
                      </div>
                    ),
                  )}
                </Paper>
              </div>
            </div>
          </Container>
        </SectionWrap>

        {/* FAQ — neutral */}
        <SectionWrap id="faq" $tone="neutral">
          <Container>
            <SectionTitle>FAQ</SectionTitle>
            <div style={{ display: "grid", gap: "1rem" }}>
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
                <Accordion key={it.q}>
                  <AccordionSummary>
                    {it.q}
                    <ExpandMoreIcon />
                  </AccordionSummary>
                  <AccordionDetails>{it.a}</AccordionDetails>
                </Accordion>
              ))}
            </div>
          </Container>
        </SectionWrap>
      </main>

      {/* Footer */}
      <footer style={{ padding: "5rem 0", background: "#fff" }}>
        <Container>
          <div
            style={{ display: "grid", gap: "3rem", gridTemplateColumns: "1fr" }}
          >
            <div>
              <Brand href="/" aria-label="Ultra Layout 홈">
                <BrandBadge>UL</BrandBadge>
                <span
                  style={
                    {
                      fontWeight: 800,
                      fontSize: "var(--ds-font-size-base, 1.5rem)",
                    } as React.CSSProperties
                  }
                >
                  Ultra Layout
                </span>
              </Brand>
              <Muted style={{ marginTop: "1rem" }}>
                사내 레이아웃 편집과 페이지 제작을 위한 통합 도구입니다. 빠르게
                만들고 안정적으로 배포하세요.
              </Muted>
            </div>

            <div>
              <strong
                style={
                  {
                    fontWeight: 800,
                    marginBottom: "1.2rem",
                    display: "block",
                    fontSize: "var(--ds-font-size-base, 1.5rem)",
                  } as React.CSSProperties
                }
              >
                Links
              </strong>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {[
                  { name: "템플릿", href: "/templates" },
                  { name: "문서", href: "/docs" },
                  { name: "도움말", href: "/help" },
                  { name: "설정", href: "/settings" },
                ].map(l => (
                  <a
                    key={l.name}
                    href={l.href}
                    style={
                      {
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                        fontSize: "var(--ds-font-size-base, 1.5rem)",
                      } as React.CSSProperties
                    }
                  >
                    {l.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <hr style={{ opacity: 0.2, margin: "3rem 0" }} />

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={
                {
                  color: "var(--ds-text-subtle, #6b7280)",
                  fontSize: "var(--ds-font-size-sm, 1.3rem)",
                } as React.CSSProperties
              }
            >
              © {new Date().getFullYear()} Ultra Layout. Internal use only.
            </span>
            <div style={{ display: "flex", gap: "2rem" }}>
              {[
                { name: "개인정보", href: "/policies/privacy" },
                { name: "보안", href: "/policies/security" },
                { name: "이용 약관", href: "/policies/terms" },
              ].map(l => (
                <a
                  key={l.name}
                  href={l.href}
                  style={
                    {
                      fontSize: "var(--ds-font-size-sm, 1.3rem)",
                      textDecoration: "underline",
                      textUnderlineOffset: "2px",
                    } as React.CSSProperties
                  }
                >
                  {l.name}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
