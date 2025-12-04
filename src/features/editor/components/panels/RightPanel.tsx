// src/features/editor/components/panels/RightPanel.tsx
"use client";

import * as React from "react";
import { Button, Flex } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { useLayoutActions, useLayoutStore } from "@/shared/store/layout";

import { CanvasViewCard } from "./right/CanvasViewCard";
import { InspectorCard } from "./right/InspectorCard";
import { LayoutCard } from "./right/LayoutCard";

export default function RightPanel() {
  /* -------- editor(view/snap/zoom) -------- */
  const {
    showGrid,
    gridSize,
    gridColor,
    showGuides,
    showRulers,
    snapToGrid,
    snapToGuides,
    snapToElements,
    snapTolerance,
  } = useEDITORStore();
  const {
    setShowGrid,
    setGridSize,
    setGridColor,
    setShowGuides,
    setShowRulers,
    setSnapToGrid,
    setSnapToGuides,
    setSnapToElements,
    setSnapTolerance,
  } = useEDITORActions();

  /* -------- layout(canvas/columns/selection 등) -------- */
  const { selectedIds, sections, insertTool, canvasWidth, canvasHeight } =
    useLayoutStore();
  const {
    setInsertTool,
    setPatchSection,
    setDeleteSelected,
    setDuplicateSelected,
    setAddSection,
    setCommitAfterTransform,
    setApplyColorToSelection,
    setSelectedIds,
    setSections,
    setCanvasSize,
    setLock,
  } = useLayoutActions();

  const actionsAny = useLayoutStore(s => s.actions as any);

  // Canvas size 변경
  const onChangeCanvasW = (v: string) => {
    setCanvasSize(Number(v), canvasHeight);
  };
  const onChangeCanvasH = (v: string) => {
    setCanvasSize(canvasWidth, Number(v));
  };

  // JSON Export / Import
  const [jsonValue, setJsonValue] = React.useState("");
  const [isJsonModalOpen, setIsJsonModalOpen] = React.useState(false);

  const one =
    selectedIds.length === 1
      ? sections.find(s => s.id === selectedIds[0]) || null
      : null;

  const onNum =
    (key: "x" | "y" | "width" | "height" | "rotate" | "radius" | "shadow") =>
    (v: string) => {
      if (!one) return;
      const num = Math.round(Number(v || 0));
      setPatchSection(one.id, { [key]: num } as any);
    };

  const onText =
    (key: "title" | "text" | "btnLabel" | "btnHref" | "imageUrl") =>
    (v: string) => {
      if (!one) return;
      setPatchSection(one.id, { [key]: v });
    };

  // 전체 삭제
  const onClearAll = React.useCallback(() => {
    if (!sections.length) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("모든 컴포넌트를 삭제할까요?")
    )
      return;

    if (typeof actionsAny.clearSections === "function") {
      actionsAny.clearSections();
    } else if (typeof actionsAny.setSections === "function") {
      actionsAny.setSections([]);
    } else {
      setSelectedIds(sections.map(s => s.id));
      setDeleteSelected();
    }

    setSelectedIds([]);
    setCommitAfterTransform?.();
  }, [
    sections,
    actionsAny,
    setSelectedIds,
    setDeleteSelected,
    setCommitAfterTransform,
  ]);

  // 선택 삭제
  const onDeleteSelected = React.useCallback(() => {
    if (!selectedIds.length) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(`선택된 ${selectedIds.length}개 항목을 삭제할까요?`)
    )
      return;
    setDeleteSelected();
    setSelectedIds([]);
    setCommitAfterTransform?.();
  }, [selectedIds, setDeleteSelected, setSelectedIds, setCommitAfterTransform]);

  const hasSelection = selectedIds.length > 0;

  // ===== JSON Export / Import =====
  const onExportJson = React.useCallback(() => {
    const payload = { sections };
    setJsonValue(JSON.stringify(payload, null, 2));
    setIsJsonModalOpen(true);
  }, [sections]);

  const onImportJson = React.useCallback(() => {
    if (!jsonValue.trim()) return;

    try {
      const parsed = JSON.parse(jsonValue);
      const nextSections = Array.isArray(parsed) ? parsed : parsed.sections;

      if (!Array.isArray(nextSections)) {
        throw new Error("sections 배열 형식이 아닙니다.");
      }

      if (
        typeof window !== "undefined" &&
        !window.confirm("현재 레이아웃을 JSON 데이터로 교체할까요?")
      ) {
        return;
      }

      if (typeof actionsAny.setSections === "function") {
        actionsAny.setSections(nextSections);
      } else {
        if (typeof window !== "undefined") {
          window.alert(
            "layout store에 actions.setSections가 없어 JSON import를 사용할 수 없습니다.",
          );
        }
        return;
      }

      setSelectedIds([]);
      setCommitAfterTransform?.();
    } catch (err: any) {
      if (typeof window !== "undefined") {
        window.alert(
          "JSON 파싱에 실패했습니다. 형식을 확인해주세요.\n\n" +
            (err?.message || String(err)),
        );
      }
    }
  }, [jsonValue, actionsAny, setSelectedIds, setCommitAfterTransform]);

  const onCopyJson = React.useCallback(() => {
    if (!jsonValue) return;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(jsonValue)
        .then(() => {
          if (typeof window !== "undefined") {
            window.alert("복사되었습니다.");
          }
          setIsJsonModalOpen(false);
        })
        .catch(() => {
          if (typeof window !== "undefined") {
            window.alert(
              "클립보드 복사에 실패했습니다. 수동으로 복사해주세요.",
            );
          }
        });
    } else if (typeof window !== "undefined") {
      window.alert("클립보드를 사용할 수 없습니다. 수동으로 복사해주세요.");
    }
  }, [jsonValue]);

  const onDownloadJsonFile = React.useCallback(() => {
    try {
      const payload = { sections };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "layout.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert("파일 다운로드 생성에 실패했습니다.");
      }
    }
  }, [sections]);

  // ===== 파일로부터 Import =====
  const onImportFile = React.useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || "");
          const parsed = JSON.parse(text);
          const sections = parsed.sections;

          setSections(sections);

          setJsonValue(JSON.stringify({ sections: sections }, null, 2));
          setSelectedIds([]);
        } catch (err: any) {
          if (typeof window !== "undefined") {
            window.alert(
              "JSON 파일 파싱에 실패했습니다. 형식을 확인해주세요.\n\n" +
                (err?.message || String(err)),
            );
          }
        }
      };
      reader.onerror = () => {
        if (typeof window !== "undefined") {
          window.alert("파일을 읽는 중 오류가 발생했습니다.");
        }
      };
      reader.readAsText(file, "utf-8");
    };
    input.click();
  }, [setSections, setSelectedIds]);

  return (
    <Aside position="right" defaultWidth={340} minWidth={260} maxWidth={560}>
      <CanvasViewCard
        showGrid={showGrid}
        gridSize={gridSize}
        gridColor={gridColor}
        snapToElements={snapToElements}
        snapTolerance={snapTolerance}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        setShowGrid={setShowGrid}
        setGridSize={setGridSize}
        setGridColor={setGridColor}
        setSnapToElements={setSnapToElements}
        setSnapTolerance={setSnapTolerance}
        onChangeCanvasW={onChangeCanvasW}
        onChangeCanvasH={onChangeCanvasH}
      />

      <LayoutCard
        selectedCount={selectedIds.length}
        hasSelection={hasSelection}
        sectionsLength={sections.length}
        insertTool={insertTool}
        setInsertTool={setInsertTool}
        onDuplicateSelected={setDuplicateSelected}
        onDeleteSelected={onDeleteSelected}
        onClearAll={onClearAll}
        onImportFile={onImportFile}
        onDownloadJsonFile={onDownloadJsonFile}
        onOpenJsonModal={onExportJson}
      />

      <InspectorCard
        selectedSection={one}
        setPatchSection={setPatchSection}
        setLock={setLock}
      />
    </Aside>
  );
}
