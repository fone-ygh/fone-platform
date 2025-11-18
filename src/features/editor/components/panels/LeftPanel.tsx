// src/features/editor/components/panels/LeftPanel.tsx
"use client";

import { Checkbox, Label, TextField2 } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { useLayoutActions, useLayoutStore } from "@/shared/store/layout";

/**
 * 왼쪽 패널
 * - 뷰/스냅/캔버스/컬럼 설정만 담당
 */
export default function LeftPanel() {
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

  /* -------- layout(canvas/columns) -------- */
  const { canvasWidth, canvasHeight } = useLayoutStore();
  const { setCanvasSize } = useLayoutActions();

  const onChangeCanvasW = (v: string) => {
    setCanvasSize(Number(v), canvasHeight);
  };
  const onChangeCanvasH = (v: string) => {
    setCanvasSize(canvasWidth, Number(v));
  };

  return (
    <Aside position="left" defaultWidth={320} minWidth={240} maxWidth={560}>
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
                    value={gridSize}
                    onChange={e => setGridSize(Number(e.target.value || 1))}
                    inputProps={{
                      min: 1,
                      max: 100,
                    }}
                  />

                  <Label>Grid Color</Label>
                  <TextField2
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
                  />
                  <Label className="inline">Height</Label>
                  <TextField2
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
    </Aside>
  );
}
