"use client";

import React from "react";
import styled from "@emotion/styled";
import { Button, Checkbox } from "fone-design-system_v1";

/* ========= Tokens (스타일용 그대로) ========= */
const T = {
  bg: "#ffffff",
  bgSoft: "#f6f8fb",
  ink: "#0f172a",
  sub: "#6b7280",
  b1: "#e5e7eb",
  b2: "#c9d4e7",
  blue: "#1f6feb",
  blue2: "#0084fe",
  ring: "rgba(0,132,254,.16)",
  gutter: 16,
  radius: 12,
};

/* ========= Helpers (격자용) ========= */
const gridBg = (size: number, alpha = 0.06) => `
  linear-gradient(to right, rgba(0,0,0,${alpha}) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(0,0,0,${alpha}) 1px, transparent 1px)
`;

export default function Page({ data }: any) {
  console.log(data, "???");
  // 기능 제거: 고정값만 표시
  const stageStyle = {
    width: 1200,
    height: 800,
    backgroundImage: gridBg(16),
    backgroundSize: `16px 16px`,
    backgroundPosition: "0 0",
  };

  return (
    <Root1>
      {/* ── Header(모든 컨트롤, 표시만) ── */}
      <Header1>
        <Toolbar>
          {/* Readouts (정적 표기) */}
          {/* <GroupSoft title="Current">
            <Read>Size&nbsp;1200×800</Read>
            <Dot />
            <Read>100%</Read>
            <Dot />
            <Read>16px grid</Read>
          </GroupSoft> */}

          {/* View (동작 없음) */}
          {/* <Group>
            <Button size="small" variant="outlined">
              Fit
            </Button>
            <Seg>Center</Seg>
            <Seg>100%</Seg>
          </Group> */}

          <Button>Fit</Button>

          {/* Zoom (동작 없음) */}
          <Group>
            <Seg>−</Seg>
            <ReadMono>100%</ReadMono>
            <Seg>＋</Seg>
          </Group>

          {/* Grid (동작 없음) */}
          <Group>
            <Toggle role="switch" aria-checked data-on>
              <i data-on />
              Grid
            </Toggle>
            <Select defaultValue={16} aria-label="Grid size">
              {[8, 10, 12, 16, 20, 24, 32].map(g => (
                <option key={g} value={g}>
                  {g}px
                </option>
              ))}
            </Select>
          </Group>

          {/* Canvas Size (동작 없음) */}
          <Group>
            <Field>
              <Label>W</Label>
              <Input type="number" placeholder="1200" />
            </Field>
            <Field>
              <Label>H</Label>
              <Input type="number" placeholder="800" />
            </Field>
            <Check id="ratio" type="checkbox" defaultChecked />
            <CheckLabel htmlFor="ratio">비율 잠금</CheckLabel>
          </Group>

          {/* Presets (동작 없음) */}
          <Group>
            <Preset>1920×1080</Preset>
            <Preset>1440×900</Preset>
            <Preset>1200×800</Preset>
          </Group>
        </Toolbar>
      </Header1>

      {/* ── Workspace(좌측 비움, 캔버스 고정) ── */}
      <Viewport>
        <StageFrame>
          <Stage style={stageStyle} role="figure" aria-label="Canvas" />
        </StageFrame>
      </Viewport>
    </Root1>
  );
}

/* ===================== Styled (그대로) ===================== */
const Root1 = styled.div`
  height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr; /* 헤더 자동 높이 + 작업영역 */
`;

/* Header: 모든 컨트롤 + 래핑 */
const Header1 = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px) saturate(1.05);
  border-bottom: 1px solid ${T.b1};
`;
const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  padding: 10px ${T.gutter}px;
`;
const Spacer = styled.div`
  flex: 1 1 auto;
`;

const Brand = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 1.6rem;
  color: ${T.ink};
`;
const Badge = styled.span`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, ${T.blue}, ${T.blue2});
  color: #fff;
  font-weight: 900;
  font-size: 1.2rem;
`;

const GroupBase = `
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px; border-radius: 12px; background:#fff; border:1px solid ${T.b1};
`;
const Group = styled.div`
  ${GroupBase}
`;
const GroupSoft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${T.sub};
`;

const Seg = styled.button`
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid transparent;
  font-weight: 800;
  color: ${T.ink};
  transition:
    transform 0.06s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
  &:hover {
    background: #f5f9ff;
    border-color: ${T.blue2};
    box-shadow: 0 0 0 4px ${T.ring};
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Read = styled.span`
  font-size: 1.2rem;
`;
const ReadMono = styled.span`
  min-width: 56px;
  text-align: center;
  font-weight: 900;
  font-size: 1.2rem;
  color: ${T.ink};
  border: 1px dashed ${T.b1};
  border-radius: 8px;
  padding: 0 8px;
  background: #fff;
`;
const Dot = styled.i`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${T.b2};
`;

const Toggle = styled.button`
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid ${T.b1};
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
  i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #cbd5e1;
  }
  &[data-on="true"] {
    background: #f0f7ff;
    border-color: ${T.blue2};
  }
  &[data-on="true"] i {
    background: ${T.blue2};
  }
  &:hover {
    box-shadow: 0 0 0 4px ${T.ring};
    border-color: ${T.blue2};
  }
`;
const Select = styled.select`
  height: 30px;
  padding: 0 10px;
  border: 1px solid ${T.b1};
  border-radius: 999px;
  background: #fff;
  font-size: 1.2rem;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;
  &:focus {
    border-color: ${T.blue2};
    box-shadow: 0 0 0 4px ${T.ring};
    outline: none;
  }
`;

const Field = styled.label`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 6px;
`;
const Label = styled.span`
  width: 22px;
  color: ${T.sub};
  font-size: 1.2rem;
`;
const Input = styled.input`
  height: 30px;
  padding: 0 10px;
  border: 1px solid ${T.b1};
  border-radius: 8px;
  background: #fff;
  font-size: 1.2rem;
  width: 100%;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  &:focus {
    border-color: ${T.blue2};
    box-shadow: 0 0 0 4px ${T.ring};
    outline: none;
  }
`;
const Check = styled.input`
  width: 16px;
  height: 16px;
`;
const CheckLabel = styled.label`
  color: ${T.sub};
  font-size: 1.2rem;
`;
const Preset = styled.button`
  height: 30px;
  padding: 0 12px;
  border: 1px dashed ${T.b1};
  border-radius: 999px;
  background: #fff;
  font-weight: 800;
  font-size: 1.2rem;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.06s ease;
  &:hover {
    border-color: ${T.blue2};
    box-shadow: 0 0 0 4px ${T.ring};
  }
  &:active {
    transform: translateY(1px);
  }
`;

/* Workspace (스타일 그대로) */
const Viewport = styled.div`
  position: relative;
  overflow: auto;
  display: grid;
  place-items: start center;
  height: 100%;
  padding: 40px;

  /* 바깥 ‘워크벤치’는 은은한 배경만 — 보더 X */
  background:
    radial-gradient(
      circle at 16px 16px,
      rgba(2, 6, 23, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(180deg, #f6f8fb 0%, #f0f4fa 100%);
  background-size:
    24px 24px,
    100% 100%;

  /* thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #c5d3e8 transparent;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c5d3e8;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const StageFrame = styled.div`
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(1.05) blur(4px);
  box-shadow:
    0 14px 10px rgba(15, 23, 42, 0.12),
    0 8px 10px rgba(15, 23, 42, 0.06);
`;

const Stage = styled.div`
  background: #fff;
  box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.05);
`;
