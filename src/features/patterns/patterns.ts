// src/features/patterns/patterns.ts
export type SectionKind = "search" | "single" | "grid" | "tab";

export interface PatternSectionDef {
  type: SectionKind;
  defaultHeight?: number;
  title?: string;
}

export interface Pattern {
  id: string;
  name: string;
  category?: string; // 조회형 / 상세형 / 탭형 등
  description?: string;
  sections: PatternSectionDef[];
}

// 샘플 패턴들
export const PATTERNS: Pattern[] = [
  {
    id: "search-grid-basic",
    name: "조회 + 목록",
    category: "조회형",
    description: "상단 검색, 하단 그리드 기본 화면",
    sections: [
      { type: "search", defaultHeight: 140, title: "검색영역" },
      { type: "grid", defaultHeight: 360, title: "목록" },
    ],
  },
  {
    id: "search-single-grid",
    name: "조회 + 상세 + 목록",
    category: "조회/상세형",
    description: "검색 후 단건 상세 + 목록을 함께 보는 패턴",
    sections: [
      { type: "search", defaultHeight: 140, title: "검색영역" },
      { type: "single", defaultHeight: 220, title: "상세영역" },
      { type: "grid", defaultHeight: 260, title: "목록" },
    ],
  },
  {
    id: "single-tab",
    name: "상세 + 탭",
    category: "상세/탭형",
    description: "단건 상세 위주, 탭으로 보조 정보를 구성",
    sections: [
      { type: "single", defaultHeight: 220, title: "기본정보" },
      { type: "tab", defaultHeight: 280, title: "탭 영역" },
    ],
  },
  {
    id: "blank",
    name: "빈 화면에서 시작",
    category: "기타",
    description: "아무 패턴 없이 직접 섹션을 배치합니다.",
    sections: [],
  },
];
