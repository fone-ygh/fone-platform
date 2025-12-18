// src/features/editor/components/panels/RightPanel.tsx
"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { Button, Label, Switch } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { useLayoutActions, useLayoutStore } from "@/shared/store/layout";
import {
  usePatternActions,
  usePatternStore,
} from "@/shared/store/pattern/store";

import useCurrentAreaSection from "../../hooks/useCurrentAreaSection";
import { useCurrentPatternMeta } from "../../hooks/useCurrentPatternMeta";
import { LayoutCard } from "./right/LayoutCard";
import CellSettingArea from "@/features/table/components/CellSettingArea";
import { useTableSettingStore } from "@/features/table/store/tableSettingStore";
import { Spreadsheet } from "@jspreadsheet-ce/react";
import { useJspreadSheetStore } from "@/features/table/store/jspreadSheetStore";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import TableSettingArea from "@/features/table/components/TableSettingArea";
import MergeButtonArea from "@/features/table/components/MergeButtonArea";
import ExtraButtonArea from "@/features/table/components/ExtraButtonArea";

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

/* ---------------- Dialogs ---------------- */

type SavePatternDialogProps = {
  open: boolean;
  title: string;
  description: string;
  error?: string | null;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
};

function SavePatternDialog({
  open,
  title,
  description,
  error,
  onChangeTitle,
  onChangeDescription,
  onClose,
  onSave,
}: SavePatternDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>새 패턴 저장</DialogTitle>

      <DialogContent sx={{ display: "grid", gap: 1.5, pt: 1 }}>
        <TextField
          label="Title"
          value={title}
          onChange={e => onChangeTitle(e.target.value)}
          autoFocus
          fullWidth
          size="small"
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => onChangeDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={3}
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="text" onClick={onClose}>
          취소
        </Button>
        <Button variant="contained" onClick={onSave}>
          새로 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- RightPanel ---------------- */

export default function RightPanel() {
  const { areaSection, areaType, isDetailMode } = useCurrentAreaSection();
  /* -------- router / url params -------- */
  const router = useRouter();
  const params = useParams();
  const editorId = String((params as any)?.id ?? "");
  const searchParams = useSearchParams();
  const originPatternId = searchParams.get("originPatternId"); // string | null
  const { title: pageTitle, setTitle: setPageTitle } = useCurrentPatternMeta();
  /* -------- layout -------- */
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

  const { spreadsheet } = useJspreadSheetStore();
console.log("spreadsheet : ", spreadsheet);
  /* -------- patterns (zustand) -------- */
  const { addPattern } = usePatternActions();

  /* -------- selection -------- */
  const selectedOne = React.useMemo(() => {
    if (selectedIds.length !== 1) return null;
    return sections.find(s => s.id === selectedIds[0]) ?? null;
  }, [sections, selectedIds]);

  const hasSelection = selectedIds.length > 0;

  /* -------- handlers: clear / delete -------- */
  const handleClearAll = React.useCallback(() => {
    if (!sections.length) return;
    if (!window.confirm("모든 컴포넌트를 삭제할까요?")) return;

    setSections([]);
    setSelectedIds([]);
    setCommitAfterTransform?.();
  }, [sections.length, setSections, setSelectedIds, setCommitAfterTransform]);

  const handleDeleteSelected = React.useCallback(() => {
    if (!selectedIds.length) return;
    if (!window.confirm(`선택된 ${selectedIds.length}개 항목을 삭제할까요?`))
      return;

    setDeleteSelected();
    setSelectedIds([]);
    setCommitAfterTransform?.();
  }, [selectedIds, setDeleteSelected, setSelectedIds, setCommitAfterTransform]);

  /* -------- JSON export/import -------- */
  const downloadJsonFile = React.useCallback(() => {
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

  const importJsonFile = React.useCallback(() => {
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

          if (!Array.isArray(nextSections)) {
            throw new Error("sections가 배열이 아닙니다.");
          }

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

  /* -------- Save modal -------- */
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const openSaveModal = React.useCallback(() => {
    setSaveError(null);
    setTitle("");
    setDescription("");
    setSaveOpen(true);
  }, []);

  const closeSaveModal = React.useCallback(() => setSaveOpen(false), []);

  const handleSave = React.useCallback(() => {
    const t = title.trim();
    if (!t) {
      setSaveError("제목(title)을 입력해주세요.");
      return;
    }

    const payload = {
      title: t,
      description: description.trim(),
      canvasWidth,
      canvasHeight,
      sections,
      originPatternId, // string|null
    };

    const savedId = addPattern(payload);
    setPageTitle(t);
    closeSaveModal();

    // 저장 후 URL 갱신 (id = 저장된 커스텀패턴)
    if (editorId) {
      router.replace(
        buildEditorUrl(editorId, savedId, payload.originPatternId),
      );
      alert("저장되었습니다.");
    }
  }, [
    title,
    description,
    canvasWidth,
    canvasHeight,
    sections,
    originPatternId,
    addPattern,
    editorId,
    router,
    closeSaveModal,
    setPageTitle,
  ]);

  return (
    <Aside position="right" defaultWidth={340} minWidth={0} maxWidth={560}>
      {isDetailMode === false && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: "10px",
            }}
          >
            <label htmlFor="" style={{ flexShrink: 0 }}>
              페이지명 :
            </label>
            <TextField
              size="small"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              sx={{ "& input": { fontWeight: "bold" } }}
            />
          </div>
          {/* selection lock */}
          {selectedOne && (
            <>
              <h3 style={{ margin: "12px 0 6px" }}>{selectedOne.title}</h3>
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Label>Lock</Label>
                  <Switch
                    checked={!!selectedOne.lock}
                    onChange={(e: any) =>
                      setLock(selectedOne.id, e.target.checked)
                    }
                  />
                </div>
              </div>
            </>
          )}
          {/* layout card */}
          {/* layout card 공통적으로 쓸 수 있게 수정해야함 */}
          <LayoutCard
            selectedCount={selectedIds.length}
            hasSelection={hasSelection}
            sectionsLength={sections.length}
            insertTool={insertTool}
            setInsertTool={setInsertTool}
            onDuplicateSelected={setDuplicateSelected}
            onDeleteSelected={handleDeleteSelected}
            onClearAll={handleClearAll}
            onImportFile={importJsonFile}
            onDownloadJsonFile={downloadJsonFile}
          />
          
          {/* save */}
          <div style={{ display: "flex", gap: 8, padding: "10px 0" }}>
            <Button
              variant="contained"
              onClick={openSaveModal}
              style={{ flex: 1 }}
            >
              저장
            </Button>
          </div>

          {/* dialogs */}
          <SavePatternDialog
            open={saveOpen}
            title={title}
            description={description}
            error={saveError}
            onChangeTitle={setTitle}
            onChangeDescription={setDescription}
            onClose={closeSaveModal}
            onSave={handleSave}
          />
        </>
      )}

      {/* search 영역일 때만 보이는 설정 */}
      {isDetailMode && areaType === "search" && (
        <div>검색 영역 전용 옵션들...</div>
      )}

      {/* grid 영역일 때만 보이는 설정 */}
      {isDetailMode && areaType === "grid" && (
        <div>
          <div>그리드 영역 전용 옵션들...</div>
          {/* 셀 설정 영역 */}
          {spreadsheet && 
           <AccordionCard
            title="Cell Setting"
            allowMultiple
            defaultOpenAll
            hideControls
            items={[
              {
                id: "cell-setting",
                title: "선택 셀 설정",
                content: <CellSettingArea spreadsheet={spreadsheet as unknown as React.RefObject<Spreadsheet>} />,
              },
              {
                id: "table-setting",
                title: "테이블 설정",
                content: <TableSettingArea />,
              },
              {
                id: "table-merge-setting",
                title: "셀 병합 설정",
                content: <MergeButtonArea />,
              },
              {
                id: "extra-button-area",
                title: "추가 버튼 영역",
                content: <ExtraButtonArea />,
              },
            ]}
          />
          }
        </div>
      )}

      {/* single 영역일 때만 보이는 설정 */}
      {isDetailMode && areaType === "single" && (
        <div>싱글 영역 전용 옵션들...</div>
      )}

      {/* tab 영역일 때만 보이는 설정 */}
      {isDetailMode && areaType === "tab" && <div>탭 영역 전용 옵션들...</div>}
    </Aside>
  );
}
