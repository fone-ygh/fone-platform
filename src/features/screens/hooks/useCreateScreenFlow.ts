// src/features/screens/hooks/useCreateScreenFlow.ts
"use client";

import * as React from "react";

import type { PatternItem } from "../model/types";

type Args = {
  onRouteToNewEditor: (originPatternId: string) => void;
};

export function useCreateScreenFlow({ onRouteToNewEditor }: Args) {
  const [open, setOpen] = React.useState(false);
  const [selectedPattern, setSelectedPattern] =
    React.useState<PatternItem | null>(null);

  const openDialog = React.useCallback(() => setOpen(true), []);
  const closeDialog = React.useCallback(() => setOpen(false), []);

  const onSelectPattern = React.useCallback(
    (p: PatternItem) => {
      setSelectedPattern(p);
      setOpen(false);
      onRouteToNewEditor(p.id);
    },
    [onRouteToNewEditor],
  );

  return {
    open,
    openDialog,
    closeDialog,
    selectedPattern,
    onSelectPattern,
  };
}
