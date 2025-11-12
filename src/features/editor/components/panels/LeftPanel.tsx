// src/features/editor/components/panels/LeftPanel.tsx
"use client";

import * as React from "react";

import Aside from "@/shared/components/layout/aside/Aside";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import { useEDITORStore } from "@/shared/store/control";
import { useLayoutStore } from "@/shared/store/layout";

/**
 * 왼쪽 패널
 * - 뷰/스냅/캔버스/컬럼 설정만 담당
 */
export default function LeftPanel() {
  /* -------- editor(view/snap/zoom) -------- */
  const showGrid = useEDITORStore(s => s.showGrid);
  const setShowGrid = useEDITORStore(s => s.actions.setShowGrid);

  const gridSize = useEDITORStore(s => s.gridSize);
  const setGridSize = useEDITORStore(s => s.actions.setGridSize);

  const gridColor = useEDITORStore(s => s.gridColor);
  const setGridColor = useEDITORStore(s => s.actions.setGridColor);

  const showGuides = useEDITORStore(s => s.showGuides);
  const setShowGuides = useEDITORStore(s => s.actions.setShowGuides);

  const showRulers = useEDITORStore(s => s.showRulers);
  const setShowRulers = useEDITORStore(s => s.actions.setShowRulers);

  const snapToGrid = useEDITORStore(s => s.snapToGrid);
  const setSnapToGrid = useEDITORStore(s => s.actions.setSnapToGrid);

  const snapToGuides = useEDITORStore(s => s.snapToGuides);
  const setSnapToGuides = useEDITORStore(s => s.actions.setSnapToGuides);

  const snapToElements = useEDITORStore(s => s.snapToElements);
  const setSnapToElements = useEDITORStore(s => s.actions.setSnapToElements);

  const snapTolerance = useEDITORStore(s => s.snapTolerance);
  const setSnapTolerance = useEDITORStore(s => s.actions.setSnapTolerance);

  /* -------- layout(canvas/columns) -------- */
  const canvasWidth = useLayoutStore(s => s.canvasWidth);
  const canvasHeight = useLayoutStore(s => s.canvasHeight);
  const setCanvasSize = useLayoutStore(s => s.actions.setCanvasSize);

  const columns = useLayoutStore(s => s.columns);
  const setColumns = useLayoutStore(s => s.actions.setColumns!);

  const gutter = useLayoutStore(s => s.gutter);
  const setGutter = useLayoutStore(s => s.actions.setGutter!);

  const containerPadding = useLayoutStore(s => s.containerPadding);
  const setContainerPadding = useLayoutStore(
    s => s.actions.setContainerPadding!,
  );

  const showColumns = useLayoutStore(s => s.showColumns);
  const setShowColumns = useLayoutStore(s => s.actions.setShowColumns!);

  const onChangeCanvasW = (v: string) => {
    const next = Math.max(300, Number(v || 0));
    setCanvasSize(next, canvasHeight);
  };
  const onChangeCanvasH = (v: string) => {
    const next = Math.max(300, Number(v || 0));
    setCanvasSize(canvasWidth, next);
  };

  return (
    <Aside position="left" defaultWidth={320} minWidth={240} maxWidth={560}>
      <div className="panel-body" style={{ display: "grid", gap: 12 }}>
        {/* ===== View ===== */}
        <AccordionCard
          title="View"
          allowMultiple
          defaultOpenAll
          hideControls
          items={[
            {
              id: "grid-guides",
              title: "Grid / Guides / Rulers",
              content: (
                <div className="card-body">
                  <div className="row" style={{ display: "grid", gap: 8 }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={e => setShowGrid(e.target.checked)}
                      />{" "}
                      Grid
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showGuides}
                        onChange={e => setShowGuides(e.target.checked)}
                      />{" "}
                      Guides
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showRulers}
                        onChange={e => setShowRulers(e.target.checked)}
                      />{" "}
                      Rulers
                    </label>
                  </div>

                  <div
                    className="row"
                    style={{ display: "grid", gap: 8, marginTop: 10 }}
                  >
                    <label className="inline">Grid Size</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={gridSize}
                      onChange={e => setGridSize(Number(e.target.value || 1))}
                    />
                    <label className="inline">Grid Color</label>
                    <input
                      type="text"
                      value={gridColor}
                      onChange={e => setGridColor(e.target.value)}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* ===== Snap ===== */}
        <AccordionCard
          title="Snap"
          allowMultiple
          defaultOpenAll
          hideControls
          items={[
            {
              id: "snap",
              title: "Snapping options",
              content: (
                <div className="card-body">
                  <div className="row" style={{ display: "grid", gap: 8 }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={e => setSnapToGrid(e.target.checked)}
                      />{" "}
                      Snap to Grid
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={snapToGuides}
                        onChange={e => setSnapToGuides(e.target.checked)}
                      />{" "}
                      Snap to Guides
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={snapToElements}
                        onChange={e => setSnapToElements(e.target.checked)}
                      />{" "}
                      Snap to Elements
                    </label>
                  </div>
                  <div
                    className="row"
                    style={{ display: "grid", gap: 8, marginTop: 10 }}
                  >
                    <label className="inline">Tolerance</label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={snapTolerance}
                      onChange={e =>
                        setSnapTolerance(Number(e.target.value || 0))
                      }
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* ===== Canvas ===== */}
        <AccordionCard
          title="Canvas"
          allowMultiple
          defaultOpenAll
          hideControls
          items={[
            {
              id: "canvas",
              title: "Size",
              content: (
                <div className="card-body">
                  <div className="row" style={{ display: "grid", gap: 8 }}>
                    <label className="inline">Width</label>
                    <input
                      type="number"
                      value={canvasWidth}
                      onChange={e => onChangeCanvasW(e.target.value)}
                    />
                    <label className="inline">Height</label>
                    <input
                      type="number"
                      value={canvasHeight}
                      onChange={e => onChangeCanvasH(e.target.value)}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* ===== Columns Overlay ===== */}
        <AccordionCard
          title="Columns"
          allowMultiple
          defaultOpenAll
          hideControls
          items={[
            {
              id: "columns",
              title: "Grid Columns",
              content: (
                <div className="card-body">
                  <div className="row" style={{ display: "grid", gap: 8 }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={showColumns}
                        onChange={e => setShowColumns(e.target.checked)}
                      />{" "}
                      Show Columns
                    </label>
                  </div>
                  <div
                    className="row"
                    style={{ display: "grid", gap: 8, marginTop: 10 }}
                  >
                    <label className="inline">Count</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={columns}
                      onChange={e => setColumns(Number(e.target.value || 12))}
                    />
                    <label className="inline">Gutter</label>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={gutter}
                      onChange={e => setGutter(Number(e.target.value || 0))}
                    />
                    <label className="inline">Padding</label>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={containerPadding}
                      onChange={e =>
                        setContainerPadding(Number(e.target.value || 0))
                      }
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Aside>
  );
}
