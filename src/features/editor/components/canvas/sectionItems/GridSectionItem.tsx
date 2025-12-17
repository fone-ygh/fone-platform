// src/features/editor/components/canvas/sectionItems/GridSectionItem.tsx
"use client";

import React from "react";

import { useLayoutStore, type GridSection } from "@/shared/store";
import JspreadSheet from "@/features/table/ui/JspreadSheet";
import { Table2 } from "fone-design-system_v1";
import { useTableSettingStore } from "@/features/table/store/tableSettingStore";

type Props = {
  item: GridSection;
};

export default function GridSectionItem({ item }: Props) {

  const { scopeParentId } = useLayoutStore();
  const { title, checkbox, noDisplay, totalDisplay, plusButtonDisplay, paginationDisplay, tableHeaders } = useTableSettingStore();
  
  console.log("scopeParentId : ", scopeParentId);

  return (
    <div
      style={{
        padding: 8,
        width: "100%",
        lineHeight: 1.4,
        pointerEvents: scopeParentId ? "auto" : "none",
      }}
    >
      {/* Grid 영역 내용 */}
      {scopeParentId && (
        <JspreadSheet />
      )}
      {!scopeParentId && (
        <Table2 isEditView={false} title={title ?? ""} columns={tableHeaders as any} data={[{},{},{},{},{}]} checkbox={checkbox} No={noDisplay} isTotal={totalDisplay} 
        isPlusButton={plusButtonDisplay}
        pagination={paginationDisplay ? { page: 1, size: 10, totalElements: 100, totalPages: 10, onPageChange: (page) => { console.log(page); } } : undefined}
    />
      )}
    </div>
  );
}
