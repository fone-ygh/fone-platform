"use client";

import { DesignSystemProvider } from "fone-design-system_v1";

import EmotionProvider from "@/shared/providers/emotion-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <EmotionProvider>
      <DesignSystemProvider>{children}</DesignSystemProvider>
    </EmotionProvider>
  );
}
