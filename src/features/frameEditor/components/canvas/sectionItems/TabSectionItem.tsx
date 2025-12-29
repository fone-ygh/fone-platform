// src/features/editor/components/canvas/sectionItems/TabSectionItem.tsx
"use client";

import * as React from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";

import type { TabSection } from "@/shared/store";

type Props = {
  item: TabSection;
};

export default function TabSectionItem({ item }: Props) {
  const tabs = item.tabs?.length
    ? item.tabs
    : [
        { label: "Tab 1", content: "첫 번째 탭" },
        { label: "Tab 2", content: "두 번째 탭" },
      ];

  const [active, setActive] = React.useState(0);

  // Tabs 루트에서 “현재 선택된 탭(aria-selected=true)”를 찾아서 indicator 계산
  const tabsRootRef = React.useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });

  const updateIndicator = React.useCallback(() => {
    const root = tabsRootRef.current;
    if (!root) return;

    const selected = root.querySelector(
      '[role="tab"][aria-selected="true"]',
    ) as HTMLElement | null;

    if (!selected) return;

    setIndicator({
      left: selected.offsetLeft,
      width: selected.offsetWidth,
    });
  }, []);

  React.useLayoutEffect(() => {
    const raf = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(raf);
  }, [active, tabs.length, updateIndicator]);

  return (
    <Box
      sx={{
        p: "2rem", // 전체 패널 여백 크게
        width: "100%",
        height: "100%",
        borderRadius: item.radius ?? 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1.6rem", // 탭/패널 간격 크게
      }}
    >
      <Box sx={{ position: "relative" }} ref={tabsRootRef}>
        <Tabs
          value={active}
          onChange={(_, v) => setActive(v)}
          // MUI 기본 indicator 끔
          TabIndicatorProps={{ sx: { display: "none" } }}
          sx={{
            // 탭 바 자체 엄청 크게
            minHeight: "9rem", // 120px
            "& .MuiTabs-flexContainer": {
              gap: "1.2rem",
            },
            "& .MuiTab-root": {
              // 탭 버튼 엄청 크게
              minHeight: "9rem",
              px: "3rem",
              py: "1rem",
              fontSize: "2.6rem", // 32px
              fontWeight: 900,
              textTransform: "none",
            },
          }}
        >
          {tabs.map((t, i) => (
            <Tab key={`${t.label}-${i}`} label={t.label} value={i} />
          ))}
        </Tabs>

        {/* 커스텀 indicator */}
        <Box
          sx={{
            position: "absolute",
            left: indicator.left,
            width: indicator.width,
            bottom: 0,
            height: "0.5rem", // 인디케이터도 엄청 두껍게 (8px)
            bgcolor: "primary.main",
            borderRadius: 999,
            transition: "left 140ms ease, width 140ms ease",
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* 아래 패널(내용 영역)도 크게 */}
      <Box
        sx={{
          flex: 1,
          p: "2.8rem",
          borderRadius: "2rem",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          overflow: "auto",
        }}
      >
        <p
          style={{
            fontSize: "2.4rem", // 24px
            lineHeight: 1.5,
            fontWeight: 700,
          }}
        >
          {tabs[active]?.content ?? "내용"}
        </p>
      </Box>
    </Box>
  );
}
