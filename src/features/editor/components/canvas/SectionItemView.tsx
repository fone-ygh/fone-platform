// src/features/editor/components/canvas/SectionItemView.tsx
"use client";

import React, { forwardRef } from "react";
import { Box, Button } from "fone-design-system_v1";

/** purpose → 기본 배경/텍스트 색 매핑 */
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
    case "hero":
      return { bg: "#eff6ff", text: "#0f172a", border: "#bfdbfe" };
    case "card":
      return { bg: "#ffffff", text: "#0f172a", border: "#e5e7eb" };
    case "gallery":
      return { bg: "#ffffff", text: "#0f172a", border: "#e5e7eb" };
    case "cta":
      return { bg: "#1f6feb", text: "#ffffff", border: "#1f6feb" };
    case "emphasis":
      return { bg: "#fde68a", text: "#78350f", border: "#f59e0b" };
    case "success":
      return { bg: "#eafaf1", text: "#065f46", border: "#a7f3d0" };
    case "warning":
      return { bg: "#fff7ed", text: "#7c2d12", border: "#fed7aa" };
    case "danger":
      return { bg: "#fef2f2", text: "#7f1d1d", border: "#fecaca" };
    case "info":
      return { bg: "#eff6ff", text: "#0c4a6e", border: "#bfdbfe" };
    case "neutral":
    default:
      return { bg: "#ffffff", text: "#0f172a", border: "#e5e7eb" };
  }
}

type Props = {
  item: any;
  selected?: boolean;
  onRequestSelect?: (multi: boolean) => void;
};

const SectionItemView = forwardRef<HTMLDivElement, Props>(
  function SectionItemView({ item, selected, onRequestSelect }, ref) {
    /* ---------- 색상 계산(override > autoColor) ---------- */
    const auto = pickAutoColors(item.purpose ?? "neutral");
    const bg = item.bg ?? (item.autoColor !== false ? auto.bg : undefined);
    const textColor =
      item.textColorOverride ??
      (item.autoColor !== false ? auto.text : undefined);
    const borderColor = auto.border;

    /* ---------- 공통 컨테이너 스타일 (부모가 위치/크기/회전 담당) ---------- */
    const common = {
      position: "relative" as const, // ✅ 부모(Box)가 absolute/transform 담당
      width: "100%", // ✅ 부모 크기 채우기
      height: "100%",
      borderRadius: `${item.radius ?? 8}px`,
      overflow: "hidden",
      cursor: "move",
      border: item.type === "box" ? "1px solid rgba(0,0,0,.14)" : undefined,
      outline: selected ? "2px solid rgba(25,118,210,.4)" : "none",
      // background:
      //   item.bg ??
      //   (item.type === "text"
      //     ? "transparent"
      //     : item.type !== "button"
      //       ? "#fff"
      //       : "none"),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as const;

    const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRequestSelect?.(e.shiftKey || e.metaKey || e.ctrlKey);
    };

    /* ========================= 타입별 렌더 ========================= */

    // 1) BOX
    if (item.type === "box") {
      return (
        <Box
          ref={ref}
          className="section-item"
          style={{ ...common, backgroundColor: "#fff" }}
          data-type="box"
          onMouseDown={handleMouseDown}
        >
          {item.title || "Box"}
        </Box>
      );
    }

    // 2) TEXT
    if (item.type === "text") {
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="text"
          style={common}
          onMouseDown={handleMouseDown}
        >
          <div
            style={{
              padding: 8,
              width: "100%",
              color: textColor ?? "inherit",
              fontSize: item.fontSize ?? 16,
              lineHeight: 1.4,
              textAlign: item.textAlign ?? "left",
            }}
          >
            {item.text ?? "텍스트"}
          </div>
        </div>
      );
    }

    // 3) IMAGE
    if (item.type === "image") {
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="image"
          style={{ ...common, backgroundColor: "#fff" }}
          onMouseDown={handleMouseDown}
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: item.objectFit || "cover",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          ) : (
            <div style={{ padding: 8, color: "#6b7280" }}>
              이미지 URL을 입력하세요
            </div>
          )}
        </div>
      );
    }

    // 4) BUTTON
    if (item.type === "button") {
      const isGhost = item.btnVariant === "ghost";
      return (
        <Button
          // ref={ref}
          className="section-item"
          data-type="button"
          onMouseDown={handleMouseDown}
          style={{ ...common }}
          variant="contained"
          sx={{ minWidth: "unset", padding: "unset" }}
        >
          {item.btnLabel || "Button"}
        </Button>
      );
    }

    // 5) LIST
    if (item.type === "list") {
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="list"
          style={{ ...common, backgroundColor: "#fff" }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ padding: 10, width: "100%" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {(item.listItems || ["항목 1", "항목 2"]).map(
                (
                  li:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined,
                  i: React.Key | null | undefined,
                ) => (
                  <li key={i} style={{ lineHeight: 1.6 }}>
                    {li}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      );
    }

    // 6) CARD
    if (item.type === "card") {
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="card"
          style={{ ...common, backgroundColor: "#fff" }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ padding: 10, width: "100%" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              카드 내용 예시 텍스트입니다.
            </div>
          </div>
        </div>
      );
    }

    // 7) GALLERY
    if (item.type === "gallery") {
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="gallery"
          style={{ ...common, backgroundColor: "#fff" }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ padding: 10, width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {new Array(8).fill(0).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(0,0,0,.08)",
                    borderRadius: 6,
                    aspectRatio: "1/1",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 8) TABS
    if (item.type === "tabs") {
      const tabs =
        item.tabs && item.tabs.length
          ? item.tabs
          : [
              { label: "Tab 1", content: "첫 번째 탭" },
              { label: "Tab 2", content: "두 번째 탭" },
              { label: "Tab 3", content: "세 번째 탭" },
            ];
      const active = item.activeTabIndex ?? 0;

      return (
        <div
          ref={ref}
          className="section-item"
          data-type="tabs"
          style={{ ...common, backgroundColor: "#fff" }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ padding: 8, width: "100%", height: "100%" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {tabs.map(
                (
                  t: {
                    label:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<React.AwaitedReactNode>
                      | null
                      | undefined;
                  },
                  i: React.Key | null | undefined,
                ) => {
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
                },
              )}
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {tabs[active]?.content ?? "내용"}
            </div>
          </div>
        </div>
      );
    }

    // 9) ACCORDION
    if (item.type === "accordion") {
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="accordion"
          style={common}
          onMouseDown={handleMouseDown}
        >
          <div style={{ padding: 10, width: "100%" }}>
            {(item.accordion || []).map(
              (
                a: {
                  label:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
                  content:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
                },
                i: React.Key | null | undefined,
              ) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid rgba(0,0,0,.14)",
                    borderRadius: 10,
                    padding: 8,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    {a.label}
                  </div>
                  <div style={{ color: "#6b7280" }}>{a.content}</div>
                </div>
              ),
            )}
          </div>
        </div>
      );
    }

    // 10) PRICING
    if (item.type === "pricing") {
      const plans = item.pricing || [];
      return (
        <div
          ref={ref}
          className="section-item"
          data-type="pricing"
          style={common}
          onMouseDown={handleMouseDown}
        >
          <div
            style={{
              padding: 10,
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {plans.map(
              (
                pr: {
                  highlight: any;
                  name:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
                  price:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
                  features: any[];
                },
                i: React.Key | null | undefined,
              ) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid rgba(0,0,0,.14)",
                    borderRadius: 12,
                    padding: 12,
                    boxShadow: pr.highlight
                      ? "0 10px 28px rgba(0,0,0,.25)"
                      : "none",
                    background: pr.highlight
                      ? "rgba(25,118,210,.08)"
                      : "transparent",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{pr.name}</div>
                  <div style={{ fontSize: 20, margin: "6px 0" }}>
                    {pr.price}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {pr.features.map((f, j) => (
                      <li key={j}>{f}</li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div
        ref={ref}
        className="section-item"
        data-type="unknown"
        style={common}
        onMouseDown={handleMouseDown}
      >
        <div style={{ padding: 8, color: "#6b7280", fontSize: 12 }}>
          {item.title || "Unknown"} (type: {item.type})
        </div>
      </div>
    );
  },
);

export default SectionItemView;
