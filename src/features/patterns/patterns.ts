// 화면 패턴 메타
export interface ScreenPattern {
  id: string;
  name: string;
  description?: string;
}

// 실제 패턴 목록
export const SCREEN_PATTERNS: ScreenPattern[] = [
  {
    id: "p1-1",
    name: "[P1-1] Single Detail",
    description: "상단 검색 + 하단 단일 상세",
  },
  {
    id: "p2-1",
    name: "[P2-1] Multi Detail (R)",
    description: "상단 검색 + 하단 목록(Grid) – 행 기반",
  },
  {
    id: "p2-2",
    name: "[P2-2] Multi Detail (C)",
    description: "상단 검색 + 하단 목록(Grid) – 열/카드 기반",
  },
  {
    id: "p3-1",
    name: "[P3-1] Master Detail (1:n)",
    description: "좌측 단일 상세, 우측 목록(Grid)",
  },
  {
    id: "p3-2",
    name: "[P3-2] Master Detail (n:1)",
    description: "좌측 목록(Grid), 우측 단일 상세",
  },
  {
    id: "p3-3",
    name: "[P3-3] Master Detail (n:n)",
    description: "좌/우 모두 목록(Grid)",
  },
  {
    id: "p4-1",
    name: "[P4-1] Tab",
    description: "상단 검색 + 탭 구성",
  },
  {
    id: "p4-2",
    name: "[P4-2] Master / Tab",
    description: "상단 검색 + 단일/목록 + 하단 탭",
  },
  {
    id: "p5-1",
    name: "[P5-1] Shuttle",
    description: "좌/우 그리드 간 셔틀 이동",
  },
  // {
  //   id: "px-1",
  //   name: "[PX-1] Extra",
  //   description: "특수/커스텀 화면용 단일 영역",
  // },
];
