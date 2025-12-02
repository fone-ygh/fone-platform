import { useEffect } from "react";

import { useLayoutActions, useLayoutStore } from "@/shared/store";

export function useKeyboardControl() {
  const { selectedIds } = useLayoutStore();
  const { setDeleteSelected, setSelectedIds } = useLayoutActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        e.preventDefault();
        setDeleteSelected();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedIds([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setDeleteSelected, setSelectedIds, selectedIds]);
}
