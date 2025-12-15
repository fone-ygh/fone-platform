// src/features/editor/components/canvas/sectionItems/TabSectionItem.tsx
"use client";

import React from "react";

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

  const active = 0;

  return (
    <div
      style={{
        padding: 8,
        width: "100%",
        height: "100%",
        borderRadius: item.radius,
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {tabs.map((t, i) => {
          const isActive = active === i;
          return (
            <div
              key={i}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${
                  isActive ? "rgba(25,118,210,.95)" : "rgba(0,0,0,.2)"
                }`,
                background: isActive ? "rgba(25,118,210,.1)" : "transparent",
                fontWeight: isActive ? 800 : 600,
                userSelect: "none",
              }}
            >
              {t.label}
            </div>
          );
        })}
      </div>
      <div style={{ color: "#6b7280", fontSize: 13 }}>
        {tabs[active]?.content ?? "내용"}
      </div>
    </div>
  );
}
