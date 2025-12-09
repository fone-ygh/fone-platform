import type {
  GridSection,
  SearchSection,
  Section,
  SectionType,
  SingleSection,
  TabSection,
} from "./types";

/** Editor와 일치시키면 혼란이 줄어든다. */
export const DEFAULT_CANVAS_WIDTH = 1920;
export const DEFAULT_CANVAS_HEIGHT = 1080;

/** 공통 레이아웃 상수 */
const SEARCH_HEIGHT = 140;
const GAP = 20;

/** 섹션용 고유 id 문자열을 만드는 함수 */
const uid = () =>
  `sec_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;

/**
 * 타입별 기본값
 * - init으로 주는 값은 기본을 덮어쓴다.
 * - z는 외부에서 계산해서 주입 (store에서 maxZ + 1)
 */
export function createSection(
  type: SectionType,
  z: number,
  init: Partial<Section> = {},
): Section {
  const base: Section = {
    id: uid(),
    type,
    x: 0,
    y: 0,
    width: 320,
    height: 200,
    z,
    lock: false,

    rotate: 0,
    radius: 0,
    shadow: 0,
    title: capitalize(type),
    bg: "#ffffff",
    color: "#0f172a",
    parentId: null,
  };

  const merged = { ...base, ...init } as Section;
  merged.x = toInt(merged.x, 0);
  merged.y = toInt(merged.y, 0);
  merged.width = Math.max(1, toInt(merged.width, base.width));
  merged.height = Math.max(1, toInt(merged.height, base.height));
  merged.rotate = toInt(merged.rotate ?? 0, 0);
  merged.radius = toInt(merged.radius ?? 0, 0);
  merged.shadow = toInt(merged.shadow ?? 0, 0);
  merged.z = toInt(z, 0);

  return merged;
}

/**
 * 패턴별 레이아웃 생성 함수
 *
 * patternId 예시
 *  - "blank"
 *  - "p1-1"  : Single Detail
 *  - "p2-1"  : Multi Detail (R)
 *  - "p2-2"  : Multi Detail (C)
 *  - "p3-1"  : Master Detail (1:n)
 *  - "p3-2"  : Master Detail (n:1)
 *  - "p3-3"  : Master Detail (n:n)
 *  - "p4-1"  : Tab
 *  - "p4-2"  : Master / Tab
 *  - "p5-1"  : Shuttle
 *  - "px-1"  : Extra
 *
 *  기존 호환용:
 *  - "search-grid"        → p2-1 과 동일
 *  - "search-single-grid" → p3-1 과 동일
 */
export function createSectionsForPattern(patternId: string): Section[] {
  switch (patternId) {
    case "blank":
      return [];

    // P1-1 Single Detail
    case "p1-1":
      return createP11SingleDetail();

    // P2-1 / P2-2 Multi Detail (R/C) → Search + Grid 한 장
    case "p2-1":
    case "p2-2":
    case "search-grid":
      return createP2MultiDetail();

    // P3-1 Master Detail (1:n) → 좌 Single, 우 Grid
    case "p3-1":
    case "search-single-grid":
      return createP31MasterDetail();

    // P3-2 Master Detail (n:1) → 좌 Grid, 우 Single
    case "p3-2":
      return createP32MasterDetail();

    // P3-3 Master Detail (n:n) → 좌/우 모두 Grid
    case "p3-3":
      return createP33MasterDetail();

    // P4-1 Tab → Search + Tab
    case "p4-1":
      return createP41Tab();

    // P4-2 Master / Tab → Search + Single + Tab
    case "p4-2":
      return createP42MasterTab();

    // P5-1 Shuttle → Search + 2 Grid
    case "p5-1":
      return createP51Shuttle();

    // PX-1 Extra → 전체 단일 영역
    // case "px-1":
    //   return createPX1Extra();

    default:
      return [];
  }
}

/* ------------------ 각 패턴 레이아웃 구현 ------------------ */

function createP11SingleDetail(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  // 상단 Search
  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  // 하단 Single
  sections.push(
    createSection("single", z++, {
      title: "Single",
      x: 0,
      y: SEARCH_HEIGHT + GAP,
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT - (SEARCH_HEIGHT + GAP),
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP2MultiDetail(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  sections.push(
    createSection("grid", z++, {
      title: "Grid",
      x: 0,
      y: contentTop,
      width: DEFAULT_CANVAS_WIDTH,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP31MasterDetail(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;
  const leftWidth = Math.round(DEFAULT_CANVAS_WIDTH * 0.35);
  const rightWidth = DEFAULT_CANVAS_WIDTH - leftWidth - GAP;

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  // 좌측 Single (1)
  sections.push(
    createSection("single", z++, {
      title: "Single (1)",
      x: 0,
      y: contentTop,
      width: leftWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  // 우측 Grid (n)
  sections.push(
    createSection("grid", z++, {
      title: "Grid (n)",
      x: leftWidth + GAP,
      y: contentTop,
      width: rightWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP32MasterDetail(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;
  const rightWidth = Math.round(DEFAULT_CANVAS_WIDTH * 0.35);
  const leftWidth = DEFAULT_CANVAS_WIDTH - rightWidth - GAP;

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  // 좌측 Grid (n)
  sections.push(
    createSection("grid", z++, {
      title: "Grid (n)",
      x: 0,
      y: contentTop,
      width: leftWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  // 우측 Single (1)
  sections.push(
    createSection("single", z++, {
      title: "Single (1)",
      x: leftWidth + GAP,
      y: contentTop,
      width: rightWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP33MasterDetail(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;
  const halfWidth = Math.floor((DEFAULT_CANVAS_WIDTH - GAP) / 2);

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  // 좌측 Grid (n)
  sections.push(
    createSection("grid", z++, {
      title: "Grid (n)",
      x: 0,
      y: contentTop,
      width: halfWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  // 우측 Grid (n)
  sections.push(
    createSection("grid", z++, {
      title: "Grid (n)",
      x: halfWidth + GAP,
      y: contentTop,
      width: DEFAULT_CANVAS_WIDTH - (halfWidth + GAP),
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP41Tab(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  sections.push(
    createSection("tab", z++, {
      title: "Tab",
      x: 0,
      y: contentTop,
      width: DEFAULT_CANVAS_WIDTH,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP42MasterTab(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;
  const masterHeight = Math.round(contentHeight * 0.45);
  const tabHeight = contentHeight - masterHeight - GAP;

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  // 상단 Single / Grid 영역
  sections.push(
    createSection("single", z++, {
      title: "Single / Grid",
      x: 0,
      y: contentTop,
      width: DEFAULT_CANVAS_WIDTH,
      height: masterHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  // 하단 Tab 영역
  sections.push(
    createSection("tab", z++, {
      title: "Tab",
      x: 0,
      y: contentTop + masterHeight + GAP,
      width: DEFAULT_CANVAS_WIDTH,
      height: tabHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createP51Shuttle(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  const contentTop = SEARCH_HEIGHT + GAP;
  const contentHeight = DEFAULT_CANVAS_HEIGHT - contentTop;

  // 가운데 버튼 영역 폭 (취향껏 조절 가능)
  const CENTER_WIDTH = 80;

  // 전체: [좌 Grid] GAP [버튼] GAP [우 Grid]
  const leftWidth = Math.floor(
    (DEFAULT_CANVAS_WIDTH - CENTER_WIDTH - GAP * 2) / 2,
  );
  const rightWidth = DEFAULT_CANVAS_WIDTH - leftWidth - CENTER_WIDTH - GAP * 2;

  sections.push(
    createSection("search", z++, {
      title: "Search",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: SEARCH_HEIGHT,
      bg: "#f8fafc",
      lock: true,
    }),
  );

  // 좌측 Grid
  sections.push(
    createSection("grid", z++, {
      title: "Grid (L)",
      x: 0,
      y: contentTop,
      width: leftWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  // 가운데 Shuttle 버튼 영역 (여기에 >, <, >>, << 같은 버튼 배치)
  const centerX = leftWidth + GAP;
  sections.push(
    createSection("single", z++, {
      title: "Shuttle Controls",
      x: centerX,
      y: contentTop,
      width: CENTER_WIDTH,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  // 우측 Grid
  sections.push(
    createSection("grid", z++, {
      title: "Grid (R)",
      x: centerX + CENTER_WIDTH + GAP,
      y: contentTop,
      width: rightWidth,
      height: contentHeight,
      bg: "#ffffff",
      lock: true,
    }),
  );

  return sections;
}

function createPX1Extra(): Section[] {
  let z = 1;
  const sections: Section[] = [];

  sections.push(
    createSection("single", z++, {
      title: "EXTRA",
      x: 0,
      y: 0,
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      bg: "#f8fafc",
    }),
  );

  return sections;
}

/* ------------------ utils (local) ------------------ */
function toInt(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}
function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
