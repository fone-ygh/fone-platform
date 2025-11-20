// src/features/editor/components/panels/RightPanel.tsx
"use client";

import * as React from "react";
import { Button, Flex, Label, TextField2 } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import { useLayoutActions, useLayoutStore } from "@/shared/store/layout";

/**
 * 오른쪽 패널 (Inspector)
 * - 단일 선택 시: 속성 편집 섹션(Accordion)
 * - 다중/없음: 요약/액션만
 * - selector는 전부 단일 호출
 */
export default function RightPanel() {
  const { selectedIds, sections, insertTool } = useLayoutStore();
  const {
    setInsertTool,
    setPatchSection,
    setDeleteSelected,
    setDuplicateSelected,
    setAddSection,
    setCommitAfterTransform,
    setApplyColorToSelection,
    setSelectedIds,
  } = useLayoutActions();

  const actionsAny = useLayoutStore(s => s.actions as any);

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

  const onSelect =
    (key: "textAlign" | "btnVariant" | "objectFit" | "purpose") =>
    (v: string) => {
      if (!one) return;
      setPatchSection(one.id, { [key]: v as any });
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

  return (
    <Aside position="right" defaultWidth={340} minWidth={260} maxWidth={560}>
      {/* ===== Selection Summary & Actions ===== */}
      <AccordionCard
        title="Selection"
        allowMultiple
        defaultOpenAll
        hideControls
        items={[
          {
            id: "summary",
            title: "Summary",
            content: (
              <div className="card-body">
                <Flex flexDirection="column" gap={1}>
                  <div>Selected: {selectedIds.length}</div>
                  <Flex spacing={1}>
                    <Button
                      variant="outlined"
                      size="xsmall"
                      onClick={() => setDuplicateSelected()}
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
                      disabled={!sections.length}
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
        ]}
      />

      {/* ===== 드래그로 그리는 Insert Tool 선택 ===== */}
      <AccordionCard
        title="Draw Components"
        allowMultiple
        defaultOpenAll
        hideControls
        items={[
          {
            id: "draw",
            title: "캔버스에서 드래그로 생성",
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
                    variant={insertTool === "box" ? "contained" : "outlined"}
                    size="xsmall"
                    onClick={() =>
                      setInsertTool(insertTool === "box" ? null : "box")
                    }
                  >
                    Box
                  </Button>
                  <Button
                    variant={insertTool === "button" ? "contained" : "outlined"}
                    size="xsmall"
                    onClick={() =>
                      setInsertTool(insertTool === "button" ? null : "button")
                    }
                  >
                    Button
                  </Button>
                  <Button
                    variant={insertTool === "tabs" ? "contained" : "outlined"}
                    size="xsmall"
                    onClick={() =>
                      setInsertTool(insertTool === "tabs" ? null : "tabs")
                    }
                  >
                    Tabs
                  </Button>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  툴을 선택한 뒤 캔버스에서 드래그하면 해당 컴포넌트가
                  생성됩니다. (생성 후에는 자동으로 선택 모드로 돌아갑니다)
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* ===== JSON Export / Import 버튼 (모달 오픈) ===== */}
      <AccordionCard
        title="JSON"
        allowMultiple
        defaultOpenAll
        hideControls
        items={[
          {
            id: "json",
            title: "Export / Import",
            content: (
              <Flex flexDirection="column" gap={1}>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  레이아웃을 JSON으로 내보내거나 가져옵니다.
                </div>
                <Button
                  variant="outlined"
                  size="xsmall"
                  onClick={() => {
                    onExportJson();
                    setIsJsonModalOpen(true);
                  }}
                >
                  JSON Export / Import 열기
                </Button>
              </Flex>
            ),
          },
        ]}
      />

      {/* ===== Inspector (single selection) ===== */}
      {one && (
        <>
          {/* Basic */}
          <AccordionCard
            title="Basic"
            allowMultiple
            defaultOpenAll
            hideControls
            items={[
              {
                id: "basic-title",
                title: "Title",
                content: (
                  <div className="card-body">
                    <div className="row" style={{ display: "grid", gap: 8 }}>
                      <Label>Title</Label>
                      <TextField2
                        value={one.title || ""}
                        onChange={e => onText("title")(e.target.value)}
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: "basic-geometry",
                title: "Position & Size",
                content: (
                  <div className="card-body">
                    <div
                      className="row"
                      style={{
                        display: "grid",
                        gap: 8,
                        gridTemplateColumns: "1fr 1fr",
                      }}
                    >
                      <Label>X</Label>
                      <TextField2
                        type="number"
                        value={one.x}
                        onChange={e => onNum("x")(e.target.value)}
                      />
                      <Label>Y</Label>
                      <TextField2
                        type="number"
                        value={one.y}
                        onChange={e => onNum("y")(e.target.value)}
                      />
                      <Label>W</Label>
                      <TextField2
                        type="number"
                        value={one.width}
                        onChange={e => onNum("width")(e.target.value)}
                      />
                      <Label>H</Label>
                      <TextField2
                        type="number"
                        value={one.height}
                        onChange={e => onNum("height")(e.target.value)}
                      />
                      <Label>Rotate</Label>
                      <TextField2
                        type="number"
                        value={one.rotate ?? 0}
                        onChange={e => onNum("rotate")(e.target.value)}
                      />
                      <Label>Radius</Label>
                      <TextField2
                        type="number"
                        value={one.radius ?? 8}
                        onChange={e => onNum("radius")(e.target.value)}
                      />
                      <Label>Shadow</Label>
                      <TextField2
                        type="number"
                        value={one.shadow ?? 0}
                        onChange={e => onNum("shadow")(e.target.value)}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />

          {/* Type specific */}
          {one.type === "text" && (
            <AccordionCard
              title="Text"
              allowMultiple
              defaultOpenAll
              hideControls
              items={[
                {
                  id: "text-content",
                  title: "Content",
                  content: (
                    <div className="card-body">
                      <div className="row" style={{ display: "grid", gap: 8 }}>
                        <Label>Text</Label>
                        <TextField2
                          value={one.text || ""}
                          onChange={e => onText("text")(e.target.value)}
                        />
                      </div>
                      <div
                        className="row"
                        style={{ display: "grid", gap: 8, marginTop: 10 }}
                      >
                        <Label>Align</Label>
                        <select
                          value={one.textAlign ?? "left"}
                          onChange={e => onSelect("textAlign")(e.target.value)}
                          style={{
                            height: 28,
                            fontSize: 12,
                            padding: "2px 6px",
                          }}
                        >
                          <option value="left">left</option>
                          <option value="center">center</option>
                          <option value="right">right</option>
                        </select>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          )}

          {one.type === "image" && (
            <AccordionCard
              title="Image"
              allowMultiple
              defaultOpenAll
              hideControls
              items={[
                {
                  id: "image-props",
                  title: "Source / Fit",
                  content: (
                    <div className="card-body">
                      <div className="row" style={{ display: "grid", gap: 8 }}>
                        <Label>URL</Label>
                        <TextField2
                          value={one.imageUrl || ""}
                          onChange={e => onText("imageUrl")(e.target.value)}
                        />
                      </div>
                      <div
                        className="row"
                        style={{ display: "grid", gap: 8, marginTop: 10 }}
                      >
                        <Label>ObjectFit</Label>
                        <select
                          value={one.objectFit ?? "cover"}
                          onChange={e => onSelect("objectFit")(e.target.value)}
                          style={{
                            height: 28,
                            fontSize: 12,
                            padding: "2px 6px",
                          }}
                        >
                          <option value="cover">cover</option>
                          <option value="contain">contain</option>
                          <option value="fill">fill</option>
                        </select>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          )}

          {one.type === "button" && (
            <AccordionCard
              title="Button"
              allowMultiple
              defaultOpenAll
              hideControls
              items={[
                {
                  id: "button-props",
                  title: "Label / Link / Variant",
                  content: (
                    <div className="card-body">
                      <div className="row" style={{ display: "grid", gap: 8 }}>
                        <Label>Label</Label>
                        <TextField2
                          value={one.btnLabel || ""}
                          onChange={e => onText("btnLabel")(e.target.value)}
                        />
                      </div>
                      <div
                        className="row"
                        style={{ display: "grid", gap: 8, marginTop: 10 }}
                      >
                        <Label>Href</Label>
                        <TextField2
                          value={one.btnHref || ""}
                          onChange={e => onText("btnHref")(e.target.value)}
                        />
                      </div>
                      <div
                        className="row"
                        style={{ display: "grid", gap: 8, marginTop: 10 }}
                      >
                        <Label>Variant</Label>
                        <select
                          value={one.btnVariant ?? "solid"}
                          onChange={e => onSelect("btnVariant")(e.target.value)}
                          style={{
                            height: 28,
                            fontSize: 12,
                            padding: "2px 6px",
                          }}
                        >
                          <option value="solid">solid</option>
                          <option value="ghost">ghost</option>
                        </select>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          )}

          {/* Appearance */}
          <AccordionCard
            title="Appearance"
            allowMultiple
            defaultOpenAll
            hideControls
            items={[
              {
                id: "appearance-purpose",
                title: "Purpose / Colors",
                content: (
                  <div className="card-body">
                    <div className="row" style={{ display: "grid", gap: 8 }}>
                      <Label>Purpose</Label>
                      <select
                        value={one.purpose ?? "neutral"}
                        onChange={e => onSelect("purpose")(e.target.value)}
                        style={{
                          height: 28,
                          fontSize: 12,
                          padding: "2px 6px",
                        }}
                      >
                        {[
                          "neutral",
                          "header",
                          "sidebar",
                          "main",
                          "footer",
                          "hero",
                          "card",
                          "gallery",
                          "cta",
                          "emphasis",
                          "success",
                          "warning",
                          "danger",
                          "info",
                        ].map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      className="row"
                      style={{ display: "grid", gap: 8, marginTop: 10 }}
                    >
                      <Label>Set BG</Label>
                      <input
                        type="color"
                        onChange={e =>
                          setApplyColorToSelection(e.target.value, "bg")
                        }
                        style={{
                          width: 32,
                          height: 28,
                          padding: 0,
                          border: 0,
                        }}
                      />
                      <Label>Set Text</Label>
                      <input
                        type="color"
                        onChange={e =>
                          setApplyColorToSelection(e.target.value, "text")
                        }
                        style={{
                          width: 32,
                          height: 28,
                          padding: 0,
                          border: 0,
                        }}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </>
      )}

      {!one && selectedIds.length !== 1 && (
        <AccordionCard
          title="Tips"
          allowMultiple
          defaultOpenAll
          hideControls
          items={[
            {
              id: "tips",
              title: "선택하여 편집을 시작",
              content: (
                <div className="card-body">
                  캔버스에서 아이템을 선택하면 상세 속성이 여기 나타납니다.
                </div>
              ),
            },
          ]}
        />
      )}

      {/* ===== JSON 모달 ===== */}
      {isJsonModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              padding: 16,
              width: "min(640px, 90vw)",
              maxHeight: "80vh",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                JSON Export / Import
              </div>
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                aria-label="닫기"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <Flex flexDirection="column" gap={1} style={{ fontSize: 12 }}>
              <Flex spacing={1} style={{ marginBottom: 4, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  size="xsmall"
                  onClick={onExportJson}
                  disabled={!sections.length}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  size="xsmall"
                  onClick={onCopyJson}
                  disabled={!jsonValue}
                >
                  Copy
                </Button>
                <Button
                  variant="contained"
                  size="xsmall"
                  onClick={onImportJson}
                  disabled={!jsonValue}
                >
                  Import
                </Button>
                <Button
                  variant="outlined"
                  size="xsmall"
                  onClick={onDownloadJsonFile}
                  disabled={!sections.length}
                >
                  파일로 내보내기
                </Button>
              </Flex>

              {/* VSCode 스타일 에디터 래퍼 */}
              <div
                style={{
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid #1f2937", // slate-800 느낌
                  backgroundColor: "#1e1e1e",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 200,
                }}
              >
                {/* 에디터 상단 탭 바 */}
                <div
                  style={{
                    height: 26,
                    backgroundColor: "#252526",
                    borderBottom: "1px solid #1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 8px",
                    fontSize: 11,
                    color: "#9ca3af",
                  }}
                >
                  <span>layout.json</span>
                  <span style={{ opacity: 0.7 }}>JSON</span>
                </div>

                {/* 코드 영역 */}
                <textarea
                  value={jsonValue}
                  onChange={e => setJsonValue(e.target.value)}
                  rows={42}
                  style={{
                    flex: 1,
                    width: "100%",
                    boxSizing: "border-box",
                    border: "none",
                    outline: "none",
                    backgroundColor: "#1e1e1e",
                    color: "#d4d4d4",
                    fontFamily:
                      'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 12,
                    padding: "8px 10px",
                    resize: "vertical",
                  }}
                  placeholder='Export를 누르면 { "sections": [...] } 형태의 JSON이 여기에 들어옵니다.'
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  marginTop: 4,
                }}
              >
                - Export: 현재 레이아웃을 JSON으로 생성합니다. <br />- Import:
                textarea에 붙여넣은 JSON으로 레이아웃을 교체합니다. (배열 또는{" "}
                {"{ sections: [...] }"} 형식 지원)
              </div>
            </Flex>
          </div>
        </div>
      )}
    </Aside>
  );
}
