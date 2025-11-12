"use client";

import React from "react";

import { useLayoutStore } from "@/shared/store/layout";

export default function HUD() {
  const { sections, selectedIds } = useLayoutStore(s => ({
    sections: s.sections,
    selectedIds: s.selectedIds,
  }));
  const sel =
    selectedIds.length === 1
      ? sections.find(s => s.id === selectedIds[0])
      : null;
  if (!sel) return null;

  return (
    <div className="hud">
      <span>{sel.title}</span>
      <span>
        {Math.round(sel.x)}×{Math.round(sel.y)}
      </span>
      <span>
        {Math.round(sel.width)}×{Math.round(sel.height)}
      </span>
      <span>Z {sel.z ?? 0}</span>
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.hud {
  position:absolute; left:12px; bottom:12px; display:flex; gap:8px;
  background: rgba(0,0,0,.6); color:#fff; padding:4px 8px; border-radius:8px;
  font-size:12px; z-index:90; pointer-events:none;
}
.hud span { opacity:.9; }
`;
