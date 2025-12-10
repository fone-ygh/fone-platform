// src/features/editor/components/panels/LeftPanel.tsx
"use client";

import * as React from "react";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import { Box, IconButton } from "@mui/material";
import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import Aside from "@/shared/components/layout/aside/Aside";
import { useLayoutStore } from "@/shared/store";
import { useLayoutActions } from "@/shared/store/layout/store";
import type { AnySection, SectionType } from "@/shared/store/layout/types";

import { useCurrentPatternMeta } from "../../hooks/useCurrentPatternMeta";
import { EditableTreeItem } from "./left/CustomItemTree";

const ROOT_ID = "root";

/**
 * TreeView에 넘길 아이템 타입
 * - label은 반드시 string
 * - meta는 TreeView가 무시하지만 커스텀 item에서 publicAPI.getItem(itemId)로 꺼내 쓸 수 있음
 */
type LayerTreeItem = TreeViewBaseItem & {
  meta?: {
    sectionId: string;
    parentId: string | null;
    type: SectionType;
    z: number;
  };
};

function getDisplayTitle(sec: AnySection) {
  return sec.title?.trim() || `${sec.type} (${sec.id.slice(0, 4)})`;
}

function buildTree(
  sections: AnySection[],
  rootLabel: string,
): {
  items: LayerTreeItem[];
  parentById: Map<string, string | null>;
} {
  const sorted = sections.slice().sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  const nodeById = new Map<string, LayerTreeItem>();
  const parentById = new Map<string, string | null>();

  for (const sec of sorted) {
    nodeById.set(sec.id, {
      id: sec.id,
      label: getDisplayTitle(sec),
      children: [],
      meta: {
        sectionId: sec.id,
        parentId: sec.parentId ?? null,
        type: sec.type,
        z: sec.z ?? 0,
      },
    });
    parentById.set(sec.id, sec.parentId ?? null);
  }

  const roots: LayerTreeItem[] = [];
  for (const sec of sorted) {
    const node = nodeById.get(sec.id)!;
    const pid = sec.parentId ?? null;

    if (pid && nodeById.has(pid)) {
      nodeById.get(pid)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return {
    items: [{ id: ROOT_ID, label: rootLabel, children: roots }],
    parentById,
  };
}

function collectAncestors(id: string, parentById: Map<string, string | null>) {
  const chain: string[] = [];
  let cur: string | null = id;

  while (cur) {
    const parent = parentById.get(cur) ?? null;
    if (!parent) break;
    chain.push(parent);
    cur = parent;
  }
  return chain;
}

export default function LeftPanel() {
  const { sections, selectedIds, scopeParentId } = useLayoutStore();
  const { setSelectedIds, setScopeParentId } = useLayoutActions();
  const { title: pageTitle } = useCurrentPatternMeta();

  const { items, parentById } = React.useMemo(
    () => buildTree(sections, pageTitle || "Page"),
    [pageTitle, sections],
  );

  // 확장 상태(컨트롤): 기본 root 펼침
  const [expandedItems, setExpandedItems] = React.useState<string[]>([ROOT_ID]);

  // sections 바뀌면 존재하지 않는 expanded id 제거
  React.useEffect(() => {
    const valid = new Set<string>([ROOT_ID, ...sections.map(s => s.id)]);
    setExpandedItems(prev => prev.filter(id => valid.has(id)));
  }, [sections]);

  // 선택/스코프가 바뀌면 해당 노드가 보이게 조상까지 자동 펼침
  React.useEffect(() => {
    const revealTargets = [
      scopeParentId ?? null,
      selectedIds.length ? selectedIds[selectedIds.length - 1] : null,
    ].filter(Boolean) as string[];

    if (!revealTargets.length) return;

    setExpandedItems(prev => {
      const next = new Set(prev);
      next.add(ROOT_ID);

      for (const target of revealTargets) {
        next.add(target);
        for (const anc of collectAncestors(target, parentById)) next.add(anc);
      }
      return Array.from(next);
    });
  }, [selectedIds, scopeParentId, parentById]);

  return (
    <Aside position="left" defaultWidth={280} minWidth={220} maxWidth={420}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header  */}
        <div
          style={{
            padding: "10px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {scopeParentId ? (
            <IconButton
              size="small"
              onClick={() => setScopeParentId(null)}
              aria-label="Back to root"
            >
              <ArrowBackIosNewOutlinedIcon fontSize="inherit" />
            </IconButton>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {scopeParentId ? "Inside selection" : "LAYER"}
            </div>
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, minHeight: 0, padding: 6 }}>
          <Box
            sx={{
              height: "100%",
              "& .MuiTreeItem-content": {
                borderRadius: 0,
                // px: 0.5,
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
              /**
               * (Custom item을 쓰면 groupTransition에 var(--TreeView-itemChildrenIndentation) 적용도 필요)
               */
              itemChildrenIndentation={12}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_, ids) => {
                const next = Array.isArray(ids)
                  ? ids.map(String)
                  : [String(ids)];
                setExpandedItems(next);
              }}
              selectedItems={selectedIds}
              onSelectedItemsChange={(_, itemIds) => {
                const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
                setSelectedIds(ids.map(String).filter(id => id !== ROOT_ID));
              }}
              onItemClick={(event, itemId) => {
                const id = String(itemId);

                // root 클릭 -> 스코프 해제 + 선택 해제
                if (id === ROOT_ID) {
                  setScopeParentId(null);
                  setSelectedIds([]);
                  return;
                }

                // input 더블클릭(텍스트 편집) 중엔 드릴다운 방지
                const t = event.target as Element | null;
                const clickedInsideInput =
                  !!t && typeof (t as any).closest === "function"
                    ? !!t.closest('input[data-layer-label-input="true"]')
                    : false;

                // 더블클릭 -> 드릴다운 (input 영역 제외)
                if (!clickedInsideInput && event.detail >= 2) {
                  setScopeParentId(id);
                }
              }}
              slots={{
                item: EditableTreeItem, // 피그마 스타일 커스텀 row
              }}
            />
          </Box>
        </div>
      </div>
    </Aside>
  );
}
