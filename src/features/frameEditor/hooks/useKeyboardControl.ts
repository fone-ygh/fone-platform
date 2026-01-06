import { useEffect } from "react";

import { useContentLayoutActions, useContentLayoutStore } from "@/shared/store";

export function useKeyboardControl() {
  const { selectedIds, sections } = useContentLayoutStore();
  const { setDeleteSelected, setSelectedIds } = useContentLayoutActions();

  useEffect(() => {
    const isLock = sections.filter(item => item.lock === true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLock && e.key === "Delete") {
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
  }, [setDeleteSelected, setSelectedIds, selectedIds, sections]);
}
