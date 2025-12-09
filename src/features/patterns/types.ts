import { Section } from "@/shared/store";

// src/features/patterns/types.ts
export interface ScreenDefinition {
  id: string;
  title?: string;
  description?: string;

  // 레이아웃 정보
  canvasWidth: number;
  canvasHeight: number;
  sections: Section[];

  // 어떤 기본 패턴에서 나왔는지
  originPatternId?: string;
}
