import {
  AnySection,
  useContentLayoutStore,
} from "@/shared/store/contentLayout";

export default function useCurrentAreaSection() {
  const { sections, scopeParentId, selectedIds } = useContentLayoutStore();
  console.log("sections : ", sections);
  let target: AnySection | null = null;

  if (scopeParentId) {
    // 영역 상세 편집 모드: 드릴인한 섹션이 기준
    target = sections.find(s => s.id === scopeParentId) ?? null;
  } else if (selectedIds.length === 1) {
    // 루트 모드: 한 개만 선택돼 있으면 그 섹션이 기준
    target = sections.find(s => s.id === selectedIds[0]) ?? null;
  }

  return {
    areaSection: target,
    areaType: target?.type ?? null, // "search" | "grid" | "single" | "tab" | null
    isDetailMode: !!scopeParentId, // 영역 상세 편집 모드인지
  };
}
