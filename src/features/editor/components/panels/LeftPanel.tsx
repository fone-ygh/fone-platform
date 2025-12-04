// src/features/editor/components/panels/LeftPanel.tsx
"use client";

import * as React from "react";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { Box } from "@mui/material";
import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import Aside from "@/shared/components/layout/aside/Aside";
import { useLayoutStore } from "@/shared/store";
import { useLayoutActions } from "@/shared/store/layout/store";

type LayoutTreeItem = TreeViewBaseItem & {
  _parentId?: string | null; // 내부용 parentId (TreeView에는 안 씀)
};

export default function LeftPanel() {
  const { sections, selectedIds } = useLayoutStore();
  const { setSelectedIds } = useLayoutActions();

  const apiRef = useTreeViewApiRef();

  // 👉 parentId 기준으로 프레임/그룹 구조 트리 만들기
  const items = React.useMemo<TreeViewBaseItem[]>(() => {
    // 섹션 없으면 빈 Page만
    if (!sections.length) {
      return [
        {
          id: "root",
          label: "Page",
          children: [],
        },
      ];
    }

    // z 순으로 정렬
    const sorted = sections.slice().sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

    const nodeMap = new Map<string, LayoutTreeItem>();

    // 1차: 각 섹션을 노드로 생성
    sorted.forEach(sec => {
      nodeMap.set(sec.id, {
        id: sec.id,
        label: sec.title || `${sec.type} (${sec.id.slice(0, 4)})`,
        children: [],
        _parentId: sec.parentId ?? null,
      });
    });

    const roots: LayoutTreeItem[] = [];

    // 2차: parentId 기준으로 부모 밑에 붙이기
    sorted.forEach(sec => {
      const node = nodeMap.get(sec.id)!;
      const parentId = sec.parentId ?? null;

      if (parentId && nodeMap.has(parentId)) {
        const parentNode = nodeMap.get(parentId)!;
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(node);
      } else {
        // parentId가 null이거나, 부모를 못 찾으면 루트 레벨
        roots.push(node);
      }
    });

    return [
      {
        id: "root",
        label: "Page",
        children: roots,
      } as TreeViewBaseItem,
    ];
  }, [sections]);

  // 마지막 선택된 id 기억
  const lastSelectedRef = React.useRef<string | null>(null);

  // Canvas → Tree : selectedIds 변경 시 Tree selection 동기화
  React.useEffect(() => {
    if (!apiRef.current) return;

    const last = selectedIds.length
      ? String(selectedIds[selectedIds.length - 1])
      : null;
    const prev = lastSelectedRef.current;

    // 선택 해제된 경우
    if (!last && prev) {
      apiRef.current.setItemSelection({
        event: new Event("click") as unknown as React.MouseEvent<Element>,
        itemId: prev,
        keepExistingSelection: false,
        shouldBeSelected: false,
      });
      lastSelectedRef.current = null;
      return;
    }

    // 새로 선택된 경우
    if (last && last !== prev) {
      apiRef.current.setItemSelection({
        event: new Event("click") as unknown as React.MouseEvent<Element>,
        itemId: last,
        keepExistingSelection: false,
        shouldBeSelected: true,
      });
      lastSelectedRef.current = last;
    }
  }, [selectedIds, apiRef]);

  return (
    <Aside position="left" defaultWidth={280} minWidth={220} maxWidth={400}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            padding: "6px 10px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.08,
            textTransform: "uppercase",
            color: "#6b7280",
            borderBottom: "1px solid rgba(148,163,184,0.3)",
          }}
        >
          Layers
        </div>

        <div style={{ flex: 1, minHeight: 0, padding: "6px" }}>
          <Box
            sx={{
              height: "100%",
              "& .MuiTreeItem-content": {
                borderRadius: 1,
              },
              "& .MuiTreeItem-label": {
                fontSize: 12,
              },
              "& .MuiTreeItem-content.Mui-selected": {
                backgroundColor: "rgba(59,130,246,0.14)",
              },
              "& .MuiTreeItem-content:hover": {
                backgroundColor: "rgba(148,163,184,0.12)",
              },
              "& .MuiTreeItem-group": {
                marginLeft: 1.5,
                paddingLeft: 1,
                borderLeft: "1px solid rgba(148,163,184,0.28)",
              },
            }}
          >
            <RichTreeView
              apiRef={apiRef}
              items={items}
              defaultExpandedItems={["root"]}
              // Tree → Canvas : Tree 클릭 시 Canvas 선택
              onItemClick={(event, itemId) => {
                if (itemId === "root") return;
                setSelectedIds([String(itemId)]);
              }}
              slots={{
                collapseIcon: FolderOutlinedIcon,
                expandIcon: FolderOutlinedIcon,
                endIcon: InsertDriveFileOutlinedIcon,
              }}
            />
          </Box>
        </div>
      </div>
    </Aside>
  );
}
