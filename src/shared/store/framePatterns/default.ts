// src/shared/store/editor/framePattern/default.ts
import type { FramePattern } from "./types";

/**
 * 프레임(쉘) 기본 패턴 목록
 * - 추천2(노드 기반)에서도 “초기 템플릿 선택” 정도로 쓰기 좋음
 * - 실제 레이아웃(nodes)은 frameLayout/defaults에서 생성하거나,
 *   customPatterns에 저장된 nodes를 적용하는 방식으로 가져가면 됨.
 */
export const FRAME_PATTERNS: FramePattern[] = [
  {
    id: "f1-1",
    title: "[F1-1] Shell (Header + Sider + MDI + Content)",
    description: "기본 쉘 구성",
  },
  // {
  //   id: "f1-2",
  //   title: "[F1-2] Header + Content",
  //   description: "헤더 중심, 사이더/MDI 최소화",
  // },
  // {
  //   id: "f1-3",
  //   title: "[F1-3] Sider + Content",
  //   description: "사이더 중심, 헤더/MDI 최소화",
  // },
  // {
  //   id: "fx-1",
  //   title: "[FX-1] Custom",
  //   description: "특수/커스텀 프레임용",
  // },
];
