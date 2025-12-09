import { ScreenDefinition } from "@/features/patterns/types";

export type CustomPattern = ScreenDefinition & {
  id: string; // 'custom_xxx' 이런 식
  createdAt: string;
  updatedAt?: string;
};

export type PatternState = {
  customPatterns: CustomPattern[];
  actions: {
    addPattern: (p: Omit<CustomPattern, "id" | "createdAt">) => string;
    removeCustomPattern: (id: string) => void;
    updateCustomPattern: (id: string, patch: Partial<ScreenDefinition>) => void;
    clearCustomPatterns: () => void;
  };
};
