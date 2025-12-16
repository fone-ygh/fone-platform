// src/features/editor/components/canvas/sectionItems/GridSectionItem.tsx
"use client";

import React from "react";

import JspreadSheet from "@/features/table/ui/JspreadSheet";
import type { GridSection } from "@/shared/store";
import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { EDITOR_MODE } from "@/shared/store/control/editorMode"; // 네가 만든 위치로 맞춰

type Props = {
  item: GridSection;
};

export default function GridSectionItem({ item }: Props) {
  const { setEditorMode } = useEDITORActions(); // store에 추가했다고 가정
  const editorMode = useEDITORStore(s => s.editorMode);
  console.log("editorMode : ", editorMode);
  const sectionId = item.id;

  const isEditingThis =
    editorMode.kind === "contentEdit" && editorMode.sectionId === sectionId;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* ✅ "시트 영역" (여기서만 contentEdit 진입) */}
      <div
        tabIndex={-1} // ⭐️ blur/focus 추적하려면 필수
        data-sheet-surface
        style={{ width: "100%", height: "100%", outline: "none" }}
        onPointerDownCapture={e => {
          // 시트쪽 클릭하면: contentEdit
          // (Moveable 드래그보다 먼저 잡기 위해 capture 유지)
          setEditorMode(
            EDITOR_MODE.contentEdit(sectionId, "sheet", "dblclick"),
          );

          // 포커스 추적을 위해 래퍼에 포커스를 강제로 둠
          // (그래야 blur로 "밖으로 나갔는지" 판단 가능)
          (e.currentTarget as HTMLDivElement).focus();
        }}
        onBlurCapture={e => {
          // 래퍼에서 포커스가 빠질 때, "여전히 내 안으로 이동"이면 무시
          const next = e.relatedTarget as HTMLElement | null;
          if (next && e.currentTarget.contains(next)) return;

          // 진짜로 바깥으로 나갔으면 idle
          if (isEditingThis) setEditorMode(EDITOR_MODE.idle());
        }}
      >
        <JspreadSheet />
      </div>
    </div>
  );
}
