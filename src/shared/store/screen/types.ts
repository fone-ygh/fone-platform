// src/shared/store/screen/types.ts
import type { AnySection } from "@/shared/store/editor/contentLayout/types";

export type ScreenStatus = "draft" | "published";

export type Screen = {
  id: string;
  title: string;
  status: ScreenStatus;

  originPatternId: string | null;

  canvasWidth: number;
  canvasHeight: number;
  sections: AnySection[];

  createdAt: string;
  updatedAt: string;
};
