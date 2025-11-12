// src/features/editor/components/panels/RightPanel.tsx
"use client";

import * as React from "react";

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

  const patchSection = useLayoutStore(s => s.actions.patchSection);
  const deleteSelected = useLayoutStore(s => s.actions.deleteSelected);
  const duplicateSelected = useLayoutStore(s => s.actions.duplicateSelected);
  const addSection = useLayoutStore(s => s.actions.addSection);
  const commitAfterTransform = useLayoutStore(
    s => s.actions.commitAfterTransform,
  );

  const sendToFront = useLayoutStore(s => s.actions.sendToFront);
  const sendToBack = useLayoutStore(s => s.actions.sendToBack);
  const bringForward = useLayoutStore(s => s.actions.bringForward);
  const sendBackward = useLayoutStore(s => s.actions.sendBackward);

  const applyColorToSelection = useLayoutStore(
    s => s.actions.applyColorToSelection,
  );

  // 액션 폴백을 위한 any 핸들
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

  // ✅ 전체 삭제
  const onClearAll = React.useCallback(() => {
    if (!sections.length) return;
    if (!window.confirm("모든 컴포넌트를 삭제할까요?")) return;

    if (typeof actionsAny.clearSections === "function") {
      actionsAny.clearSections();
    } else if (typeof actionsAny.setSections === "function") {
      actionsAny.setSections([]);
    } else {
      // 폴백: 모두 선택 후 deleteSelected 호출
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

  // ✅ 선택 삭제(확인)
  const onDeleteSelected = React.useCallback(() => {
    if (!selectedIds.length) return;
    if (!window.confirm(`선택된 ${selectedIds.length}개 항목을 삭제할까요?`))
      return;
    deleteSelected();
    setSelectedIds([]);
    commitAfterTransform?.();
  }, [selectedIds, deleteSelected, setSelectedIds, commitAfterTransform]);

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
                  <div
                    className="row"
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <div>Selected: {selectedIds.length}</div>
                    <div
                      style={{ marginLeft: "auto", display: "flex", gap: 8 }}
                    >
                      <button
                        type="button"
                        onClick={() => duplicateSelected()}
                        disabled={!selectedIds.length}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={onDeleteSelected}
                        disabled={!selectedIds.length}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={onClearAll}
                        disabled={!sections.length}
                        style={{
                          color: "#b91c1c",
                          borderColor: "rgba(220,38,38,.35)",
                        }}
                        title="모든 컴포넌트를 삭제"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* ===== Add Components (오른쪽 패널로 이동) ===== */}
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
                    <button
                      type="button"
                      onClick={() =>
                        addSection("box", {
                          width: 320,
                          height: 200,
                          title: "Box",
                        })
                      }
                    >
                      + Box
                    </button>
                    <button
                      type="button"
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
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addSection("tabs", {
                          width: 360,
                          height: 200,
                          title: "Tabs",
                          tabs: [
                            { label: "Tab 1", content: "첫 번째" },
                            { label: "Tab 2", content: "두 번째" },
                          ],
                        })
                      }
                    >
                      + Tabs
                    </button>
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
                        <label className="inline">Title</label>
                        <input
                          type="text"
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
                        <label className="inline">X</label>
                        <input
                          type="number"
                          value={one.x}
                          onChange={e => onNum("x")(e.target.value)}
                        />
                        <label className="inline">Y</label>
                        <input
                          type="number"
                          value={one.y}
                          onChange={e => onNum("y")(e.target.value)}
                        />
                        <label className="inline">W</label>
                        <input
                          type="number"
                          value={one.width}
                          onChange={e => onNum("width")(e.target.value)}
                        />
                        <label className="inline">H</label>
                        <input
                          type="number"
                          value={one.height}
                          onChange={e => onNum("height")(e.target.value)}
                        />
                        <label className="inline">Rotate</label>
                        <input
                          type="number"
                          value={one.rotate ?? 0}
                          onChange={e => onNum("rotate")(e.target.value)}
                        />
                        <label className="inline">Radius</label>
                        <input
                          type="number"
                          value={one.radius ?? 8}
                          onChange={e => onNum("radius")(e.target.value)}
                        />
                        <label className="inline">Shadow</label>
                        <input
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
                          <label className="inline">Text</label>
                          <input
                            type="text"
                            value={one.text || ""}
                            onChange={e => onText("text")(e.target.value)}
                          />
                        </div>
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8, marginTop: 10 }}
                        >
                          <label className="inline">Align</label>
                          <select
                            value={one.textAlign ?? "left"}
                            onChange={e =>
                              onSelect("textAlign")(e.target.value)
                            }
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
                          <label className="inline">URL</label>
                          <input
                            type="text"
                            value={one.imageUrl || ""}
                            onChange={e => onText("imageUrl")(e.target.value)}
                          />
                        </div>
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8, marginTop: 10 }}
                        >
                          <label className="inline">ObjectFit</label>
                          <select
                            value={one.objectFit ?? "cover"}
                            onChange={e =>
                              onSelect("objectFit")(e.target.value)
                            }
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
                          <label className="inline">Label</label>
                          <input
                            type="text"
                            value={one.btnLabel || ""}
                            onChange={e => onText("btnLabel")(e.target.value)}
                          />
                        </div>
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8, marginTop: 10 }}
                        >
                          <label className="inline">Href</label>
                          <input
                            type="text"
                            value={one.btnHref || ""}
                            onChange={e => onText("btnHref")(e.target.value)}
                          />
                        </div>
                        <div
                          className="row"
                          style={{ display: "grid", gap: 8, marginTop: 10 }}
                        >
                          <label className="inline">Variant</label>
                          <select
                            value={one.btnVariant ?? "solid"}
                            onChange={e =>
                              onSelect("btnVariant")(e.target.value)
                            }
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
                        <label className="inline">Purpose</label>
                        <select
                          value={one.purpose ?? "neutral"}
                          onChange={e => onSelect("purpose")(e.target.value)}
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
                        <label className="inline">Set BG</label>
                        <input
                          type="color"
                          onChange={e =>
                            applyColorToSelection(e.target.value, "bg")
                          }
                        />
                        <label className="inline">Set Text</label>
                        <input
                          type="color"
                          onChange={e =>
                            applyColorToSelection(e.target.value, "text")
                          }
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />

            {/* Z-Order */}
            <AccordionCard
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
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        }}
                      >
                        <button type="button" onClick={() => sendToFront()}>
                          To Front
                        </button>
                        <button type="button" onClick={() => bringForward()}>
                          Forward
                        </button>
                        <button type="button" onClick={() => sendBackward()}>
                          Backward
                        </button>
                        <button type="button" onClick={() => sendToBack()}>
                          To Back
                        </button>
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
      </div>
    </Aside>
  );
}
