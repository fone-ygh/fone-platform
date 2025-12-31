// src/features/screens/model/types.ts
export type ScreenStatus = "draft" | "published" | "archived";

export type Screen = {
  id: string;
  title: string;
  updatedAt: string; // ISO
  status: ScreenStatus;

  /** “어떤 패턴에서 시작했는지”만 UI에 표시하려고 남겨둠 */
  originPatternId?: string | null;
  originPatternTitle?: string | null;
};

export type PatternItem = {
  id: string;
  title: string;
  description?: string;
  kind: "builtin" | "custom";
};
