// src/features/editor/components/panels/right/InspectorCard.tsx
"use client";

import React from "react";
import { Label, Switch, TextField2 } from "fone-design-system_v1";

import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import type { AnySection, Section } from "@/shared/store/layout/types";

interface InspectorCardProps {
  selectedSection: AnySection | null;
  setPatchSection: (id: string, patch: Partial<Section>) => void;
  setLock: (id: string, lock: boolean) => void;
}

export const InspectorCard: React.FC<InspectorCardProps> = ({
  selectedSection: one,
  setPatchSection,
  setLock,
}) => {
  const inspectorItems: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[] = [];

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

  if (one) {
    inspectorItems.push(
      {
        id: "basic-title",
        title: "Title",
        content: (
          <div className="card-body">
            <div className="row" style={{ display: "grid", gap: 8 }}>
              {/* <Label>Title</Label> */}
              <h3>{one.title}</h3>
            </div>
          </div>
        ),
      },
      // {
      //   id: "basic-geometry",
      //   title: "Position & Size",
      //   content: (
      //     <div className="card-body">
      //       <div
      //         className="row"
      //         style={{
      //           display: "grid",
      //           gap: 8,
      //           gridTemplateColumns: "1fr 1fr",
      //         }}
      //       >
      //         <Label>X</Label>
      //         <TextField2
      //           type="number"
      //           value={one.x}
      //           onChange={e => onNum("x")(e.target.value)}
      //         />
      //         <Label>Y</Label>
      //         <TextField2
      //           type="number"
      //           value={one.y}
      //           onChange={e => onNum("y")(e.target.value)}
      //         />
      //         <Label>W</Label>
      //         <TextField2
      //           type="number"
      //           value={one.width}
      //           onChange={e => onNum("width")(e.target.value)}
      //         />
      //         <Label>H</Label>
      //         <TextField2
      //           type="number"
      //           value={one.height}
      //           onChange={e => onNum("height")(e.target.value)}
      //         />
      //         <Label>Rotate</Label>
      //         <TextField2
      //           type="number"
      //           value={one.rotate ?? 0}
      //           onChange={e => onNum("rotate")(e.target.value)}
      //         />
      //         <Label>Radius</Label>
      //         <TextField2
      //           type="number"
      //           value={one.radius ?? 8}
      //           onChange={e => onNum("radius")(e.target.value)}
      //         />
      //         <Label>Shadow</Label>
      //         <TextField2
      //           type="number"
      //           value={one.shadow ?? 0}
      //           onChange={e => onNum("shadow")(e.target.value)}
      //         />
      //       </div>
      //     </div>
      //   ),
      // },
      {
        id: "lock",
        title: "Lock",
        content: (
          <div className="card-body">
            <div
              className="row"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Label>Lock</Label>
              <Switch
                checked={!!one.lock}
                onChange={e => setLock(one.id, e.target.checked)}
              />
            </div>
          </div>
        ),
      },
    );
  }

  if (!inspectorItems.length) return null;

  return (
    <AccordionCard
      title="Inspector"
      allowMultiple
      defaultOpenAll
      hideControls
      items={inspectorItems}
    />
  );
};
