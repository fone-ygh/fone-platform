// src/features/editor/components/panels/FrameLeftPanel.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import Aside from "@/shared/components/layout/aside/Aside";
import { useFramePatternStore } from "@/shared/store";
import {
  useFrameLayoutActions,
  useFrameLayoutStore,
} from "@/shared/store/editor/frameLayout/store";
import type {
  FrameNode,
  FrameRegion,
} from "@/shared/store/editor/frameLayout/types";

const ROOT_ID = "root";

type RegionTreeItem = TreeViewBaseItem & {
  meta?: {
    regionId: FrameRegion;
    z: number;
  };
};

const isRegion = (id: string): id is FrameRegion =>
  id === "header" || id === "sider" || id === "mdi" || id === "content";

function getDisplayTitle(n: FrameNode) {
  return n.title?.trim() || `${n.type}`;
}

function buildRegionTree(
  nodes: Record<FrameRegion, FrameNode>,
  rootLabel: string,
) {
  const arr = Object.values(nodes)
    .slice()
    .sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  const children: RegionTreeItem[] = arr.map(n => ({
    id: n.id,
    label: getDisplayTitle(n),
    children: [],
    meta: { regionId: n.id, z: n.z ?? 0 },
  }));

  return [{ id: ROOT_ID, label: rootLabel, children }];
}

export default function FrameLeftPanel() {
  const router = useRouter();

  const { nodes, selectedIds } = useFrameLayoutStore();
  const { setSelectedIds } = useFrameLayoutActions();

  const meta = useFramePatternStore(s => s.meta);
  const rootLabel = meta.title?.trim() || "Frame";

  const items = React.useMemo(
    () => buildRegionTree(nodes, rootLabel),
    [nodes, rootLabel],
  );

  const [expandedItems, setExpandedItems] = React.useState<string[]>([ROOT_ID]);

  return (
    <Aside position="left" defaultWidth={280} minWidth={220} maxWidth={420}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div
          style={{
            padding: "10px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>FRAME LAYER</div>
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, minHeight: 0, padding: 6 }}>
          <Box
            sx={{
              height: "100%",
              "& .MuiTreeItem-content": {
                borderRadius: 0,
                "& .MuiTreeItem-label": { width: "100%" },
              },
              "& .MuiTreeItem-label": {
                fontSize: 12,
                width: "100%",
              },
              "& .MuiTreeItem-content.Mui-selected": {
                backgroundColor: "rgba(59,130,246,0.12)",
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
              items={items}
              multiSelect
              itemChildrenIndentation={12}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_, ids) => {
                const next = Array.isArray(ids)
                  ? ids.map(String)
                  : [String(ids)];
                setExpandedItems(next);
              }}
              selectedItems={selectedIds as unknown as string[]}
              onSelectedItemsChange={(_, itemIds) => {
                const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
                const next = ids.map(String).filter(isRegion);
                setSelectedIds(next);
              }}
              onItemClick={(event, itemId) => {
                const id = String(itemId);

                if (id === ROOT_ID) {
                  setSelectedIds([]);
                  return;
                }

                // 더블클릭 -> content면 패턴 갤러리 이동
                if (event.detail >= 2 && id === "content") {
                  router.push("/pattern");
                }
              }}
            />
          </Box>
        </div>
      </div>
    </Aside>
  );
}
