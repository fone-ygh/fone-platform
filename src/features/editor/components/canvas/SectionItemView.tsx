// src/features/editor/components/canvas/SectionItemView.tsx
"use client";

import React, { forwardRef, useMemo, useState } from "react";

import type {
  AnySection,
  GridSection,
  SearchSection,
  SingleSection,
  TabSection,
} from "@/shared/store";
import { useLayoutStore } from "@/shared/store";

import GridSectionItem from "./sectionItems/GridSectionItem";
import SearchSectionItem from "./sectionItems/SearchSectionItem";
import SingleSectionItem from "./sectionItems/SingleSectionItem";
import TabSectionItem from "./sectionItems/TabSectionItem";

type Props = {
  item: TabSection | GridSection | SingleSection | SearchSection;
  selected?: boolean;
  /** 프리뷰(Insert 가이드) 용이면 true → 커서/선택 비활성화 */
  preview?: boolean;
  onRequestSelect?: (multi: boolean) => void;
};

const SectionItemView = forwardRef<HTMLDivElement, Props>(
  function SectionItemView(
    { item, selected, preview = false, onRequestSelect },
    ref,
  ) {
    const [hovered, setHovered] = useState(false);

    const bg = item.bg;
    const textColor = item.color;
    const isLocked = !!item.lock;

    const { insertTool } = useLayoutStore();

    /** 테두리 스타일: lock 상태까지 반영 */
    const outline = useMemo(() => {
      if (preview) return "none";

      // 잠긴 상태
      if (isLocked) {
        if (selected) {
          return "2px solid rgba(25,118,210,.9)";
        }

        return "none";
      }

      // 잠겨 있지 않은 상태
      if (hovered) return "4px solid rgba(25,118,210,.7)";
      if (selected) return "2px solid rgba(25,118,210,.9)";
      return "none";
    }, [preview, isLocked, hovered, selected]);

    const common: React.CSSProperties = useMemo(
      () => ({
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: `${item.radius ?? 8}px`,
        overflow: "hidden",
        cursor: preview
          ? "default"
          : insertTool
            ? "crosshair"
            : isLocked
              ? "default"
              : "move",
        outline,
        display: "flex",
        // alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg ?? "#fff",
        color: textColor,
        userSelect: "none",
      }),
      [item.radius, preview, isLocked, outline, bg, textColor, insertTool],
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      console.log("handleMouseDown", e.shiftKey , e.metaKey , e.ctrlKey)
      if (preview) return;
      // 잠겨있으면 선택불가
      if (isLocked) return;

      e.stopPropagation();
      onRequestSelect?.(e.shiftKey || e.metaKey || e.ctrlKey);
    };

    // ---- 타입별 렌더링 ----
    const renderContent = () => {
      switch (item.type) {
        case "search":
          return <SearchSectionItem item={item as SearchSection} />;
        case "single":
          return <SingleSectionItem item={item as SingleSection} />;
        case "grid":
          return <GridSectionItem item={item as GridSection} />;
        case "tab":
          return <TabSectionItem item={item as TabSection} />;
        default:
          return <div style={{ padding: 8, color: "#6b7280", fontSize: 12 }} />;
      }
    };

    return (
      <div
        ref={ref}
        className="section-item"
        data-type={item.type}
        style={common}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => !preview && !isLocked && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {renderContent()}
      </div>
    );
  },
);

export default SectionItemView;
