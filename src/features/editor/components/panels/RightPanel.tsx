// src/features/editor/components/panels/RightPanel.tsx
"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { Button, Label, Switch } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { useEDITORActions, useEDITORStore } from "@/shared/store/control";
import { useLayoutActions, useLayoutStore } from "@/shared/store/layout";
import {
  usePatternActions,
  usePatternStore,
} from "@/shared/store/pattern/store";

import { LayoutCard } from "./right/LayoutCard";

type SaveMode = "overwrite" | "copy";

function buildEditorUrl(
  editorId: string,
  patternId?: string | null,
  originPatternId?: string | null,
) {
  const sp = new URLSearchParams();
  if (patternId) sp.set("id", patternId);
  if (originPatternId) sp.set("originPatternId", originPatternId);
  const qs = sp.toString();
  return qs ? `/editor/${editorId}?${qs}` : `/editor/${editorId}`;
}

export default function RightPanel() {
  /* -------- editor(view/snap/zoom) -------- */
  const {
    showGrid,
    gridSize,
    gridColor,
    showGuides,
    showRulers,
    snapToGrid,
    snapToGuides,
    snapToElements,
    snapTolerance,
  } = useEDITORStore();
  const {
    setShowGrid,
    setGridSize,
    setGridColor,
    setShowGuides,
    setShowRulers,
    setSnapToGrid,
    setSnapToGuides,
    setSnapToElements,
    setSnapTolerance,
  } = useEDITORActions();

  /* -------- layout(canvas/columns/selection 등) -------- */
  const { selectedIds, sections, insertTool, canvasWidth, canvasHeight } =
    useLayoutStore();
  const {
    setInsertTool,
    setDeleteSelected,
    setDuplicateSelected,
    setCommitAfterTransform,
    setSelectedIds,
    setSections,
    setLock,
  } = useLayoutActions();

  /* -------- patterns(zustand 저장) -------- */
  const { addPattern, updateCustomPattern } = usePatternActions();
  const customPatterns = usePatternStore(s => s.customPatterns);

  /* -------- router / url params -------- */
  const router = useRouter();
  const params = useParams();
  const editorId = String((params as any)?.id ?? "");
  const searchParams = useSearchParams();

  const urlPatternId = searchParams.get("id"); // 현재 편집중인 패턴 id(빌트인/커스텀)
  const urlOriginPatternId = searchParams.get("originPatternId");

  const editingCustom = React.useMemo(() => {
    if (!urlPatternId) return null;
    return customPatterns.find(p => p.id === urlPatternId) ?? null;
  }, [customPatterns, urlPatternId]);
  console.log("customPatterns : ", customPatterns);
  const canOverwrite = !!editingCustom && !!urlPatternId;

  // originPatternId 해석:
  // 1) URL originPatternId 우선
  // 2) 커스텀 패턴이면 store에 저장된 originPatternId
  // 3) 빌트인(id가 custom_ 아님)에서 시작했는데 originPatternId가 없다면 id를 origin으로 취급
  const resolvedOriginPatternId = React.useMemo(() => {
    if (urlOriginPatternId) return urlOriginPatternId;
    if (editingCustom?.originPatternId) return editingCustom.originPatternId;
    if (urlPatternId && !urlPatternId.startsWith("custom_"))
      return urlPatternId;
    return null;
  }, [urlOriginPatternId, editingCustom, urlPatternId]);

  /* -------- selection helpers -------- */
  const one =
    selectedIds.length === 1
      ? sections.find(s => s.id === selectedIds[0]) || null
      : null;

  const hasSelection = selectedIds.length > 0;

  /* ====== Clear / Delete ====== */
  const onClearAll = React.useCallback(() => {
    if (!sections.length) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("모든 컴포넌트를 삭제할까요?")
    )
      return;

    setSections([]);
    setSelectedIds([]);
    setCommitAfterTransform?.();
  }, [sections.length, setSections, setSelectedIds, setCommitAfterTransform]);

  const onDeleteSelected = React.useCallback(() => {
    if (!selectedIds.length) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(`선택된 ${selectedIds.length}개 항목을 삭제할까요?`)
    )
      return;

    setDeleteSelected();
    setSelectedIds([]);
    setCommitAfterTransform?.();
  }, [selectedIds, setDeleteSelected, setSelectedIds, setCommitAfterTransform]);

  /* ===== JSON Export / Import (선택) ===== */
  const [jsonValue, setJsonValue] = React.useState("");
  const [isJsonModalOpen, setIsJsonModalOpen] = React.useState(false);

  const onExportJson = React.useCallback(() => {
    const payload = { canvasWidth, canvasHeight, sections };
    setJsonValue(JSON.stringify(payload, null, 2));
    setIsJsonModalOpen(true);
  }, [canvasWidth, canvasHeight, sections]);

  const onDownloadJsonFile = React.useCallback(() => {
    const payload = { canvasWidth, canvasHeight, sections };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [canvasWidth, canvasHeight, sections]);

  const onImportFile = React.useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || ""));
          const nextSections = parsed.sections;
          if (!Array.isArray(nextSections))
            throw new Error("sections가 배열이 아닙니다.");

          setSections(nextSections);
          setSelectedIds([]);
          setCommitAfterTransform?.();
        } catch (err: any) {
          window.alert(
            "JSON 파일 파싱에 실패했습니다.\n\n" +
              (err?.message || String(err)),
          );
        }
      };
      reader.readAsText(file, "utf-8");
    };
    input.click();
  }, [setSections, setSelectedIds, setCommitAfterTransform]);

  /* ===== Save Modal ===== */
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [saveMode, setSaveMode] = React.useState<SaveMode>("copy");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const openSaveModal = React.useCallback(
    (mode: SaveMode) => {
      setError(null);

      // 덮어쓰기 모드로 열고 싶어도, overwrite 불가능하면 copy로 강제
      const nextMode: SaveMode =
        mode === "overwrite" && !canOverwrite ? "copy" : mode;

      setSaveMode(nextMode);

      // 커스텀 편집중이면 기존 메타로 프리필
      setTitle(editingCustom?.title ?? "");
      setDescription(editingCustom?.description ?? "");

      setSaveOpen(true);
    },
    [canOverwrite, editingCustom],
  );

  const handleSave = React.useCallback(() => {
    const t = title.trim();
    if (!t) {
      setError("제목(title)을 입력해주세요.");
      return;
    }

    const payload = {
      title: t,
      description: description.trim(),
      canvasWidth,
      canvasHeight,
      sections,
      originPatternId: resolvedOriginPatternId ?? null,
    };

    let savedId: string;

    if (saveMode === "overwrite" && canOverwrite && urlPatternId) {
      // 덮어쓰기
      updateCustomPattern(urlPatternId, payload);
      savedId = urlPatternId;
    } else {
      // 새로 저장
      savedId = addPattern(payload);
    }

    setSaveOpen(false);

    // 저장 후에는 URL도 갱신해두면 다음부터 "저장"이 덮어쓰기로 동작하기 쉬움
    if (editorId) {
      router.replace(
        buildEditorUrl(editorId, savedId, resolvedOriginPatternId),
      );
    }
  }, [
    title,
    description,
    canvasWidth,
    canvasHeight,
    sections,
    resolvedOriginPatternId,
    saveMode,
    canOverwrite,
    urlPatternId,
    updateCustomPattern,
    addPattern,
    editorId,
    router,
  ]);

  return (
    <Aside position="right" defaultWidth={340} minWidth={0} maxWidth={560}>
      {selectedIds.length > 0 && (
        <>
          <h3 style={{ margin: "12px 0 6px" }}>{one?.title}</h3>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label>Lock</Label>
              <Switch
                checked={!!one?.lock}
                onChange={e =>
                  one && setLock(one.id, (e.target as any).checked)
                }
              />
            </div>
          </div>
        </>
      )}

      <LayoutCard
        selectedCount={selectedIds.length}
        hasSelection={hasSelection}
        sectionsLength={sections.length}
        insertTool={insertTool}
        setInsertTool={setInsertTool}
        onDuplicateSelected={setDuplicateSelected}
        onDeleteSelected={onDeleteSelected}
        onClearAll={onClearAll}
        onImportFile={onImportFile}
        onDownloadJsonFile={onDownloadJsonFile}
        onOpenJsonModal={onExportJson}
      />

      <div style={{ display: "flex", gap: 8, padding: "10px 0" }}>
        <Button
          variant="contained"
          onClick={() => openSaveModal(canOverwrite ? "overwrite" : "copy")}
          style={{ flex: 1 }}
        >
          저장
        </Button>
        {/* <Button
          variant="contained"
          onClick={() => openSaveModal("copy")}
          style={{ flex: 1 }}
        >
          다른 이름으로 저장
        </Button> */}
      </div>

      {/* ===== Save Modal ===== */}
      <Dialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {saveMode === "overwrite" && canOverwrite
            ? "패턴 저장(덮어쓰기)"
            : "새 패턴 저장"}
        </DialogTitle>

        <DialogContent sx={{ display: "grid", gap: 1.5, pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            fullWidth
            size="small"
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={3}
          />

          {canOverwrite && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveMode === "overwrite"}
                  onChange={e =>
                    setSaveMode(e.target.checked ? "overwrite" : "copy")
                  }
                />
              }
              label="현재 커스텀 패턴 덮어쓰기"
            />
          )}

          <Typography variant="caption" color="text.secondary">
            originPatternId: {resolvedOriginPatternId ?? "null"}
          </Typography>

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="text" onClick={() => setSaveOpen(false)}>
            취소
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {saveMode === "overwrite" && canOverwrite
              ? "덮어쓰기 저장"
              : "새로 저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </Aside>
  );
}
