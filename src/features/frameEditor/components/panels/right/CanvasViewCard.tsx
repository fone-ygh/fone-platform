// src/features/editor/components/panels/right/CanvasViewCard.tsx
"use client";

import React from "react";
import { Checkbox, Label, TextField2 } from "fone-design-system_v1";

import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";

interface CanvasViewCardProps {
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  snapToElements: boolean;
  snapTolerance: number;
  canvasWidth: number;
  canvasHeight: number;
  setShowGrid: (v: boolean) => void;
  setGridSize: (n: number) => void;
  setGridColor: (s: string) => void;
  setSnapToElements: (v: boolean) => void;
  setSnapTolerance: (n: number) => void;
  onChangeCanvasW: (v: string) => void;
  onChangeCanvasH: (v: string) => void;
}

export const CanvasViewCard: React.FC<CanvasViewCardProps> = props => {
  const {
    showGrid,
    gridSize,
    gridColor,
    snapToElements,
    snapTolerance,
    canvasWidth,
    canvasHeight,
    setShowGrid,
    setGridSize,
    setGridColor,
    setSnapToElements,
    setSnapTolerance,
    onChangeCanvasW,
    onChangeCanvasH,
  } = props;

  return (
    <AccordionCard
      title="Canvas & View"
      allowMultiple
      defaultOpenAll
      hideControls
      items={[
        {
          id: "view",
          title: "View",
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
        {
          id: "snap",
          title: "Snap",
          content: (
            <div className="card-body">
              <div className="row" style={{ display: "grid", gap: 8 }}>
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
                  onChange={e => setSnapTolerance(Number(e.target.value || 0))}
                  inputProps={{ min: 0, max: 40 }}
                />
              </div>
            </div>
          ),
        },
        {
          id: "canvas-size",
          title: "Canvas Size",
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
  );
};
