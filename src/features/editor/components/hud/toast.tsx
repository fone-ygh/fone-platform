"use client";

import React from "react";

import { useLayoutStore } from "@/shared/store/layout";

/** layoutStore 내부에 toast: { message:string|null } 가 있다고 가정 */
export default function Toast() {
  const { toast } = useLayoutStore(s => ({ toast: s.toast }));
  if (!toast?.message) return null;
  return (
    <div className="toast">
      {toast.message}
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.toast {
  position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
  background: rgba(0,0,0,0.82); color: #fff; font-size: 13px; padding: 8px 12px;
  border-radius: 8px; z-index: 1000; box-shadow: 0 6px 16px rgba(0,0,0,0.35);
}
`;
