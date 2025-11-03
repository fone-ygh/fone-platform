"use client";

import React from "react";
import styled from "@emotion/styled";
import {
  Accordion,
  Button,
  Checkbox,
  Flex,
  Switch,
  Tabs,
} from "fone-design-system_v1";

import { AccordionCard } from "@/shared/ui/cardAccordion/CardAccordion";

import ComponentArea from "./components/ComponentArea";
import SettingArea from "./components/SettingArea";

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

  return (
    <Container>
      <Flex
        justifyContent="space-between"
        sx={{ width: "100%", height: "100%" }}
      >
        <ComponentArea />
        {/* ── Workspace(좌측 비움, 캔버스 고정) ── */}
        <Viewport>
          <StageFrame>
            <Stage
              style={{
                width: 1200,
                height: 800,
                backgroundImage: gridBg(16),
                backgroundSize: `16px 16px`,
                backgroundPosition: "0 0",
              }}
              role="figure"
              aria-label="Canvas"
            />
          </StageFrame>
        </Viewport>
        <SettingArea />
      </Flex>
    </Container>
  );
}

/* ===================== Styled (그대로) ===================== */
export const Container = styled.div`
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
  height: 100dvh;
`;

/* Workspace (스타일 그대로) */
const Viewport = styled.div`
  position: relative;
  overflow: auto;
  display: grid;
  place-items: start center;
  height: 100%;
  padding: 2rem;

  /* 바깥 ‘워크벤치’는 은은한 배경만 — 보더 X */

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
