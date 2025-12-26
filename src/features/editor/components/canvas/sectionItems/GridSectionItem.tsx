// src/features/editor/components/canvas/sectionItems/GridSectionItem.tsx
"use client";

import React from "react";
import { Table2 } from "fone-design-system_v1";

import { useTableSettingStore } from "@/features/table/store/tableSettingStore";
import JspreadSheet from "@/features/table/ui/JspreadSheet";
import { useContentLayoutStore, type GridSection } from "@/shared/store";

type Props = {
  item: GridSection;
};

export default function GridSectionItem({ item }: Props) {
  const { scopeParentId } = useContentLayoutStore();
  const {
    title,
    checkbox,
    noDisplay,
    totalDisplay,
    plusButtonDisplay,
    paginationDisplay,
    tableHeaders,
  } = useTableSettingStore();

  return (
    <div
      style={{
        padding: 8,
        width: "100%",
        // height: scopeParentId ? "500px" : "100%",
        height: "500px",
        lineHeight: 1.4,
        pointerEvents: scopeParentId ? "auto" : "none",
      }}
    >
      {/* Grid 영역 내용 */}
      {scopeParentId && <JspreadSheet />}
      {!scopeParentId && (
        <Table2
          isEditView={false}
          title={title ?? ""}
          columns={tableHeaders as any}
          data={[{}, {}, {}, {}, {}]}
          checkbox={checkbox}
          No={noDisplay}
          isTotal={totalDisplay}
          isPlusButton={plusButtonDisplay}
          pagination={
            paginationDisplay
              ? {
                  page: 1,
                  size: 10,
                  totalElements: 100,
                  totalPages: 10,
                  onPageChange: page => {
                    console.log(page);
                  },
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
