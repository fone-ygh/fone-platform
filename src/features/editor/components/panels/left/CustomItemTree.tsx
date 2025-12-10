// src/features/editor/components/panels/left/CustomItemTree.tsx
"use client";

import * as React from "react";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import { useLayoutActions, useLayoutStore } from "@/shared/store/layout";

type EditableTreeItemProps = React.ComponentProps<typeof TreeItem>;

export function EditableTreeItem(props: EditableTreeItemProps) {
  const { itemId, label, ...rest } = props;

  const { sections } = useLayoutStore();
  const { setPatchSection, setLock } = useLayoutActions();

  // 이 TreeItem이 실제 섹션인지(root "Page"는 해당 없음)
  const sec = sections.find(s => s.id === itemId);

  const baseLabel =
    sec?.title ??
    (typeof label === "string" ? label : label != null ? String(label) : "");

  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(baseLabel);
  const [hovered, setHovered] = React.useState(false);

  // 외부에서 title이 바뀌었을 때 input 값도 동기화
  React.useEffect(() => {
    setValue(
      sec?.title ??
        (typeof label === "string"
          ? label
          : label != null
            ? String(label)
            : ""),
    );
  }, [sec?.title, label]);

  /** 이름 수정 시작 (더블클릭) */
  const startEdit: React.MouseEventHandler = e => {
    if (!sec) return; // root 같은 건 rename X
    e.stopPropagation();
    setEditing(true);
  };

  /** 이름 수정 확정 */
  const commit = () => {
    if (!sec) {
      setEditing(false);
      return;
    }
    const next = value.trim();
    if (next && next !== sec.title) {
      setPatchSection(sec.id, { title: next });
    } else {
      setValue(baseLabel); // 비우거나 그대로면 원래 값 복구
    }
    setEditing(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
      setValue(baseLabel);
    }
  };

  const isLocked = !!sec?.lock;

  /** 🔒 토글 */
  const toggleLock: React.MouseEventHandler = e => {
    if (!sec) return;
    e.stopPropagation(); // 클릭해도 선택 토글 안 되게
    setLock(sec.id, !isLocked);
  };

  /** label 부분: root / 섹션별로 다르게 렌더링 */
  const labelNode = !sec ? (
    // ✅ root "Page" 라벨
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#6b7280", // gray-500
      }}
    >
      {label as React.ReactNode}
    </span>
  ) : (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
        width: "100%",
      }}
    >
      {/* 왼쪽: 타입 아이콘 + 텍스트 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0,
          flex: 1,
        }}
      >
        {editing ? (
          <input
            data-layer-label-input="true" // 드릴다운 방지용
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              padding: "2px 4px",
              borderRadius: 4,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.02)",
              color: "#111827",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <span
            onDoubleClick={startEdit}
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              color: "#111827", // gray-900
            }}
          >
            {baseLabel}
          </span>
        )}
      </div>

      {/* 오른쪽: 🔒 아이콘 (hover 또는 잠금상태면 보이게) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: hovered || isLocked ? 1 : 0,
          transition: "opacity 120ms ease-out",
          flexShrink: 0,
        }}
      >
        <span
          onClick={toggleLock}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            cursor: "pointer",
            color: isLocked ? "#4b5563" : "#9ca3af", // 잠기면 더 진하게
          }}
        >
          {isLocked ? (
            <LockOutlinedIcon sx={{ fontSize: 14 }} />
          ) : (
            <LockOpenOutlinedIcon sx={{ fontSize: 14 }} />
          )}
        </span>
      </div>
    </div>
  );

  return <TreeItem {...rest} itemId={itemId} label={labelNode} />;
}
