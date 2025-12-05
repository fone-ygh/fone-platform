"use client";

import React, { forwardRef, useMemo, useState } from "react"; // ✅ useState 추가
import { Box } from "fone-design-system_v1";

import type {
  GridSection,
  SearchSection,
  Section,
  SingleSection,
  TabSection,
} from "@/shared/store";

type Props = {
  item: TabSection | GridSection | SingleSection | SearchSection;
  selected?: boolean;
  preview?: boolean;
  onRequestSelect?: (multi: boolean) => void;
};

const SectionItemView = forwardRef<HTMLDivElement, Props>(
  function SectionItemView(
    { item, selected, preview = false, onRequestSelect },
    ref,
  ) {
    const [hovered, setHovered] = useState(false); // 👈 추가

    const bg = item.bg;
    const textColor = item.color;

    const common: React.CSSProperties = useMemo(
      () => ({
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: `${item.radius ?? 8}px`,
        overflow: "hidden",
        cursor: preview ? "default" : "move",
        outline:
          hovered && !preview
            ? "4px solid rgba(25,118,210,.6)"
            : selected
              ? "3px solid rgba(25,118,210,.6)"
              : selected && hovered && !preview
                ? "4px solid rgba(25,118,210,.6)"
                : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg ? bg : "#fff",
        color: textColor,

        userSelect: "none",
      }),
      [item.radius, selected, preview, bg, textColor, hovered],
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      if (preview) return;
      e.stopPropagation();
      onRequestSelect?.(e.shiftKey || e.metaKey || e.ctrlKey);
    };

    // ----- 타입별 content는 그대로 -----
    let content: React.ReactNode = null;

    switch (item.type) {
      case "search": {
        content = (
          <Box
            style={{
              padding: 8,
              width: "100%",
              textAlign: "center",
              borderRadius: item.radius || "unset",
            }}
          >
            {item.title || "Box"}
          </Box>
        );
        break;
      }
      case "single": {
        content = (
          <div
            style={{
              padding: 8,
              width: "100%",
              lineHeight: 1.4,
            }}
          >
            {"single"}
          </div>
        );
        break;
      }
      case "grid": {
        content = (
          <div
            style={{
              padding: 8,
              width: "100%",
              lineHeight: 1.4,
            }}
          >
            {"grid"}
          </div>
        );
        break;
      }
      case "tab": {
        const tabs = item.tabs?.length
          ? item.tabs
          : [
              { label: "Tab 1", content: "첫 번째 탭" },
              { label: "Tab 2", content: "두 번째 탭" },
            ];
        const active = 0;
        content = (
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
                      background: isActive
                        ? "rgba(25,118,210,.1)"
                        : "transparent",
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
        break;
      }
      default: {
        content = (
          <div style={{ padding: 8, color: "#6b7280", fontSize: 12 }} />
        );
      }
    }

    return (
      <div
        ref={ref}
        className="section-item"
        data-type={item.type}
        style={common}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => !preview && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </div>
    );
  },
);
export default SectionItemView;
