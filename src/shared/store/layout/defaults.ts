// src/shared/store/layout/defaults.ts
import type { Section, SectionType } from "./types";

/** Editor와 일치시키면 혼란이 줄어든다. */
export const DEFAULT_CANVAS_WIDTH = 1920;
export const DEFAULT_CANVAS_HEIGHT = 1080;

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
  // 공통 기본
  const base: Section = {
    id: uid(),
    type,
    x: 0,
    y: 0,
    width: 320,
    height: 200,
    z,
    rotate: 0,
    radius: 0,
    shadow: 0,
    title: capitalize(type),
    bg: "#ffffff",
    color: "#0f172a",
  };

  // 타입별 기본
  switch (type) {
    case "box":
      // 그대로 base 사용
      break;

    case "text":
      base.width = 360;
      base.height = 120;
      base.text = "Lorem ipsum";
      base.textAlign = "left";
      base.title = "Text";
      break;

    case "image":
      base.width = 360;
      base.height = 240;
      base.imageUrl = "https://picsum.photos/seed/fone/720/480"; // 샘플 이미지
      base.objectFit = "cover";
      base.title = "Image";
      break;

    case "button":
      base.width = 160;
      base.height = 48;
      base.btnLabel = "Button";
      base.btnVariant = "contained";
      base.title = "Button";
      break;

    case "tabs":
      base.width = 360;
      base.height = 200;
      base.title = "Tabs";
      base.tabs = [
        { label: "Tab 1", content: "첫 번째" },
        { label: "Tab 2", content: "두 번째" },
      ];
      break;
  }

  // init으로 덮어쓰기
  const merged = { ...base, ...init } as Section;
  // width/height/x/y/rotate 등 숫자 필드가 NaN 되는 걸 방지
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
 * 초기 레이아웃 (header / aside / main / footer)
 * - 모두 type: "box" 로 생성하고 purpose로 역할 지정
 * - 배치 간단히: 상단 헤더, 좌측 사이드, 본문, 하단 푸터
 */
export const INITIAL_SECTIONS: Section[] = [
  // // Header
  // createSection("box", 1, {
  //   id: `header_${uid()}`,
  //   title: "Header",
  //   purpose: "header",
  //   x: 0,
  //   y: 0,
  //   width: DEFAULT_CANVAS_WIDTH,
  //   height: 120,
  //   bg: "#f8fafc", // slate-50
  //   color: "#0f172a",
  //   radius: 0,
  // }),
  // // Aside
  // createSection("box", 2, {
  //   id: `aside_${uid()}`,
  //   title: "Aside",
  //   purpose: "sidebar",
  //   x: 0,
  //   y: 140,
  //   width: 320,
  //   height: 804,
  //   bg: "#f1f5f9", // slate-100
  //   color: "#0f172a",
  //   radius: 0,
  // }),
  // // Main
  // createSection("box", 3, {
  //   id: `main_${uid()}`,
  //   title: "Main",
  //   purpose: "main",
  //   x: 340, // 사이드바(320) + 20px 여백
  //   y: 140,
  //   width: DEFAULT_CANVAS_WIDTH - 340, // 우측까지 꽉
  //   height: 804,
  //   bg: "#ffffff",
  //   color: "#0f172a",
  //   radius: 0,
  // }),
  // // Footer
  // createSection("box", 4, {
  //   id: `footer_${uid()}`,
  //   title: "Footer",
  //   purpose: "footer",
  //   x: 0,
  //   y: 960,
  //   width: DEFAULT_CANVAS_WIDTH,
  //   height: 120,
  //   bg: "#f8fafc",
  //   color: "#0f172a",
  //   radius: 0,
  // }),
];

/* ------------------ utils (local) ------------------ */
function toInt(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}
function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
