"use client";

import React from "react";

export default function MarqueeSelection({
  rect,
}: {
  rect: { x: number; y: number; w: number; h: number };
}) {
  return (
    <div
      className="marquee"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
      }}
    >
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.marquee {
  position:absolute;
  border:1px dashed rgba(25,118,210,.95);
  background: rgba(25,118,210,.08);
  pointer-events:none;
  z-index:90;
}
`;
