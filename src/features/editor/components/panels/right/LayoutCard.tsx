// src/features/editor/components/panels/right/LayoutCard.tsx
"use client";

import React from "react";
import { Button, Flex } from "fone-design-system_v1";

import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import type { InsertTool } from "@/shared/store/layout/types";

interface LayoutCardProps {
  selectedCount: number;
  hasSelection: boolean;
  sectionsLength: number;
  insertTool: InsertTool;
  setInsertTool: (tool: InsertTool | null) => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onImportFile: () => void;
  onDownloadJsonFile: () => void;
}

export const LayoutCard: React.FC<LayoutCardProps> = props => {
  const {
    selectedCount,
    hasSelection,
    sectionsLength,
    insertTool,
    setInsertTool,
    onDuplicateSelected,
    onDeleteSelected,
    onClearAll,
    onImportFile,
    onDownloadJsonFile,
  } = props;

  return (
    <AccordionCard
      title="Layout"
      allowMultiple
      defaultOpenAll
      hideControls
      items={[
        {
          id: "selection-summary",
          title: "Selection",
          content: (
            <div className="card-body">
              <Flex flexDirection="column" gap={1}>
                <div>Selected: {selectedCount}</div>
                <Flex spacing={1}>
                  <Button
                    variant="outlined"
                    size="xsmall"
                    onClick={onDuplicateSelected}
                    disabled={!hasSelection}
                  >
                    복사하기
                  </Button>
                  <Button
                    variant="contained"
                    size="xsmall"
                    onClick={onDeleteSelected}
                    disabled={!hasSelection}
                  >
                    삭제
                  </Button>
                  <Button
                    onClick={onClearAll}
                    disabled={!sectionsLength}
                    color="#b91c1c"
                    title="모든 컴포넌트를 삭제"
                    variant="contained"
                    size="xsmall"
                  >
                    전체삭제
                  </Button>
                </Flex>
              </Flex>
            </div>
          ),
        },
        {
          id: "draw-components",
          title: "Draw Components",
          content: (
            <div className="card-body">
              <div
                className="row"
                style={{
                  display: "grid",
                  gap: 8,
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                }}
              >
                <Button
                  variant={insertTool === "search" ? "contained" : "outlined"}
                  size="xsmall"
                  onClick={() =>
                    setInsertTool(insertTool === "search" ? null : "search")
                  }
                >
                  search
                </Button>
                <Button
                  variant={insertTool === "single" ? "contained" : "outlined"}
                  size="xsmall"
                  onClick={() =>
                    setInsertTool(insertTool === "single" ? null : "single")
                  }
                >
                  single
                </Button>
                <Button
                  variant={insertTool === "grid" ? "contained" : "outlined"}
                  size="xsmall"
                  onClick={() =>
                    setInsertTool(insertTool === "grid" ? null : "grid")
                  }
                >
                  grid
                </Button>
                <Button
                  variant={insertTool === "tab" ? "contained" : "outlined"}
                  size="xsmall"
                  onClick={() =>
                    setInsertTool(insertTool === "tab" ? null : "tab")
                  }
                >
                  tab
                </Button>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "#6b7280",
                }}
              >
                툴을 선택한 뒤 캔버스에서 드래그하면 해당 컴포넌트가 생성됩니다.
                (생성 후에는 자동으로 선택 모드로 돌아갑니다)
              </div>
            </div>
          ),
        },
        {
          id: "json-file",
          title: "JSON File Import / Export",
          content: (
            <Flex flexDirection="column" gap={1}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                레이아웃을 JSON으로 내보내거나 가져옵니다.
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  gap: 8,
                }}
              >
                <Button
                  variant="outlined"
                  size="xsmall"
                  style={{ flex: 1 }}
                  onClick={onImportFile}
                >
                  Import
                </Button>
                <Button
                  variant="outlined"
                  size="xsmall"
                  style={{ flex: 1 }}
                  onClick={onDownloadJsonFile}
                >
                  Export
                </Button>
              </div>
            </Flex>
          ),
        },
      ]}
    />
  );
};
