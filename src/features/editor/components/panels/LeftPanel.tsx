// src/features/editor/components/panels/LeftPanel.tsx
"use client";

import * as React from "react";
import { Checkbox, Label, TextField2 } from "fone-design-system_v1";

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
                    <Checkbox
                      type="checkbox"
                      checked={showGrid}
                      onChange={e => setShowGrid(e.target.checked)}
                      label="Grid"
                      size="small"
                    />
                    {/* <Checkbox
                      type="checkbox"
                      checked={showGuides}
                      onChange={e => setShowGuides(e.target.checked)}
                      label="Guides"
                      size="small"
                    />
                    <Checkbox
                      type="checkbox"
                      checked={showRulers}
                      onChange={e => setShowRulers(e.target.checked)}
                      label="Rulers"
                      size="small"
                    /> */}
                  </div>

                  <div
                    className="row"
                    style={{ display: "grid", gap: 8, marginTop: 10 }}
                  >
                    <Label>Grid Size</Label>
                    <TextField2
                      type="number"
                      size="xs"
                      value={gridSize}
                      onChange={e => setGridSize(Number(e.target.value || 1))}
                      inputProps={{
                        min: 1,
                        max: 100,
                      }}
                    />

                    <Label>Grid Color</Label>
                    <TextField2
                      size="xs"
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
                    <Checkbox
                      checked={snapToGrid}
                      onChange={e => setSnapToGrid(e.target.checked)}
                      label="Snap to Grid"
                      size="small"
                    />

                    <Checkbox
                      checked={snapToGuides}
                      onChange={e => setSnapToGuides(e.target.checked)}
                      label="Snap to Guides"
                      size="small"
                    />
                    <Checkbox
                      checked={snapToElements}
                      onChange={e => setSnapToElements(e.target.checked)}
                      label="Snap to Elements"
                      size="small"
                    />
                  </div>
                  <div
                    className="row"
                    style={{ display: "grid", gap: 8, marginTop: 10 }}
                  >
                    <Label>Tolerance</Label>
                    <TextField2
                      type="number"
                      value={snapTolerance}
                      onChange={e =>
                        setSnapTolerance(Number(e.target.value || 0))
                      }
                      inputProps={{ min: 0, max: 40 }}
                      size="xs"
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
                    <Label className="inline">Width</Label>
                    <TextField2
                      type="number"
                      value={canvasWidth}
                      onChange={e => onChangeCanvasW(e.target.value)}
                      size="xs"
                    />
                    <Label className="inline">Height</Label>
                    <TextField2
                      type="number"
                      value={canvasHeight}
                      onChange={e => onChangeCanvasH(e.target.value)}
                      size="xs"
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
                  <Checkbox
                    checked={showColumns}
                    onChange={e => setShowColumns(e.target.checked)}
                    label="showColumns"
                    size="small"
                  />

                  <div
                    className="row"
                    style={{ display: "grid", gap: 8, marginTop: 10 }}
                  >
                    <Label>Count</Label>
                    <TextField2
                      type="number"
                      value={columns}
                      onChange={e => setColumns(Number(e.target.value || 12))}
                      inputProps={{ min: 1, max: 24 }}
                      size="xs"
                    />
                    <Label>Gutter</Label>
                    <TextField2
                      type="number"
                      value={gutter}
                      onChange={e => setGutter(Number(e.target.value || 0))}
                      inputProps={{ min: 0, max: 80 }}
                      size="xs"
                    />

                    <Label>Padding</Label>
                    <TextField2
                      type="number"
                      value={containerPadding}
                      onChange={e =>
                        setContainerPadding(Number(e.target.value || 0))
                      }
                      inputProps={{ min: 0, max: 200 }}
                      size="xs"
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
