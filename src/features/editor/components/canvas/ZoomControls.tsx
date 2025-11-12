"use client";

import React from "react";
import { shallow } from "zustand/shallow";

import { useEDITORStore } from "@/shared/store/control";

const box: React.CSSProperties = {
  // position: "absolute",
  // right: 12,
  // bottom: 12,
  display: "flex",
  gap: 8,
  zIndex: 1000,
  background: "rgba(255,255,255,.92)",
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(0,0,0,.08)",
  borderRadius: 10,
  padding: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,.12)",
};

const btn: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,.12)",
  background: "#fff",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1,
  cursor: "pointer",
};

export default function ZoomControls() {
  const zoom = useEDITORStore(s => s.canvasZoom);
  const actions = useEDITORStore(s => s.actions);
  return (
    <div style={box} aria-label="Zoom controls">
      <button style={btn} onClick={() => actions.zoomOut()}>
        −
      </button>
      <div style={{ minWidth: 52, textAlign: "center", alignSelf: "center" }}>
        {zoom}%
      </div>
      <button style={btn} onClick={() => actions.zoomIn()}>
        ＋
      </button>
      <button
        style={{ ...btn, marginLeft: 2 }}
        onClick={() => actions.zoomReset()}
        title="Reset (100%)"
      >
        Reset
      </button>
    </div>
  );
}
