// src/features/editor/flows/openScreen.ts
"use client";

import { useContentLayoutStore } from "@/shared/store/editor/contentLayout/store";

import { getScreenById } from "../store/screen/store";

export function openScreen(screenId: string) {
  const layout = useContentLayoutStore.getState();
  const screen = getScreenById(screenId);

  layout.actions.setReset();

  if (!screen) {
    // 못 찾으면 빈 화면
    layout.actions.setCanvasSize(1920, 1080);
    layout.actions.setSections([]);
    return;
  }

  layout.actions.setCanvasSize(screen.canvasWidth, screen.canvasHeight);
  layout.actions.setSections(screen.sections as any);
}
