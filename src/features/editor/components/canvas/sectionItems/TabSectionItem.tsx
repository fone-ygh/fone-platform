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

  //  Tabs 루트에서 “현재 선택된 탭(aria-selected=true)”를 찾아서 indicator 계산
  const tabsRootRef = React.useRef<HTMLDivElement | null>(null);

  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });

  const updateIndicator = React.useCallback(() => {
    const root = tabsRootRef.current;
    if (!root) return;

    const selected = root.querySelector(
      '[role="tab"][aria-selected="true"]',
    ) as HTMLElement | null;

    if (!selected) return;

    //  offsetLeft/offsetWidth는 transform scale 영향 없이 “레이아웃 기준”이라 줌에서도 안정적
    setIndicator({
      left: selected.offsetLeft,
      width: selected.offsetWidth,
    });
  }, []);

  React.useLayoutEffect(() => {
    //  active가 바뀐 뒤 DOM이 갱신된 다음 프레임에 indicator 업데이트
    const raf = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(raf);
  }, [active, tabs.length, updateIndicator]);

  return (
    <Box
      sx={{
        p: 1,
        width: "100%",
        height: "100%",
        borderRadius: item.radius ?? 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ position: "relative" }} ref={tabsRootRef}>
        <Tabs
          value={active}
          onChange={(_, v) => setActive(v)}
          //  MUI 기본 indicator 끔
          TabIndicatorProps={{ sx: { display: "none" } }}
          sx={{
            minHeight: 36,
            "& .MuiTab-root": {
              minHeight: 36,
              px: 1.25,
              py: 0.5,
              fontWeight: 700,
              textTransform: "none",
            },
          }}
        >
          {tabs.map((t, i) => (
            <Tab key={`${t.label}-${i}`} label={t.label} value={i} />
          ))}
        </Tabs>

        {/*  커스텀 indicator */}
        <Box
          sx={{
            position: "absolute",
            left: indicator.left,
            width: indicator.width,
            bottom: 0,
            height: 2,
            bgcolor: "primary.main",
            borderRadius: 999,
            transition: "left 140ms ease, width 140ms ease",
            pointerEvents: "none",
          }}
        />
      </Box>

      <Box sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {tabs[active]?.content ?? "내용"}
        </Typography>
      </Box>
    </Box>
  );
}
