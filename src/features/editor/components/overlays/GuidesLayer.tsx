"use client";

import React from "react";

import type { GuideLine } from "@/shared/hooks/useGuides";

export default function GuidesLayer({ lines }: { lines: GuideLine[] }) {
  if (!lines?.length) return null;
  return (
    <>
      {lines.map((g, i) =>
        g.orientation === "v" ? (
          <div
            key={`gv-${i}`}
            className="guide v"
            style={{ left: g.pos, top: g.from, height: g.to - g.from }}
          />
        ) : (
          <div
            key={`gh-${i}`}
            className="guide h"
            style={{ top: g.pos, left: g.from, width: g.to - g.from }}
          />
        ),
      )}
      <style>{CSS}</style>
    </>
  );
}

const CSS = `
.guide.v, .guide.h {
  position:absolute; background: repeating-linear-gradient(
    to bottom, rgba(25,118,210,1), rgba(25,118,210,1) 4px, transparent 4px, transparent 8px
  );
  pointer-events:none; z-index:80;
}
.guide.v { width:2px; background: repeating-linear-gradient(
  to right, rgba(25,118,210,1), rgba(25,118,210,1) 4px, transparent 4px, transparent 8px
); }
.guide.h { height:2px; background: repeating-linear-gradient(
  to bottom, rgba(25,118,210,1), rgba(25,118,210,1) 4px, transparent 4px, transparent 8px
); }
`;
