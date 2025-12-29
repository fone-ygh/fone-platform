// src/features/editor/components/panels/FrameRightPanel.tsx
"use client";

import * as React from "react";
import { TextField } from "@mui/material";
import { Button, Label, Switch } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { savePattern } from "@/shared/flows/frame/savePattern";
import {
  useFrameLayoutActions,
  useFrameLayoutStore,
} from "@/shared/store/editor/frameLayout/store";
import type { FrameRegion } from "@/shared/store/editor/frameLayout/types";
import { useFramePatternStore } from "@/shared/store/framePattern/store";

const isRegion = (v: any): v is FrameRegion =>
  v === "header" || v === "sider" || v === "mdi" || v === "content";

export default function FrameRightPanel() {
  const { frameWidth, frameHeight, nodes, selectedIds } = useFrameLayoutStore();
  const { setFrameSize, setLock } = useFrameLayoutActions();

  const meta = useFramePatternStore(s => s.meta);
  const setMeta = useFramePatternStore(s => s.actions.setMeta);

  const selectedOne = React.useMemo(() => {
    if (selectedIds.length !== 1) return null;
    const id = selectedIds[0];
    if (!isRegion(id)) return null;
    return nodes[id] ?? null;
  }, [nodes, selectedIds]);

  // frame size 입력은 로컬 state로 (타이핑 중 즉시 store 변경하면 UX가 튀어서)
  const [wText, setWText] = React.useState(String(frameWidth));
  const [hText, setHText] = React.useState(String(frameHeight));

  React.useEffect(() => setWText(String(frameWidth)), [frameWidth]);
  React.useEffect(() => setHText(String(frameHeight)), [frameHeight]);

  const commitFrameSize = () => {
    const w = Math.max(1, parseInt(wText, 10) || frameWidth);
    const h = Math.max(1, parseInt(hText, 10) || frameHeight);
    setFrameSize(w, h);
  };

  const handleSave = () => {
    const t = (meta.title ?? "").trim();
    if (!t) {
      window.alert("프레임 패턴명을 입력해주세요.");
      return;
    }
    const savedId = savePattern(meta.patternId, {
      title: t,
      description: (meta.description ?? "").trim(),
    });
    // 필요하면 여기서 toast로 바꿔도 됨
    window.alert(`저장되었습니다. (${savedId})`);
  };

  const handleSaveAsNew = () => {
    const t = (meta.title ?? "").trim();
    if (!t) {
      window.alert("프레임 패턴명을 입력해주세요.");
      return;
    }
    const savedId = savePattern(null, {
      createNew: true,
      title: t,
      description: (meta.description ?? "").trim(),
    });
    window.alert(`새로 저장되었습니다. (${savedId})`);
  };

  return (
    <Aside position="right" defaultWidth={340} minWidth={0} maxWidth={560}>
      {/* title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <label style={{ flexShrink: 0 }}>프레임명 :</label>
        <TextField
          size="small"
          value={meta.title}
          onChange={e => setMeta({ title: e.target.value })}
          sx={{ "& input": { fontWeight: "bold" } }}
        />
      </div>

      {/* description */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <label style={{ flexShrink: 0 }}>설명 :</label>
        <TextField
          size="small"
          value={meta.description}
          onChange={e => setMeta({ description: e.target.value })}
        />
      </div>

      {/* frame size */}
      <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
        <TextField
          size="small"
          label="Frame W"
          value={wText}
          onChange={e => setWText(e.target.value)}
          onBlur={commitFrameSize}
        />
        <TextField
          size="small"
          label="Frame H"
          value={hText}
          onChange={e => setHText(e.target.value)}
          onBlur={commitFrameSize}
        />
      </div>

      {/* selection lock */}
      {selectedOne && (
        <>
          <h3 style={{ margin: "12px 0 6px" }}>
            {selectedOne.title ?? selectedOne.type}
          </h3>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label>Lock</Label>
              <Switch
                checked={!!selectedOne.lock}
                onChange={(e: any) => setLock(selectedOne.id, e.target.checked)}
              />
            </div>
          </div>
        </>
      )}

      {/* save buttons */}
      <div style={{ display: "flex", gap: 8, padding: "10px 0" }}>
        <Button
          variant="outlined"
          onClick={handleSaveAsNew}
          style={{ flex: 1 }}
        >
          새로 저장
        </Button>
        <Button variant="contained" onClick={handleSave} style={{ flex: 1 }}>
          저장
        </Button>
      </div>
    </Aside>
  );
}
