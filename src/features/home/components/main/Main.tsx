import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button } from "fone-design-system_v1";

export default function Main() {
  return (
    <main id="main">
      <SectionWrap id="home" $tone="tint">
        <Container>
          <TwoCol>
            <div>
              <Kicker>UI Platform Editor</Kicker>
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
                <Button variant="contained" href="/editor">
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
    </main>
  );
}

const SOFT_SHADOW =
  "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)";
const HOVER_SHADOW =
  "0 2px 6px rgba(16,24,40,.06), 0 16px 48px rgba(16,24,40,.08)";

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: var(--space-page-x, 1.6rem);
  padding-right: var(--space-page-x, 1.6rem);
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
