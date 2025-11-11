import React from "react";

import type { GuideLine } from "@/shared/hooks/useGuides";

export function GuidesLayer({ lines }: { lines: GuideLine[] }) {
  return (
    <>
      {lines.map((g, i) =>
        g.orientation === "v" ? (
          <div
            key={`gv-${i}`}
            style={{
              position: "absolute",
              left: g.pos,
              top: g.from,
              height: g.to - g.from,
              width: 2,
              background: "#1f6feb",
              pointerEvents: "none",
              zIndex: 70,
            }}
          />
        ) : (
          <div
            key={`gh-${i}`}
            style={{
              position: "absolute",
              top: g.pos,
              left: g.from,
              width: g.to - g.from,
              height: 2,
              background: "#1f6feb",
              pointerEvents: "none",
              zIndex: 70,
            }}
          />
        ),
      )}
    </>
  );
}
