// src/shared/store/control/types.ts
import { EditorMode } from "./editorMode";

export type EditorActions = {
  setCanvasWidth: (w: number) => void;
  setCanvasHeight: (h: number) => void;

  setZoom: (ext: number | ((prev: number) => number)) => void;
  setCanvasZoom: (next: number | ((prev: number) => number)) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;

  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetPan: () => void;

  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setGridColor: (color: string) => void;

  setSnapToGrid: (snap: boolean) => void;
  setSnapToGuides: (snap: boolean) => void;
  setSnapToElements: (snap: boolean) => void;
  setSnapTolerance: (tol: number) => void;

  setShowRulers: (show: boolean) => void;
  setShowGuides: (show: boolean) => void;

  setEditorMode: (mode: EditorMode) => void;
  resetEditorMode: () => void;
};

export type EditorStore = {
  canvasWidth: number;
  canvasHeight: number;

  /** (선택) 미사용 */
  zoom: number;

  /** 캔버스 전용 줌(%) */
  canvasZoom: number;

  /** 캔버스 전용 팬(px) — zoom-layer에 적용 */
  panX: number;
  panY: number;

  showGrid: boolean;
  gridSize: number;
  gridColor: string;

  snapToGrid: boolean;
  snapToGuides: boolean;
  snapToElements: boolean;
  snapTolerance: number;

  showRulers: boolean;
  showGuides: boolean;

  /** 지금 사용자가 “무엇을 하는지” */
  editorMode: EditorMode;

  actions: EditorActions;
};
