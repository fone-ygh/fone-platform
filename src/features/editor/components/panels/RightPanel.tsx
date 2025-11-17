// src/features/editor/components/panels/RightPanel.tsx
"use client";

import * as React from "react";
import { Button, Flex, Label, TextField2 } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import { useLayoutStore } from "@/shared/store/layout";

/**
 * 오른쪽 패널 (Inspector)
 * - 단일 선택 시: 속성 편집 섹션(Accordion)
 * - 다중/없음: 요약/액션만
 * - selector는 전부 단일 호출
 */
export default function RightPanel() {
  const selectedIds = useLayoutStore(s => s.selectedIds);
  const sections = useLayoutStore(s => s.sections);

  const patchSection = useLayoutStore(s => s.actions.setPatchSection);
  const deleteSelected = useLayoutStore(s => s.actions.setDeleteSelected);
  const duplicateSelected = useLayoutStore(s => s.actions.setDuplicateSelected);
  const addSection = useLayoutStore(s => s.actions.setAddSection);
  const commitAfterTransform = useLayoutStore(
    s => s.actions.setCommitAfterTransform,
  );

  // const sendToFront = useLayoutStore(s => s.actions.setSendToFront);
  // const sendToBack = useLayoutStore(s => s.actions.setSendToBack);
  // const bringForward = useLayoutStore(s => s.actions.setBringForward);
  // const sendBackward = useLayoutStore(s => s.actions.setSendBackward);

  const applyColorToSelection = useLayoutStore(
    s => s.actions.setApplyColorToSelection,
  );

  const actionsAny = useLayoutStore(s => s.actions as any);
  const setSelectedIds = useLayoutStore(s => s.actions.setSelectedIds);

  const one =
    selectedIds.length === 1
      ? sections.find(s => s.id === selectedIds[0]) || null
      : null;

  const onNum =
    (key: "x" | "y" | "width" | "height" | "rotate" | "radius" | "shadow") =>
    (v: string) => {
      if (!one) return;
      const num = Math.round(Number(v || 0));
      patchSection(one.id, { [key]: num } as any);
    };

  const onText =
    (key: "title" | "text" | "btnLabel" | "btnHref" | "imageUrl") =>
    (v: string) => {
      if (!one) return;
      patchSection(one.id, { [key]: v });
    };

  const onSelect =
    (key: "textAlign" | "btnVariant" | "objectFit" | "purpose") =>
    (v: string) => {
      if (!one) return;
      patchSection(one.id, { [key]: v as any });
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
      deleteSelected();
    }

    setSelectedIds([]);
    commitAfterTransform?.();
  }, [
    sections,
    actionsAny,
    setSelectedIds,
    deleteSelected,
    commitAfterTransform,
  ]);

  // 선택 삭제
  const onDeleteSelected = React.useCallback(() => {
    if (!selectedIds.length) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(`선택된 ${selectedIds.length}개 항목을 삭제할까요?`)
    )
      return;
    deleteSelected();
    setSelectedIds([]);
    commitAfterTransform?.();
  }, [selectedIds, deleteSelected, setSelectedIds, commitAfterTransform]);

  const hasSelection = selectedIds.length > 0;

  return (
    <Aside position="right" defaultWidth={340} minWidth={260} maxWidth={560}>
      <div className="panel-body" style={{ display: "grid", gap: 12 }}>
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
                        onClick={() => duplicateSelected()}
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

        {/* ===== Add Components (오른쪽 패널에 배치) ===== */}
        <AccordionCard
          title="Add Components"
          allowMultiple
          defaultOpenAll
          hideControls
          items={[
            {
              id: "add",
              title: "Quick add",
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
                      variant="outlined"
                      size="xsmall"
                      onClick={() =>
                        addSection("box", {
                          width: 320,
                          height: 200,
                          title: "Box",
                        })
                      }
                    >
                      + Box
                    </Button>
                    <Button
                      variant="outlined"
                      size="xsmall"
                      onClick={() =>
                        addSection("button", {
                          width: 160,
                          height: 48,
                          btnLabel: "Button",
                          title: "Button",
                        })
                      }
                    >
                      + Button
                    </Button>
                    <Button
                      variant="outlined"
                      size="xsmall"
                      onClick={() =>
                        addSection("tabs", {
                          width: 360,
                          height: 200,
                          title: "Tabs",
                          tabs: [
                            { label: "Tab 1", content: "첫 번째" }, // ← 'label'로 교정
                            { label: "Tab 2", content: "두 번째" },
                          ],
                        })
                      }
                    >
                      + Tabs
                    </Button>
                  </div>
                </div>
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
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8 }}
                        >
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
                          {/* NOTE: DS Select 컴포넌트가 있다면 여기로 교체 */}
                          <select
                            value={one.textAlign ?? "left"}
                            onChange={e =>
                              onSelect("textAlign")(e.target.value)
                            }
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
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8 }}
                        >
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
                            onChange={e =>
                              onSelect("objectFit")(e.target.value)
                            }
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
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8 }}
                        >
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
                            onChange={e =>
                              onSelect("btnVariant")(e.target.value)
                            }
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
                            applyColorToSelection(e.target.value, "bg")
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
                            applyColorToSelection(e.target.value, "text")
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

            {/* Z-Order */}
            {/* <AccordionCard
              title="Z-Order"
              allowMultiple
              defaultOpenAll
              hideControls
              items={[
                {
                  id: "zorder",
                  title: "Reorder",
                  content: (
                    <div className="card-body">
                      <div
                        className="row"
                        style={{
                          display: "grid",
                          gap: 8,
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="xsmall"
                          disabled={!hasSelection}
                          onClick={() => sendToFront()}
                        >
                          To Front
                        </Button>
                        <Button
                          variant="outlined"
                          size="xsmall"
                          disabled={!hasSelection}
                          onClick={() => bringForward()}
                        >
                          Forward
                        </Button>
                        <Button
                          variant="outlined"
                          size="xsmall"
                          disabled={!hasSelection}
                          onClick={() => sendBackward()}
                        >
                          Backward
                        </Button>
                        <Button
                          variant="outlined"
                          size="xsmall"
                          disabled={!hasSelection}
                          onClick={() => sendToBack()}
                        >
                          To Back
                        </Button>
                      </div>
                    </div>
                  ),
                },
              ]}
            /> */}
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
      </div>
    </Aside>
  );
}
