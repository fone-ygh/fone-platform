import { Section } from "../layout";

// 화면 패턴 메타
export interface ScreenPattern {
  id: string;
  title: string;
  description: string;
}

/**
 * 실제 저장되는 사용자 정의 패턴 모델
 */
export interface CustomPattern extends ScreenPattern {
  originPatternId?: string | null;

  canvasWidth?: number;
  canvasHeight?: number;

  sections?: Section[];

  createdAt?: string;
  updatedAt?: string;
}

/** 에디터 상단에 보여줄 현재 패턴 메타 정보 */
export interface PatternMeta {
  title: string;
  description: string;
  /** 현재 편집 중인 패턴 id (custom_... / null) */
  patternId: string | null;
  /** 빌트인/원본 패턴 id (p3-1 / custom_... / null) */
  originPatternId: string | null;
}

export interface PatternState {
  customPatterns: CustomPattern[];
  meta: PatternMeta;
  actions: {
    addPattern: (
      p: Omit<CustomPattern, "id" | "createdAt" | "updatedAt">,
    ) => string;

    removeCustomPattern: (id: string) => void;

    updateCustomPattern: (
      id: string,
      patch: Partial<Omit<CustomPattern, "id">>,
    ) => void;

    clearCustomPatterns: () => void;

    /** 상단 페이지명/설명/패턴 id 등을 패치 */
    setMeta: (patch: Partial<PatternMeta>) => void;
  };
}
