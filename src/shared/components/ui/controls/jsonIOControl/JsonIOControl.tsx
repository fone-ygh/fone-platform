"use client";

import { useRef } from "react";
import { Button, Flex } from "fone-design-system_v1";

import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { SmallNoteStyle } from "@/shared/styles/control";

export default function JsonIOControl() {
  const {
    canvasZoom,
    canvasWidth,
    canvasHeight,
    showGrid,
    gridSize,
    gridColor,
    snapToGrid,
    snapToGuides,
    snapToElements,
    snapTolerance,
    showRulers,
    showGuides,
  } = useEDITORStore();

  const {
    setCanvasWidth,
    setCanvasHeight,
    setCanvasZoom,
    setShowGrid,
    setGridSize,
    setGridColor,
    setSnapToGrid,
    setSnapToGuides,
    setSnapToElements,
    setSnapTolerance,
    setShowRulers,
    setShowGuides,
  } = useEDITORActions();
  const fileRef = useRef<HTMLInputElement>(null);

  const currentSettings = {
    canvas: { width: canvasWidth, height: canvasHeight },
    canvasZoom,
    grid: { show: showGrid, size: gridSize, color: gridColor },
    snap: {
      toGrid: snapToGrid,
      toGuides: snapToGuides,
      toElements: snapToElements,
      tolerance: snapTolerance,
    },
    guides: { rulers: showRulers, show: showGuides },
    _meta: { exportedAt: new Date().toISOString() },
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(currentSettings ?? {}, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "layout-settings.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openImport = () => fileRef.current?.click();
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (data?.canvas) {
          if (typeof data.canvas.width === "number")
            setCanvasWidth(data.canvas.width);
          if (typeof data.canvas.height === "number")
            setCanvasHeight(data.canvas.height);
        }
        if (typeof data?.canvasZoom === "number")
          setCanvasZoom(data.canvasZoom); // store 내부에서 clamp 처리
        if (data?.grid) {
          if (typeof data.grid.show === "boolean") setShowGrid(data.grid.show);
          if (typeof data.grid.size === "number") setGridSize(data.grid.size);
          if (typeof data.grid.color === "string")
            setGridColor(data.grid.color);
        }
        if (data?.snap) {
          if (typeof data.snap.toGrid === "boolean")
            setSnapToGrid(data.snap.toGrid);
          if (typeof data.snap.toGuides === "boolean")
            setSnapToGuides(data.snap.toGuides);
          if (typeof data.snap.toElements === "boolean")
            setSnapToElements(data.snap.toElements);
          if (typeof data.snap.tolerance === "number")
            setSnapTolerance(data.snap.tolerance);
        }
        if (data?.guides) {
          if (typeof data.guides.rulers === "boolean")
            setShowRulers(data.guides.rulers);
          if (typeof data.guides.show === "boolean")
            setShowGuides(data.guides.show);
        }
        console.log("Imported:", data);
      } catch (err) {
        console.error("Invalid JSON", err);
        alert("불러오기에 실패했어. JSON 형식을 확인해줘.");
      } finally {
        e.currentTarget.value = "";
      }
    };
    reader.readAsText(f);
  };

  return (
    <div>
      <Flex spacing=".8rem">
        <Button size="xsmall" variant="outlined" onClick={exportJSON}>
          내보내기
        </Button>
        <Button size="xsmall" variant="outlined" onClick={openImport}>
          불러오기
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={onImport}
          style={{ display: "none" }}
        />
      </Flex>
      <SmallNoteStyle style={{ marginTop: ".6rem" }}>
        현재 상태를 JSON으로 저장/복원할 수 있습니다.
      </SmallNoteStyle>
    </div>
  );
}
