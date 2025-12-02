// src/features/editor/components/canvas/SectionItemView.tsx
"use client";

/* eslint-disable @next/next/no-img-element */
import React, { forwardRef, useMemo } from "react";
import { Box, Button, Tabs } from "fone-design-system_v1";

import type { Section } from "@/shared/store"; // ← 네 환경에 맞춰 경로 유지

/** purpose → 기본 배경/텍스트/보더 색 매핑 */
function pickAutoColors(purpose: string) {
  switch (purpose) {
    case "header":
      return { bg: "#f1f5ff", text: "#0f172a", border: "#c7d2fe" };
    case "sidebar":
      return { bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0" };
    case "main":
      return { bg: "#ffffff", text: "#0f172a", border: "#e5e7eb" };
    case "footer":
      return { bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0" };

    default:
      return { bg: "#ffffff", text: "#0f172a", border: "#e5e7eb" };
  }
}

type Props = {
  item: Section;
  selected?: boolean;
  /** 프리뷰(Insert 가이드) 용일 때 true면 커서/선택 동작 비활성 */
  preview?: boolean;
  onRequestSelect?: (multi: boolean) => void;
};

const SectionItemView = forwardRef<HTMLDivElement, Props>(
  function SectionItemView(
    { item, selected, preview = false, onRequestSelect },
    ref,
  ) {
    // —— 색상 계산: item.bg / item.color가 우선, 없으면 purpose 기반 자동색 —— //
    const auto = useMemo(
      () => pickAutoColors(item.purpose ?? "neutral"),
      [item.purpose],
    );
    const bg = item.bg ?? auto.bg;
    const textColor = item.color ?? auto.text;

    // —— 공통 컨테이너 스타일(부모가 위치/크기/회전 담당) —— //
    const common: React.CSSProperties = useMemo(
      () => ({
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: `${item.radius ?? 8}px`,
        overflow: "hidden",
        cursor: preview ? "default" : "move",
        outline: selected ? "2px solid rgba(25,118,210,.4)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        color: textColor,
        // box 타입만 기본 보더 (원하면 다른 타입에도 적용 가능)
        // border: item.type === "box" ? `1px solid ${auto.border}` : undefined,
        userSelect: "none",
      }),
      [item.radius, item.type, selected, preview, bg, textColor],
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      if (preview) return; // 프리뷰면 선택 동작 비활성
      e.stopPropagation();
      onRequestSelect?.(e.shiftKey || e.metaKey || e.ctrlKey);
    };

    // —— 타입별 콘텐츠 —— //
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
              textAlign: item.textAlign ?? "left",
              lineHeight: 1.4,
            }}
          >
            {item.text ?? "텍스트"}
          </div>
        );
        break;
      }

      case "grid": {
        content = item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title ?? "image"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: item.objectFit || "cover",
              pointerEvents: "none",
            }}
            draggable={false}
          />
        ) : (
          <div style={{ padding: 8, color: "#6b7280" }}>
            이미지 URL을 입력하세요
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
        // activeTabIndex 필드가 타입에 없으므로 항상 0번째 표시
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
        // 타입 정의에 없는 케이스는 안전하게 Fallback
        content = (
          <div style={{ padding: 8, color: "#6b7280", fontSize: 12 }}>
            {item.title || "Unknown"} (type: {String(item.type)})
          </div>
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
      >
        {content}
      </div>
    );
  },
);

export default SectionItemView;
