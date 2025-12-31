// src/shared/store/editor/framePattern/types.ts

import type { FrameNodes } from "@/shared/store/editor/frameLayout/types";

/** 프레임 패턴 메타(갤러리/목록용) */
export interface FramePattern {
  id: string;
  title: string;
  description: string;
}

/**
 * 실제 저장되는 사용자 정의 프레임 패턴 모델
 * - content 섹션(Section[])이 아니라 frameLayout의 nodes 스냅샷을 저장
 */
export interface CustomFramePattern extends FramePattern {
  /** 빌트인/원본 프레임 패턴 id */
  originPatternId?: string | null;

  /** 프리뷰 프레임 크기(px) */
  frameWidth?: number;
  frameHeight?: number;

  /** header/sider/mdi/content 노드 스냅샷 */
  nodes?: FrameNodes;

  createdAt?: string;
  updatedAt?: string;
}

/** 에디터 상단에 보여줄 현재 프레임 패턴 메타 정보 */
export interface FramePatternMeta {
  title: string;
  description: string;

  /** 현재 편집 중인 패턴 id (custom_... / null) */
  patternId: string | null;

  /** 빌트인/원본 패턴 id (f1-1 / custom_... / null) */
  originPatternId: string | null;
}

export interface FramePatternState {
  customPatterns: CustomFramePattern[];
  meta: FramePatternMeta;

  actions: {
    addPattern: (
      p: Omit<CustomFramePattern, "id" | "createdAt" | "updatedAt">,
    ) => string;

    removeCustomPattern: (id: string) => void;

    updateCustomPattern: (
      id: string,
      patch: Partial<Omit<CustomFramePattern, "id">>,
    ) => void;

    clearCustomPatterns: () => void;

    /** 상단 페이지명/설명/패턴 id 등을 패치 */
    setMeta: (patch: Partial<FramePatternMeta>) => void;
  };
}
