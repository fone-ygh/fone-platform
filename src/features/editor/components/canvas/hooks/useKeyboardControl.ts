import { useEffect } from "react";

import { useLayoutStore } from "@/shared/store";

export function useKeyboardControl() {
  const { selectedIds } = useLayoutStore();

  const deleteSelected = useLayoutStore(s => s.actions.setDeleteSelected);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelected, selectedIds]);
}
