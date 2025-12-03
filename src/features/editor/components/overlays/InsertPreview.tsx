// src/features/editor/components/canvas/InsertPreview.tsx
"use client";

import * as React from "react";

import type {
  GridSection,
  SearchSection,
  Section,
  SingleSection,
  TabSection,
} from "@/shared/store/layout/types";

import SectionItemView from "../canvas/SectionItemView";

type DragRect = { x: number; y: number; w: number; h: number; on?: boolean };

export default function InsertPreview({
  tool,
  rect,
}: {
  tool: Section["type"];
  rect: DragRect;
}) {
  // if (!rect.on || rect.w <= 0 || rect.h <= 0) return null;

  // 1) 프리뷰용 섹션 객체 만들기 (타입 1곳에서만 관리)
  const preview: TabSection | GridSection | SingleSection | SearchSection =
    React.useMemo(() => {
      const base = {
        id: "__preview__",
        type: tool,
        x: rect.x,
        y: rect.y,
        width: rect.w,
        height: rect.h,
        title: tool[0].toUpperCase() + tool.slice(1),
      } as const;

      switch (tool) {
        case "search":
          return {
            ...base,
          } as SearchSection;

        case "single":
          return {
            ...base,
          } as SingleSection;

        case "grid":
          return {
            ...base,
          } as GridSection;

        case "tab":
          return {
            ...base,
            tabs: [
              { label: "Tab 1", content: "첫 번째" },
              { label: "Tab 2", content: "두 번째" },
            ],
          } as TabSection;
        case "single":
        default:
          return { ...base } as SingleSection;
      }
    }, [tool, rect.x, rect.y, rect.w, rect.h]);

  // 2) 오버레이 컨테이너 (이 레이어는 마우스 이벤트 막기)
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        pointerEvents: "none",
        opacity: 0.7,
        border: "1px solid #0075F6",
      }}
    >
      <SectionItemView item={preview} selected={false} preview />
    </div>
  );
}
