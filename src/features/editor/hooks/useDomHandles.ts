// src/features/editor/components/canvas/hooks/useDomHandles.ts
import { useMemo } from "react";

type SectionLike = { id: string };

export function useDomHandles(opts: {
  sections: SectionLike[];
  selectedIds: string[];
  snapToElements: boolean;
}) {
  const { sections, selectedIds, snapToElements } = opts;

  const selectedEls: HTMLElement[] = useMemo(() => {
    if (typeof document === "undefined") return [];
    return selectedIds
      .map(id => document.getElementById(id) as HTMLElement | null)
      .filter((el): el is HTMLElement => !!el);
  }, [selectedIds]);

  const guidelineEls: HTMLElement[] = useMemo(() => {
    if (!snapToElements) return [];
    if (typeof document === "undefined") return [];
    return sections
      .map(s => document.getElementById(s.id) as HTMLElement | null)
      .filter((el): el is HTMLElement => !!el && !selectedIds.includes(el.id));
  }, [sections, selectedIds, snapToElements]);

  return { selectedEls, guidelineEls };
}
